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
            refreshToken: refreshToken,
            revoked: false
        },
        include: {
            user: {
                select: {
                    id: true,
                    userName: true
                }
            }
        }
    })
    if (!session) {
        throw new AppError("Invalid token", 401);
    }
    const accessToken = generateAcesssToken(session.user.id);
    return {accessToken, user: session.user}
}

export async function register(userName, password) {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            userName: userName,
            password: hashedPassword
        }
    })
    const accessToken = generateAcesssToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const session = await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken: refreshToken,
            expiresAt: getRefreshTokenExpiry()
        }
    })

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            userName: user.userName
        }
    }
}

export async function login(userName, password) {
    const user = await prisma.user.findUnique({
        where: { userName: userName }
    })
    if (!user || !(await comparePassword(password, user.password))) {
        throw new AppError("Invalid Credentials", 401);
    }
    const accessToken = generateAcesssToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const session = await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken: refreshToken,
            expiresAt: getRefreshTokenExpiry()
        }
    });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            userName: user.userName
        }
    };
}

export async function refresh(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
        throw new AppError("Invalid or expired token signature", 401);
    }

    const session = await prisma.session.findUnique({
        where: { refreshToken: refreshToken }
    });

    if (session && session.revoked) {
        await prisma.session.updateMany({
            where: { userId: session.userId },
            data: { revoked: true }
        });
        throw new AppError("Compromised token detected. All sessions revoked.", 401);
    }
    if (!session || session.expiresAt < new Date()) {
        throw new AppError("Session Invalid", 401)
    }

    await prisma.session.update({
        where: { refreshToken: refreshToken },
        data: {revoked: true}
    });

    const accessToken = generateAcesssToken(session.userId);
    const newRefreshToken = generateRefreshToken(session.userId);

    await prisma.session.create({
        data: {
            userId: session.userId,
            refreshAt: getRefreshTokenExpiry()
        }
    })
    return { accessToken, refreshToken: newRefreshToken }
}

export async function logout(refreshToken) {
    await prisma.session.update({
        where: { refreshToken: refreshToken },
        data: {revoked: true}
    })
}