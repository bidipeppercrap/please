'use server'

import { findCategories } from '@/repositories/category';

export async function find(name: string, pageSize: number) {
    const { data } = await findCategories({ name: name }, pageSize);

    return data
}