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
        where: { userId: userId }
    })
    return resumes
}

export async function saveResume(userId, file) {
    const resumeCount = await prisma.resume.count({
        where: {userId: userId}
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
            userId: userId,
            fileName: safeBaseName,
            cloudinaryId: uploadResult.public_id,
            resumeText: resumeText.text
        },
        omit: {
            resumeText: true
        }
    });

    return resume;
}

export async function downloadResume(userId, resumeId) {
    const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: userId },
    });

    if (!resume) {
        throw new AppError("Resume not found.", 404);
    }

    const url = cloudinary.url(resume.cloudinaryId, {
        resource_type: 'image',
        type: 'authenticated', // Tells Cloudinary to expect a signature
        sign_url: true,        // Automatically signs the URL with your API Secret
        expires_at: Math.floor(Date.now() / 1000) + 60, // Expires in 60s
    });
    
    return url;
}

export async function getResume(userId, resumeId) {
    const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: userId },
        omit: { resumeText: true}
    });

    if (!resume) {
        throw new AppError("Resume not found.", 404);
    }
    return resume;
}

export async function updateResume(userId, resumeId, file) {

    const existingResume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: userId }
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
        await cloudinary.uploader.destroy(existingResume.cloudinaryId, {
            type: 'authenticated',  
            resource_type: 'image', 
            invalidate: true        
        });
    } catch (cloudError) {
        console.error(`Failed to delete old Cloudinary asset: ${existingResume.cloudinaryId}`, cloudError);
    }

    const parser = new PDFParse({ data: file.buffer });
    const resumeText = await parser.getText();

    const resume = await prisma.resume.update({
        where: {
            id: resumeId
        },
        data: {
            fileName: safeBaseName,
            cloudinaryId: uploadResult.public_id,
            resumeText: resumeText.text
        },
        omit: {
            resumeText: true
        }
    });

    return resume;
    
}

export async function deleteResume(userId, resumeId) {    
    const resume = await prisma.resume.delete({
        where: { id: resumeId, userId: userId },
    });
    
    if (!resume) {
        throw new AppError('Resume not found or unauthorized', 404);
    }

    try {
        await cloudinary.uploader.destroy(resume.cloudinaryId, {
            type: 'authenticated',
            resource_type: 'image',
            invalidate: true
        });
    } catch (cloudError) {
        console.error(`Orphaned Cloudinary asset left behind: ${resume.cloudinaryId}`, cloudError);
    }

    return resume;
}