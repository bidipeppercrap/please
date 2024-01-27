import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('request_product')
        .addColumn('unit', 'text')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
}
