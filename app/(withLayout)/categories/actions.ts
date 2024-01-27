'use server'

import { findCategories } from '@/repositories/category';

export async function find(name: string, pageSize: number) {
    const result = await findCategories({ name: name }, pageSize);

    return result
}