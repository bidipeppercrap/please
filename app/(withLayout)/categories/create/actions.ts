'use server'

import { createCategory } from "@/repositories/category"

export async function save(name: string) {
    return await createCategory({ name })
}
