import 'dotenv/config';
import * as authService from "../services/authService.js";
import { AppError } from "../utils/appError.js";
import AppResponse from "../utils/appResponse.js";

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 3600 * 1000,
    path: '/'
}

export async function me(req, res) {
    // #swagger.tags = ['auth']
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        throw new AppError("Refresh token missing", 401);
    }
    const { accessToken, user } = await authService.me(refreshToken);
    return new AppResponse(res, { accessToken, user });
}

export async function register(req, res) {
    // #swagger.tags = ['auth']
    const { userName, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.register(userName, password)
    res.cookie('refresh_token', refreshToken, cookieOptions)
    return new AppResponse(res, {accessToken, user}, null, 201)
}
export async function login(req, res) {
    // #swagger.tags = ['auth']
    const { userName, password } = req.body;

    const existingRefreshToken = req.cookies.refresh_token;
    if (existingRefreshToken) {
        try {
            await authService.logout(existingRefreshToken);
        }
        catch {
            
        }
    }
    const { accessToken, refreshToken, user } = await authService.login(userName, password);
    res.cookie('refresh_token', refreshToken, cookieOptions);
    return new AppResponse(res, { accessToken, user }, null, 201);
};

export async function refresh(req, res, next) {
    // #swagger.tags = ['auth']
    try {
        const currRefreshToken = req.cookies.refresh_token;
        if (!currRefreshToken) {
            throw new AppError("No refresh token provided.", 401);
        }
        const { accessToken, refreshToken} = await authService.refresh(currRefreshToken);
        res.cookie('refresh_token', refreshToken, cookieOptions);
        return new AppResponse(res, { accessToken }, null, 201);
    }
    catch(err) {
        res.clearCookie('refresh_token', cookieOptions);
        next(err);
    }
}

export async function logout(req, res, next) {
    // #swagger.tags = ['auth']
    try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            return new AppResponse(res, null, "Already logged out")
        }
        await authService.logout(refreshToken);
        res.clearCookie('refresh_token', cookieOptions);
        return new AppResponse(res, null, "Logged out successfully.")
    }
    catch(err) {
        res.clearCookie('refresh_token', cookieOptions);
        next(err)
    }
}