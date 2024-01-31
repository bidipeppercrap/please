import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('product_collection')
        .addColumn('description', 'text')
        .addColumn('note', 'text')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('product_collection')
        .dropColumn('description')
        .dropColumn('note')
        .execute()
}
