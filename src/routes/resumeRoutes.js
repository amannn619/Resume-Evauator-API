import { Router } from "express";
import * as resumeController from "../controllers/resumeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { evaluateResumeSchema } from "../utils/schemas.js";

const router = Router();

router.get("/", authMiddleware, resumeController.getAllResumes);
router.post("/", uploadMiddleware, authMiddleware, resumeController.saveResume);
router.get('/download/:id', authMiddleware, resumeController.downloadResume);
router.get("/:id", authMiddleware, resumeController.getResume);
router.delete("/:id", authMiddleware, resumeController.deleteResume);
router.post("/evaluateSavedResume/:id", authMiddleware, validateRequest(evaluateResumeSchema), resumeController.evaluateSavedResume);
router.post("/evaluateResume", uploadMiddleware, validateRequest(evaluateResumeSchema), resumeController.evaluateResume);

export default router;
