import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('product_collection')
        .addColumn('collection_id', 'integer', (col) =>
            col.references('collection.id').onDelete('cascade').notNull()
        )
        .addColumn('product_id', 'integer', (col) =>
            col.references('product.id').onDelete('cascade').notNull()
        )
        .execute()
    
    await db.schema
        .alterTable('product')
        .dropColumn('collection_id')
        .execute()
    
    await db.schema
        .createIndex('product_collection_id_unique_index')
        .on('product_collection')
        .columns(['collection_id', 'product_id'])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('product_collection').execute()
}
