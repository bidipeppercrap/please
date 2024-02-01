'use server'

import { createProduct, findProduct } from '@/repositories/product'

export async function save(name: string, category_id: number | null) {
    await createProduct({ name, category_id })
}

export async function find(name: string) {
    const result = await findProduct({ name: name });

    return result
}