'use server'

import { findProduct } from '@/repositories/product';

export async function find(name: string, pageSize: number) {
    const result = await findProduct({ name: name }, pageSize);

    return result
}