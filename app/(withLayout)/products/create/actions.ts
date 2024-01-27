'use server'

import { createProduct, findProduct } from '@/repositories/product'

export async function save(name: string, category_id: number | null) {
    const result = await createProduct({ name, category_id })

    return result
}

export async function find(name: string) {
    const result = await findProduct({ name: name });

    return result
}