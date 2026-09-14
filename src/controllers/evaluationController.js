import { PDFParse } from "pdf-parse";
import { evaluateWithAI } from "../services/aiService.js";
import * as evaluationService from "../services/evaluationService.js";
import AppResponse from "../utils/appResponse.js";

export async function getAllEvaluations(req, res) {
    const userId = parseInt(req.user.id);
    const evaluations = await evaluationService.getAllEvaluations(userId);
    return new AppResponse(res, evaluations);
}

export async function evaluateSavedResume(req, res) {   
    // #swagger.tags = ['evaluation'] 
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);
    const description = req.body.description;
    const evaluation = await evaluationService.evaluateSavedResume(userId, resumeId, description);
    return new AppResponse(res, evaluation)
};

export async function evaluateResume(req, res) {
    // #swagger.tags = ['resume']
    const description = req.body.description;
    const parser = new PDFParse({data: req.file.buffer});
    const resumeText = await parser.getText();

    if (!resumeText.text || resumeText.text.trim().length === 0) {
        throw new AppError('Could not extract text. Please ensure the PDF is text-based.', 400);
    }

    const evaluation = await evaluateWithAI(resumeText.text, description);
    return new AppResponse(res, evaluation)
};
