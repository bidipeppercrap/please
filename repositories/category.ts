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

export async function findCategories(criteria: Partial<Category>, pageSize: number = 10, pageNumber: number = 1) {
    let query = db.selectFrom('category')

    if (criteria.name) {
        const words = criteria.name.trim().split(' ');

        words.forEach(word =>
            query = query.where('name', 'ilike', `%${word}%`)
        )
    }

    return await query
        .selectAll()
        .limit(pageSize)
        .execute()
}
