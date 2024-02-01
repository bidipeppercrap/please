import { jwtVerify } from "jose";

interface UserToken {
    username: string
}

export async function verifyUser(token: string): Promise<UserToken | null> {
    try {
        const secret = process.env.AUTH_SECRET
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))

        const user = {
            username: payload.username as string || ''
        }
    
        return user;
    } catch (error) {
        return null
    }
}