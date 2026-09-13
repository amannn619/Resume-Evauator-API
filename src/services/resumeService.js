import fs from 'fs/promises';
import prisma from './db.js';
import { AppError } from '../utils/appError.js';
import { PDFParse } from 'pdf-parse';
import path from 'path';

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

export async function getResume(userId, resumeId) {
    const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
        select: {
            file_name: true
        }
    });

    if (!resume || !resume.file_name) {
        throw new AppError("File does not exist.", 404);
    }
    const filePath = path.join(process.cwd(), 'uploads', String(userId), String(resumeId), `${resume.file_name}.pdf`);
    try {
        await fs.access(filePath);
    } catch (err) {
        throw new AppError('File no longer exists on the server', 404);
    }
    return filePath;
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