import AppResponse from "../utils/appResponse.js";
import * as resumeService from "../services/resumeService.js";

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