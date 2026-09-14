import { PDFParse } from "pdf-parse";
import AppResponse from "../utils/appResponse.js";
import { evaluateWithAI } from "../services/aiService.js";
import * as resumeService from "../services/resumeService.js";
import { AppError } from "../utils/appError.js";

export async function getAllResumes(req, res) {
    // #swagger.tags = ['resume']
    const userId = req.user.id;
    const resumes = await resumeService.getAllResumes(userId);
    return new AppResponse(res, resumes);
};

export async function saveResume(req, res) {
    // #swagger.tags = ['resume']
    const userId = req.user.id;
    const file = req.file;
    const resume = await resumeService.saveResume(userId, file);
    return new AppResponse(res, resume, null, 201);
};

export async function downloadResume(req, res) {
    // #swagger.tags = ['resume']
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);
    const url = await resumeService.downloadResume(userId, resumeId);
    return new AppResponse(res, {url})
};

export async function getResume(req, res) {
    // #swagger.tags = ['resume']
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);
    const resume = await resumeService.getResume(userId, resumeId);
    return new AppResponse(res, resume);
};

export async function updateResume(req, res) {
    // #swagger.tags = ['resume']
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);
    const file = req.file;
    const resume = await resumeService.updateResume(userId, resumeId, file);
    return new AppResponse(res, resume, null, 200);
};


export async function deleteResume(req, res) {
    // #swagger.tags = ['resume']
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);
    await resumeService.deleteResume(userId, resumeId)
    return new AppResponse(res, null, "Resume Deleted Successfully");
};

export async function evaluateSavedResume(req, res) {   
    // #swagger.tags = ['resume'] 
    const userId = req.user.id;
    const resumeId = parseInt(req.params.id);
    const description = req.body.description;
    const evaluation = await resumeService.evaluateSavedResume(userId, resumeId, description);
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
