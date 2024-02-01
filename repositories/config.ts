'use server'

import { createClient } from '@vercel/kv'

export const db = createClient({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!
})

export interface HeaderConfig {
    name: string
    phone: string
    phoneUrl: string
    email: string
}

export async function saveHeader(header: HeaderConfig) {
    await db.hset('header', {...header})
}

export async function fetchHeader(): Promise<HeaderConfig | null> {
    const data = await db.hgetall('header')

    if (data) return {
        name: data.name as string || '',
        phone: data.phone as string || '',
        phoneUrl: data.phoneUrl as string || '',
        email: data.email as string || ''
    }

    return null
}