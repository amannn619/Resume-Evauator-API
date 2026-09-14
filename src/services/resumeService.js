import fs from 'fs/promises';
import prisma from './db.js';
import { AppError } from '../utils/appError.js';
import { PDFParse } from 'pdf-parse';
import path from 'path';
import cloudinaryPkg from 'cloudinary';
import streamifier from 'streamifier';
import 'dotenv/config';
import { evaluateWithAI } from './aiService.js';

const cloudinary = cloudinaryPkg.v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getAllResumes(userId) {
    const resumes = await prisma.resume.findMany({
        where: { user_id: userId }
    })
    return resumes.map((resume) => {
        return {
            id: resume.id,
            userId: resume.user_id,
            fileName: resume.file_name,
            cloudinaryId: resume.cloudinary_id,
            createdAt: resume.created_at,
            updatedAt: resume.updated_at,
        }
    })
}

export async function saveResume(userId, file) {
    const resumeCount = await prisma.resume.count({
        where: {user_id: userId}
    })

    if (resumeCount >= 5) {
        throw new AppError('Maximum limit of 5 resumes reached.', 400);
    }

    if (!file) {
        throw new AppError('No resume file provided.', 400);
    }

    
    const safeBaseName = file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_\.]/g, "_");

    const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                type: 'authenticated',
                folder: `resumes/${userId}`,
                format: 'pdf',
                public_id: safeBaseName
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
    })


    const parser = new PDFParse({ data: file.buffer });
    const resumeText = await parser.getText();

    const resume = await prisma.resume.create({
        data: {
            user_id: userId,
            file_name: safeBaseName,
            cloudinary_id: uploadResult.public_id,
            resume_text: resumeText.text
        }
    });

    return {
        id: resume.id,
        userId: resume.user_id,
        fileName: resume.file_name,
        cloudinaryId: resume.cloudinary_id,
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
    };
}

export async function downloadResume(userId, resumeId) {
    const resume = await prisma.resume.findUnique({
        where: { id: resumeId, user_id: userId },
    });

    if (!resume) {
        throw new AppError("Resume not found.", 404);
    }

    const url = cloudinary.url(resume.cloudinary_id, {
        resource_type: 'image',
        type: 'authenticated', // Tells Cloudinary to expect a signature
        sign_url: true,        // Automatically signs the URL with your API Secret
        expires_at: Math.floor(Date.now() / 1000) + 60, // Expires in 60s
    });
    
    return url;
}

export async function getResume(userId, resumeId) {
    const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
    });

    if (!resume) {
        throw new AppError("Resume not found.", 404);
    }
    return {
        id: resume.id,
        userId: resume.user_id,
        fileName: resume.file_name,
        cloudinaryId: resume.cloudinary_id,
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
    };
}

export async function updateResume(userId, resumeId, file) {

    const existingResume = await prisma.resume.findFirst({
        where: { id: resumeId, user_id: userId }
    });

    if (!existingResume) {
        throw new AppError("Resume not found or unauthorized", 404);
    }

    const safeBaseName = file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_\.]/g, "_");

    const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                type: 'authenticated',
                folder: `resumes/${userId}`,
                format: 'pdf',
                public_id: safeBaseName
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
    });

    try {
        await cloudinary.uploader.destroy(existingResume.cloudinary_id, {
            type: 'authenticated',  
            resource_type: 'image', 
            invalidate: true        
        });
    } catch (cloudError) {
        console.error(`Failed to delete old Cloudinary asset: ${existingResume.cloudinary_id}`, cloudError);
    }

    const parser = new PDFParse({ data: file.buffer });
    const resumeText = await parser.getText();

    const resume = await prisma.resume.update({
        where: {
            id: resumeId
        },
        data: {
            file_name: safeBaseName,
            cloudinary_id: uploadResult.public_id,
            resume_text: resumeText.text
        }
    });

    return {
        id: resume.id,
        userId: resume.user_id,
        fileName: resume.file_name,
        cloudinaryId: resume.cloudinary_id,
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
    };
    
}

export async function deleteResume(userId, resumeId) {    
    const resume = await prisma.resume.delete({
        where: { id: resumeId, user_id: userId },
    });
    
    if (!resume) {
        throw new AppError('Resume not found or unauthorized', 404);
    }

    try {
        await cloudinary.uploader.destroy(resume.cloudinary_id, {
            type: 'authenticated',
            resource_type: 'image',
            invalidate: true
        });
    } catch (cloudError) {
        console.error(`Orphaned Cloudinary asset left behind: ${resume.cloudinary_id}`, cloudError);
    }

    return resume;
}

export async function evaluateSavedResume(userId, resumeId, description) {
    const resume = await prisma.resume.findUnique({
        where: { id: resumeId, user_id: userId }
    });
    if (!resume) {
        throw new AppError("Resume not found.", 404);
    }
    const evaluation = await evaluateWithAI(resume.resume_text, description);
    const score = parseInt(evaluation.score);
    if (!Number.isNaN(score)) {
        await prisma.evaluation.create({
            data: {
                user_id: userId,
                resume_id: resumeId,
                job_title: evaluation.job_title || 'Unspecified Role',
                job_description: description,
                score: score,
            }
        })
    }
    return evaluation;
}