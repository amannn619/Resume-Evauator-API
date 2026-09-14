import { Router } from "express";
import * as evaluationController from "../controllers/evaluationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { evaluateResumeSchema } from "../utils/schemas.js";
const router = Router();

router.post("/evaluateResume", uploadMiddleware, validateRequest(evaluateResumeSchema), evaluationController.evaluateResume);

router.use(authMiddleware);
router.get('/', evaluationController.getAllEvaluations);
router.post("/evaluateSavedResume/:id", validateRequest(evaluateResumeSchema), evaluationController.evaluateSavedResume);

export default router;
