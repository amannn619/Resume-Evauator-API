import 'dotenv/config';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

export function generateJwtToken(data, expiry = '1m') {
    return jwt.sign(data, jwtSecret, { expiresIn: expiry });
}

export function generateAcesssToken(userId) {
    return jwt.sign({ id: userId }, accessSecret, { expiresIn: '1m' });
}

export function generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, refreshSecret, { expiresIn: "7d" });
}

export function verifyJwtToken(token) {
    try{
        const decoded = jwt.verify(token, jwtSecret);
        return decoded;
    }
    catch{
        return null;
    }
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