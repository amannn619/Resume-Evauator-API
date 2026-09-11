import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { userSchema } from "../utils/schemas.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = Router();

router.get('/me', authController.me);
router.post('/register', validateRequest(userSchema), authController.register);
router.post('/login', validateRequest(userSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;