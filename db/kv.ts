import { createClient } from '@vercel/kv'

import 'dotenv/config'

export const db = createClient({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!
})