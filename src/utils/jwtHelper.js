import 'dotenv/config';
import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

export function generateAcesssToken(userId) {
    return jwt.sign({ id: userId }, accessSecret, { expiresIn: '1m' });
}

export function generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, refreshSecret, { expiresIn: "7d" });
}

export function verifyAccessToken(token) {
    try{
        const decoded = jwt.verify(token, accessSecret);
        return decoded;
    }
    catch{
        return null;
    }
}

export function verifyRefreshToken(token) {
    try{
        const decoded = jwt.verify(token, refreshSecret);
        return decoded;
    }
    catch{
        return null;
    }
}