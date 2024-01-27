import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('category')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar', (col) => col.notNull().unique())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('category').execute()
}
