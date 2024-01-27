'use server'

import { db } from '@/db/database'
import { Product } from '@/db/types/product'
import { NewRequestProduct, RequestProduct, RequestProductDetail, RequestProductUpdate } from '@/db/types/request_product'
import { formatISO } from 'date-fns'

export async function moveProductToRequest(products: Product[], requestId: number) {
    return await db.transaction().execute(async (transaction) => {
        const lastInOrder = await transaction.selectFrom('request_product')
                .where('request_id', '=', requestId)
                .selectAll()
                .orderBy('order_in_request desc')
                .executeTakeFirst() as RequestProduct
        
        let lastOrder = lastInOrder ? lastInOrder.order_in_request || 0 : 0

        const modified: NewRequestProduct[] = products.map(p => {
            lastOrder++

            return {
                description: p.name,
                quantity: 1,
                is_section: false,
                product_id: p.id,
                request_id: requestId,
                order_in_request: lastOrder
            }
        })

        const result = await transaction.insertInto('request_product')
            .values(modified)
            .returningAll()
            .execute()
        
        await transaction.updateTable('request')
        .set({
            updated_at: formatISO(Date.now())
        })
        .where('id', '=', requestId)
        .execute()
        
        return result
    })
}

export async function createRequestProduct(requestProducts: NewRequestProduct[]) {
    return await db.insertInto('request_product')
        .values(requestProducts)
        .returningAll()
        .execute()
}

export async function createRequestProductWithOrdering(requestProduct: NewRequestProduct) {
    if (!requestProduct.request_id) return
    
    return await db
        .transaction()
        .execute(async (transaction) => {
            const toInsert = {...requestProduct}

            const last = await transaction
                .selectFrom('request_product')
                .where('request_id', '=', requestProduct.request_id!)
                .selectAll()
                .orderBy('order_in_request desc')
                .executeTakeFirst()
            
            if (!last) toInsert.order_in_request = 1
            else toInsert.order_in_request = last.order_in_request ? last.order_in_request + 1 : 1

            await transaction
                .insertInto('request_product')
                .values(toInsert)
                .returningAll()
                .execute()
            
            await transaction.updateTable('request')
                .set({
                    updated_at: formatISO(Date.now())
                })
                .where('id', '=', requestProduct.request_id!)
                .execute()
        })
}

export async function deleteRequestProduct(ids: number[]) {
    return await db.deleteFrom('request_product')
        .where('id', 'in', ids)
        .returningAll()
        .execute()
}

export async function deleteRequestProductWithOrdering(id: number) {
    return await db.transaction().execute(async (transaction) => {
        const deleted = await transaction.deleteFrom('request_product')
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst()
        
        if (!deleted) return

        await transaction.updateTable('request_product')
            .set((eb) => ({
                order_in_request: eb('order_in_request', '-', 1)
            }))
            .where('request_id', '=', deleted.request_id)
            .where('order_in_request', '>', deleted.order_in_request)
            .execute()
        
        await transaction.updateTable('request')
        .set({
            updated_at: formatISO(Date.now())
        })
        .where('id', '=', deleted.request_id)
        .execute()
    })
}

export async function updateRequestProductWithOrdering(id: number, updateWith: RequestProductUpdate) {
    return await db.transaction().execute(async (transaction) => {
        const { order_in_request: newOrder, ...toUpdate } = updateWith

        await transaction.updateTable('request_product')
            .set(toUpdate)
            .where('id', '=', id)
            .execute()

        const before = await transaction.selectFrom('request_product')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst()
        
        if (!before) return

        if (!newOrder || !updateWith.request_id) return
        if (before.order_in_request === newOrder) return

        const lastInOrder = await transaction.selectFrom('request_product')
                .where('request_id', '=', updateWith.request_id)
                .selectAll()
                .orderBy('order_in_request desc')
                .executeTakeFirst() as RequestProduct
        
        let finalOrder = newOrder

        if (lastInOrder && lastInOrder.order_in_request && newOrder > lastInOrder.order_in_request)
            finalOrder = lastInOrder.order_in_request
        
        if ((finalOrder && !before.order_in_request) || finalOrder < before.order_in_request!)
            await transaction.updateTable('request_product')
                .set((eb) => ({
                    order_in_request: eb('order_in_request', '+', 1)
                }))
                .where('request_id', '=', updateWith.request_id!)
                .where('order_in_request', '>=', finalOrder)
                .where('order_in_request', '<', before.order_in_request)
                .execute()
        
        if ((finalOrder && !before.order_in_request) || finalOrder > before.order_in_request!)
            await transaction.updateTable('request_product')
                .set((eb) => ({
                    order_in_request: eb('order_in_request', '-', 1)
                }))
                .where('request_id', '=', updateWith.request_id!)
                .where('order_in_request', '<=', finalOrder)
                .where('order_in_request', '>', before.order_in_request)
                .execute()

        await transaction.updateTable('request_product')
            .set({ order_in_request: finalOrder })
            .where('id', '=', id)
            .execute()
        
        await transaction.updateTable('request')
            .set({
                updated_at: formatISO(Date.now())
            })
            .where('id', '=', updateWith.request_id!)
            .execute()
    })
}

export async function findRequestProduct(
    criteria: Partial<RequestProduct>,
    pageSize: number | null = 25,
    pageNumber = 1,
    orderBy: 'description' | 'order_in_request' = 'order_in_request'
) {
    return await db
        .transaction()
        .execute(async (transaction) => {
            let query = transaction.selectFrom('request_product')
                .leftJoin('product', 'product.id', 'request_product.product_id')

            if (criteria.description) {
                const words = criteria.description.trim().split(' ')

                words.forEach(word => query = query.where('description', 'ilike', `%${word}%`))
            }

            if (criteria.request_id) {
                query = query.where('request_id', '=', criteria.request_id)
            }
            if (!criteria.request_id) {
                query = query
                    .where('is_section', '=', false)
                    .where('request_id', 'is', null)
            }

            let requestProductsQuery = query.select([
                'request_product.id as id',
                'request_product.description as description',
                'request_product.note as note',
                'request_product.quantity as quantity',
                'request_product.unit as unit',
                'request_product.is_section as is_section',
                'request_product.order_in_request as order_in_request',
                'request_product.request_id as request_id',
                'request_product.product_id as product_id',
                'product.name as product_name'
            ])
            .orderBy(orderBy)

            if (pageSize !== null) {
                requestProductsQuery = requestProductsQuery
                    .limit(pageSize)
                    .offset(pageSize * (pageNumber - 1))
            }

            const requestProducts = await requestProductsQuery
                .execute() as RequestProductDetail[]
            
            const { count } = await query
                .select(eb => eb.fn.countAll().as('count'))
                .executeTakeFirstOrThrow()
            
            return {
                data: requestProducts,
                count: Number(count)
            }
        })
}

export async function moveWaitlistToRequest(waitlist: RequestProduct[], requestId: number) {
    await db.transaction().execute(async (transaction) => {
        const lastInOrder = await transaction.selectFrom('request_product')
                .where('request_id', '=', requestId)
                .selectAll()
                .orderBy('order_in_request desc')
                .executeTakeFirst() as RequestProduct
        
        let lastOrder = lastInOrder ? lastInOrder.order_in_request || 0 : 0

        for (const w of waitlist) {
            await transaction.updateTable('request_product')
            .set({
                request_id: requestId,
                order_in_request: lastOrder + 1
            })
            .where('id', '=', w.id)
            .execute()

            lastOrder++
        }
        
        await transaction.updateTable('request')
        .set({
            updated_at: formatISO(Date.now())
        })
        .where('id', '=', requestId)
        .execute()
    })
}

export async function moveRequestToWaitlist(requestProducts: RequestProduct[], requestId: number) {
    const ids = requestProducts.map(i => i.id)

    await db.transaction().execute(async (transaction) => {
        await transaction.updateTable('request_product')
        .set({
            request_id: null,
            order_in_request: null
        })
        .where('request_id', '=', requestId)
        .where('id', 'in', ids)
        .execute()

        await transaction.updateTable('request')
            .set({
                updated_at: formatISO(Date.now())
            })
            .where('id', '=', requestId)
            .execute()
    })

    
}

export async function moveRequestToRequest(requestProducts: RequestProduct[], oldRequestId: number, newRequestId: number) {
    return await db.transaction().execute(async (transaction) => {
        const lastInOrder = await transaction.selectFrom('request_product')
            .where('request_id', '=', newRequestId)
            .selectAll()
            .orderBy('order_in_request desc')
            .executeTakeFirst() as RequestProduct
        
        let lastOrder = lastInOrder ? lastInOrder.order_in_request || 0 : 0

        for (let product of requestProducts) {
            await transaction.updateTable('request_product as first')
                .set((eb) => ({
                    order_in_request: eb('first.order_in_request', '-', 1)
                }))
                .where(({ eb, and }) => and([
                    eb(
                        'first.order_in_request',
                        '>',
                        eb.selectFrom('request_product as second')
                            .select('second.order_in_request as order_in_request')
                            .where('second.id', '=', product.id)
                    ),
                    eb('first.request_id', '=', oldRequestId)
                ]))
                .execute()

            await transaction.updateTable('request_product')
                .set({
                    request_id: newRequestId,
                    order_in_request: lastOrder + 1
                })
                .where('id', '=', product.id)
                .execute()

            lastOrder++
        }

        await transaction.updateTable('request')
            .set({
                updated_at: formatISO(Date.now())
            })
            .where(eb => eb.or([
                eb('id', '=', newRequestId),
                eb('id', '=', oldRequestId)
            ]))
            .execute()
    })
}