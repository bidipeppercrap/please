'use server'

import { db } from "@/db/database";
import { Category, NewCategory } from "@/db/types/category";

export async function findCategoryById(id: number) {
    return await db.selectFrom('category')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst()
}

export async function createCategory(category: NewCategory) {
    return await db.insertInto('category')
        .values(category)
        .returningAll()
        .executeTakeFirstOrThrow()
}

export async function deleteCategory(id: number) {
    await db.deleteFrom('category')
        .where('id', '=', id)
        .execute()
}

export async function findCategories(criteria: Partial<Category>, pageSize: number = 10, pageNumber: number = 1) {
    return await db.transaction().execute(async (transaction) => {
        let query = transaction.selectFrom('category')
    
        if (criteria.name) {
            const words = criteria.name.trim().split(' ');
    
            words.forEach(word =>
                query = query.where('name', 'ilike', `%${word}%`)
            )
        }

        const categories = await query
            .selectAll()
            .orderBy('name')
            .limit(pageSize)
            .offset(pageSize * (pageNumber - 1))
            .execute()

        const { count } = await query
            .select(eb => eb.fn.countAll().as('count'))
            .executeTakeFirstOrThrow()

        return {
            data: categories,
            count: Number(count)
        }
    })
}
