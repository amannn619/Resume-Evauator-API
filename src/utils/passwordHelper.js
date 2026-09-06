import bcrypt from "bcrypt";
import 'dotenv/config';

export async function hashPassword(pasword) {
    return await bcrypt.hash(pasword, parseInt(process.env.SALT_ROUNDS));
}

export async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
}