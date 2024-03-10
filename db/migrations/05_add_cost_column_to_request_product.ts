import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('request_product')
        .addColumn('cost', 'numeric(13, 5)', (col) => col.defaultTo(0))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('request_product')
        .dropColumn('cost')
        .execute()
}
