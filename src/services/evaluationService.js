import { evaluateWithAI } from "./aiService.js";
import prisma from "./db.js";

export async function getAllEvaluations(userId) {
    const evaluations = await prisma.evaluation.findMany({
        where: { userId: userId },
        orderBy : {createdAt: 'asc'},
        include: {
            resume: {
                select: {
                    id: true,
                    fileName: true
                }
            }
        }
    })
    return evaluations;
}

export async function evaluateSavedResume(userId, resumeId, description) {
    const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: userId }
    });
    if (!resume) {
        throw new AppError("Resume not found.", 404);
    }
    const evaluation = await evaluateWithAI(resume.resumeText, description);
    const score = parseInt(evaluation.score);
    console.log(evaluation)
    if (!Number.isNaN(score)) {
        await prisma.evaluation.create({
            data: {
                userId: userId,
                resumeId: resumeId,
                jobTitle: evaluation.jobTitle || 'Unspecified Role',
                jobDescription: description,
                score: score,
                aiResponse: evaluation
            }
        })
    }
    return evaluation;
}