'use server'

import { comparePassword, hashPassword, signUser } from "@/auth"
import { db } from "@/db/kv"
import { cookies } from "next/headers"

export interface User {
    username: string
    password: string
}

export async function logout() {
    cookies().delete('session')
}

export async function login(user: User) {
    const fetched = await db.hgetall('root')

    if (!fetched) throw new Error("Can't get any user!")

    const parsed = {
        username: fetched.username as string || '',
        password: fetched.password as string || ''
    }

    if (parsed.username !== user.username) throw new Error('No user found')

    const passwordMatch = await comparePassword(user.password, parsed.password)

    if (!passwordMatch) throw new Error('Wrong password')

    const encryptedSession = await signUser({
        username: parsed.username
    })

    cookies().set('session', encryptedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
    })
}

export async function saveRoot(root: User) {
    const exist = await isRootExists()

    if (exist) return

    const hashed = await hashPassword(root.password)

    await db.hset('root', {
        username: root.username,
        password: hashed
    })
}

export async function isRootExists(): Promise<boolean> {
    const root = await db.hgetall('root')

    if (root) return true
    return false
}

export async function getRoot(username: string): Promise<User | null> {
    const root = await db.hgetall('root')

    if (!root) return null
    if (root.username === username) return {
        username: root.username as string,
        password: root.password as string
    }

    return null
}