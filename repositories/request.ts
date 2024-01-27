'use server'

import { db } from '@/db/database'
import { Request, NewRequest, RequestUpdate } from '@/db/types/request'

export async function createRequest(request: NewRequest) {
    return await db.insertInto('request')
        .values(request)
        .returningAll()
        .executeTakeFirstOrThrow()
}

export async function updateRequest(id: number, updateWith: RequestUpdate) {
    await db.updateTable('request').set(updateWith).where('id', '=', id).execute()
}

export async function deleteRequest(id: number) {
    return await db.deleteFrom('request')
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst()
}

export async function findRequestById(id: number) {
    return await db.selectFrom('request')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst()
}

export async function findRequest(criteria: Partial<Request>, pageSize = 25, pageNumber = 1, excludeId: number | null = null) {
    return await db
        .transaction()
        .execute(async (transaction) => {
            let query = transaction.selectFrom('request')

            if (criteria.vendor_name) {
                const words = criteria.vendor_name.trim().split(' ')

                words.forEach(word => query = query.where('vendor_name', 'ilike', `%${word}%`))
            }
            
            if (criteria.reference) {
                const words = criteria.reference.trim().split(' ')

                words.forEach(word =>
                    query = query.where((eb) => eb.or([
                        eb('reference', 'ilike', `%${word}%`),
                        eb('source_document', 'ilike', `%${word}%`)
                    ]))
                )
            }

            if (excludeId) query = query.where('id', '!=', excludeId)

            const requests = await query
                .selectAll()
                .orderBy('vendor_name')
                .orderBy('reference', 'desc')
                .orderBy('source_document', 'desc')
                .limit(pageSize)
                .offset(pageSize * (pageNumber - 1))
                .execute()
            
            const { count } = await query
                .select(eb => eb.fn.countAll().as('count'))
                .executeTakeFirstOrThrow()
            
            return {
                data: requests,
                count: Number(count)
            }
        })
}

export async function getLastRequestId(): Promise<number> {
    const result = await db
        .selectFrom('request')
        .select('id')
        .orderBy('id', 'desc')
        .executeTakeFirst()

    return result ? result.id : 0
}
