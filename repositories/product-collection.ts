'use server'

import { db } from '@/db/database'
import { ProductCollectionExtended } from '@/db/types/product_collection'

export async function deleteProductCollection(productId: number, collectionId: number) {
    await db.deleteFrom('product_collection')
        .where('product_id', '=', productId)
        .where('collection_id', '=', collectionId)
        .execute()
}

export async function findProductCollection(criteria: Partial<ProductCollectionExtended>, pageSize = 25, pageNumber = 1) {
    return await db.transaction().execute(async (transaction) => {
        let query = transaction.selectFrom('product_collection')
            .innerJoin('product', 'product.id', 'product_collection.product_id')

        if (criteria.name) {
            const words = criteria.name.trim().split(' ')

            words.forEach(word => query = query.where('description', 'ilike', word))
        }

        if (criteria.collection_id) {
            query = query.where('collection_id', '=', criteria.collection_id)
        }

        const result = await query
            .selectAll()
            .orderBy('description')
            .limit(pageSize)
            .offset(pageSize * (pageNumber - 1))
            .execute()
        
        const products: ProductCollectionExtended[] = [...result]

        const { count } = await query
            .select(eb => eb.fn.countAll().as('count'))
            .executeTakeFirstOrThrow()

        return {
            data: products,
            count: Number(count)
        }
    })
}