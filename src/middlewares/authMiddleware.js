import { AppError } from "../utils/appError.js";
import { verifyAccessToken } from "../utils/jwtHelper.js";

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError("Unauthorized: Missing or invalid token format.", 401);
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload) {
        throw new AppError("TOKEN_EXPIRED", 401);
    }
    req.user = { id: payload.id };
    next();
}