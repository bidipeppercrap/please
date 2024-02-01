import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import 'dotenv/config'

const saltRound = 10

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, saltRound)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
}

export function encrypt(data: any) {
    return jwt.sign(data, process.env.AUTH_SECRET!)
}

export function decrypt(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET!)

        return decoded
    } catch (error) {
        throw error
    }
}

import { SignJWT } from 'jose';

interface User {
    username: string
}

export async function signUser(user: User): Promise<string> {
    const secret = process.env.AUTH_SECRET
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + (60 * 60 * 24 * 30)

    return new SignJWT({...user})
        .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(new TextEncoder().encode(secret));
}
