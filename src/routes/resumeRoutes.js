import { Router } from "express";
import * as resumeController from "../controllers/resumeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import { evaluateResumeSchema } from "../utils/schemas.js";

const router = Router();

router.get("/", authMiddleware, resumeController.getAllResumes);
router.get('/:id/ticket', authMiddleware, resumeController.getDownloadTicket)
router.get("/download/:token", resumeController.downloadResume)
router.get("/:id", authMiddleware, resumeController.getResume);
router.post("/", uploadMiddleware, authMiddleware, resumeController.saveResume);
router.delete("/", authMiddleware, resumeController.deleteAllResumes);
router.delete("/:id", authMiddleware, resumeController.deleteResume);
// router.post("/evaluate", authMiddleware, resumeController.evaluateAllResume);
router.post("/evaluateResume", uploadMiddleware, validateRequest(evaluateResumeSchema), resumeController.evaluateResume);

export default router;
