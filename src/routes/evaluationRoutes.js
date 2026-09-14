import { Router } from "express";
import * as evaluationCoontroller from "../controllers/evaluationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();

router.use(authMiddleware);

router.get('/', evaluationCoontroller.getAllEvaluations);

export default router;
