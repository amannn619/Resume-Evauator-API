import fs from 'fs/promises';
import prisma from './db.js';
import { AppError } from '../utils/appError.js';
import { PDFParse } from 'pdf-parse';
import path from 'path';
import { generateJwtToken, verifyJwtToken } from '../utils/jwtHelper.js';

export async function getAllResumes(userId) {
    const resumes = await prisma.resume.findMany({
        where: { user_id: userId }
    })
    return resumes.map((resume) => {
        return {
            id: resume.id,
            userId: resume.user_id,
            createdAt: resume.created_at,
            fileName: resume.file_name
        }
    })
}

export async function getDownloadTicket(userId, resumeId) {
    const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
    });

    if (!resume) {
        throw new AppError("Resume not found.", 404);
    }

    const jwtToken = generateJwtToken({ userId, resumeId });
    const url = `/api/resume/download/${jwtToken}`;
    return url;
}

export async function downloadResume(token) {
    if (!token) {
        throw new AppError("Invalid URL", 400);
    }

    const decoded = verifyJwtToken(token);
    if (!decoded) {
        throw new AppError("Invalid token signature", 400);
    }

    const resume = await prisma.resume.findUnique({
        where: {id: decoded.resumeId}
    })
    const filePath = path.join(process.cwd(), 'uploads', String(decoded.userId), String(decoded.resumeId), `${resume.file_name}.pdf`);
    return { filePath, fileName: `${resume.file_name}.pdf` };
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
        createdAt: resume.created_at,
        fileName: resume.file_name
    };
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
    
    const resume = await prisma.resume.create({
        data: {
            user_id: userId,
            file_name: safeBaseName
        }
    });

    const baseDir = path.join(process.cwd(), 'uploads', String(userId), String(resume.id));
    const parser = new PDFParse({ data: file.buffer });
    const resumeText = await parser.getText();

    await fs.mkdir(baseDir, { recursive: true });
    const pdfPath = path.join(baseDir, `${safeBaseName}.pdf`);
    const txtPath = path.join(baseDir, `${safeBaseName}.txt`);

    await Promise.all([
        fs.writeFile(pdfPath, file.buffer),
        fs.writeFile(txtPath, resumeText.text, 'utf8')
    ]);

    return {
        id: resume.id,
        userId: resume.user_id,
        createdAt: resume.created_at,
        fileName: resume.file_name
    };
}

export async function deleteResume(userId, resumeId) {    
    const deletedRecord = await prisma.resume.deleteMany({
        where: { id: resumeId, user_id: userId },
    });
    if (deletedRecord.count === 0) {
        throw new AppError('Resume not found or unauthorized', 404);
    }

    const resumeDirPath = path.join(process.cwd(), 'uploads', String(userId), String(resumeId));

    try {
        await fs.rm(resumeDirPath, { 
            recursive: true,
            force: true
        });
    } catch (error) {
        console.error(`Failed to delete folder from disk: ${resumeDirPath}`, error);
    }
    return deletedRecord;
}