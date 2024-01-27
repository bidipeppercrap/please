'use server'

import { db } from '@/db/database'
import { NewProduct, Product } from '@/db/types/product'

export async function createProduct(product: NewProduct) {
    return await db.insertInto('product')
        .values(product)
        .returningAll()
        .executeTakeFirstOrThrow()
}

export async function deleteProduct(id: number) {
    return await db.deleteFrom('product').where('id', '=', id)
        .returningAll()
        .executeTakeFirst()
}

export async function deleteProductBulk(ids: number[]) {
    return await db.deleteFrom('product').where('id', 'in', ids)
        .returningAll()
        .execute()
}

export async function findProduct(
    criteria: Partial<Product>,
    pageSize: number = 10,
    pageNumber: number = 1,
    specialCase: 'all' | 'unlisted' = 'all'
) {
    return await db
        .transaction()
        .execute(async (transaction) => {
            let query = transaction.selectFrom('product')

            if (criteria.name) {
                const words = criteria.name.trim().split(' ');

                words.forEach(word =>
                    query = query.where('name', 'ilike', `%${word}%`)
                )
            }

            if (criteria.category_id) {
                query = query.where('category_id', '=', criteria.category_id)
            }

            if (specialCase === 'unlisted')
                query = query.where(({ eb, not, exists, selectFrom }) =>
                    not(exists(
                        selectFrom('request_product')
                            .select('request_product.id')
                            .where('request_product.product_id', '=', eb.ref('product.id'))
                            .where(({ eb, or, and }) => or([
                                and([
                                    eb('request_product.is_section', '=', false),
                                    eb('request_product.request_id', 'is', null)
                                ]),
                                eb(
                                    'request_product.request_id',
                                    'in',
                                    eb.selectFrom('request')
                                        .select('request.id')
                                        .where('request.id', '=', eb.ref('request_product.request_id'))
                                        .where('request.accepted_at', 'is', null)
                                )
                            ]))
                    ))
                )

            const products = await query
                .selectAll()
                .orderBy('name')
                .limit(pageSize)
                .offset(pageSize * (pageNumber - 1))
                .execute()
            
            const { count } = await query
                .select((eb) =>
                    eb.fn.countAll().as('count')
                )
                .executeTakeFirstOrThrow()
            
            return {
                data: products,
                count: Number(count)
            }
        })
}