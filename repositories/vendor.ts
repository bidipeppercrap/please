'use server'

import { db } from '@/db/database'
import { NewVendor, Vendor, VendorUpdate } from '@/db/types/vendor'

export async function createVendor(vendor: NewVendor) {
    return await db.insertInto('vendor')
        .values(vendor)
        .returningAll()
        .executeTakeFirstOrThrow()
}

export async function updateVendor(id: number, updateWith: VendorUpdate) {
    await db.updateTable('vendor').set(updateWith).where('id', '=', id).execute()
}

export async function deleteVendor(id: number) {
    return await db.deleteFrom('vendor').where('id', '=', id)
        .returningAll()
        .executeTakeFirst()
}

export async function findVendorById(id: number) {
    return await db.selectFrom('vendor')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()
}

export async function findVendor(criteria: Partial<Vendor>, pageSize = 10, pageNumber = 1) {
    return await db
        .transaction()
        .execute(async (transaction) => {
            let query = transaction.selectFrom('vendor')

            if (criteria.name) {
                const words = criteria.name.trim().split(' ')

                words.forEach(word => query = query.where('name', 'ilike', `%${word}%`))
            }

            const vendors = await query
                .selectAll()
                .orderBy('name')
                .limit(pageSize)
                .offset(pageSize * (pageNumber - 1))
                .execute()
            
            const { count } = await query
                .select((eb) => eb.fn.countAll().as('count'))
                .executeTakeFirstOrThrow()
            
            return {
                data: vendors,
                count: Number(count)
            }
        })
}
