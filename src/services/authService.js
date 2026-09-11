import { AppError } from "../utils/appError.js";
import { generateAcesssToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwtHelper.js";
import { hashPassword, comparePassword } from "../utils/passwordHelper.js";
import prisma from "./db.js";

function getRefreshTokenExpiry() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
}

export async function me(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
        throw new AppError("Invalid token", 401);
    }
    const session = await prisma.session.findUnique({
        where: {
            refresh_token: refreshToken,
            revoked: false
        },
        include: {
            user: {
                select: {
                    id: true,
                    user_name: true
                }
            }
        }
    })
    if (!session) {
        throw new AppError("Invalid token", 401);
    }
    const accessToken = generateAcesssToken(session.user.user_id);
    return {accessToken, user: {
        id: session.user.id,
        username: session.user.user_name
    }}
}

export async function register(username, password) {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            user_name: username,
            password: hashedPassword
        }
    })
    const accessToken = generateAcesssToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const session = await prisma.session.create({
        data: {
            user_id: user.id,
            refresh_token: refreshToken,
            expires_at: getRefreshTokenExpiry()
        }
    })
    console.log(session)

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            username: user.user_name
        }
    }
}

export async function login(username, password) {
    const user = await prisma.user.findUnique({
        where: { user_name: username }
    })
    if (!user || !(await comparePassword(password, user.password))) {
        throw new AppError("Invalid Credentials", 401);
    }
    const accessToken = generateAcesssToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const session = await prisma.session.create({
        data: {
            user_id: user.id,
            refresh_token: refreshToken,
            expires_at: getRefreshTokenExpiry()
        }
    });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            username: user.user_name
        }
    };
}

export async function refresh(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
        throw new AppError("Invalid or expired token signature", 401);
    }

    const session = await prisma.session.findUnique({
        where: { refresh_token: refreshToken }
    });

    if (session && session.revoked) {
        await prisma.session.updateMany({
            where: { user_id: session.user_id },
            data: { revoked: true }
        });
        throw new AppError("Compromised token detected. All sessions revoked.", 401);
    }
    if (!session || session.expires_at < new Date()) {
        throw new AppError("Session Invalid", 401)
    }

    await prisma.session.update({
        where: { refresh_token: refreshToken },
        data: {revoked: true}
    });

    const accessToken = generateAcesssToken(session.user_id);
    const newRefreshToken = generateRefreshToken(session.user_id);

    await prisma.session.create({
        data: {
            user_id: session.user_id,
            refresh_token: newRefreshToken,
            expires_at: getRefreshTokenExpiry()
        }
    })
    return { accessToken, refreshToken: newRefreshToken }
}

export async function logout(refreshToken) {
    await prisma.session.update({
        where: { refresh_token: refreshToken },
        data: {revoked: true}
    })
}