import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('request')
        .addColumn('starred', 'boolean', (col) => col.defaultTo(false))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('request')
        .dropColumn('starred')
        .execute()
}
