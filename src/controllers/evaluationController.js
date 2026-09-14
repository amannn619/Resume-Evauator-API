import * as evaluationService from "../services/evaluationService.js";
import AppResponse from "../utils/appResponse.js";

export async function getAllEvaluations(req, res) {
    const userId = parseInt(req.user.id);
    const evaluations = await evaluationService.getAllEvaluations(userId);
    return new AppResponse(res, evaluations);
}