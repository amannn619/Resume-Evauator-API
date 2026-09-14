import prisma from "./db.js";

export async function getAllEvaluations(userId) {
    const evaluations = await prisma.evaluation.findMany({
        where: { userId: userId },
        orderBy : {createdAt: 'desc'}

    })
    return evaluations;
}