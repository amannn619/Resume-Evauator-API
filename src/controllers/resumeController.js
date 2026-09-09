import { PDFParse } from "pdf-parse";
import AppResponse from "../utils/appResponse.js";
import { evaluateWithAI } from "../services/aiService.js";

export function getAllResumes(req, res) {
    
};

export function getResume(req, res) {
    
};

export function saveResume(req, res) {
    
};

export function deleteAllResumes(req, res){
    
};

export function deleteResume(req, res){
    
};

export function evaluateAllResume(req, res) {
    
}

export async function evaluateResume(req, res) {
    // #swagger.tags = ['auth']
    const description = req.body.description;
    const parser = new PDFParse({data: req.file.buffer});
    const resumeText = await parser.getText();

    if (!resumeText.text || resumeText.text.trim().length === 0) {
        throw new AppError('Could not extract text. Please ensure the PDF is text-based.', 400);
    }

    const evaluation = await evaluateWithAI(resumeText.text, description);
    console.log(evaluation)
    return new AppResponse(res, evaluation)
};
