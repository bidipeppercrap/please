'use server'

import { db } from '@/db/database'
import { Collection, NewCollection } from '@/db/types/collection'

export async function createCollection(collection: NewCollection) {
    return await db.insertInto('collection')
        .values(collection)
        .returningAll()
        .executeTakeFirstOrThrow()
}

export async function deleteCollection(id: number) {
    await db.deleteFrom('collection')
        .where('id', '=', id)
        .execute()
}

export async function findCollections(criteria: Partial<Collection>, pageSize = 10, pageNumber = 1) {
    return await db.transaction().execute(async (transaction) => {
        let query = transaction.selectFrom('collection')

        if (criteria.name) {
            const words = criteria.name.trim().split(' ')

            words.forEach(word => query = query.where('name', 'ilike', `%${word}%`))
        }

        const collections = await query
            .selectAll()
            .orderBy('name')
            .limit(pageSize)
            .offset(pageSize * (pageNumber - 1))
            .execute()
        
        const { count } = await query
            .select(eb => eb.fn.countAll().as('count'))
            .executeTakeFirstOrThrow()
        
        return {
            data: collections,
            count: Number(count)
        }
    })
}