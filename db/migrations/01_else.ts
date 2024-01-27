import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('vendor')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar', (col) => col.notNull().unique())
        .execute()
    
    await db.schema
        .createTable('collection')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar', (col) => col.notNull().unique())
        .execute()
    
    await db.schema
        .createTable('product')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar', (col) => col.notNull().unique())
        .addColumn('category_id', 'integer', (col) =>
            col.references('category.id')
            .onDelete('set null')
        )
        .addColumn('collection_id', 'integer', (col) =>
            col.references('collection.id')
            .onDelete('set null')
        )
        .execute()
    
    await db.schema
        .createTable('request')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('reference', 'varchar', (col) => col.unique())
        .addColumn('note', 'text')
        .addColumn('source_document', 'text')
        .addColumn('accepted_at', 'timestamp')
        .addColumn('updated_at', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('vendor_name', 'text')
        .addColumn('vendor_id', 'integer', (col) =>
            col.references('vendor.id')
            .onDelete('set null')
        )
        .execute()
    
    await db.schema
        .createTable('request_product')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('description', 'text', (col) => col.notNull())
        .addColumn('quantity', 'integer', (col) => col.notNull())
        .addColumn('note', 'text')
        .addColumn('order_in_request', 'integer')
        .addColumn('is_section', 'boolean', (col) => col.defaultTo(false))
        .addColumn('request_id', 'integer', (col) =>
            col.references('request.id')
            .onDelete('cascade')
        )
        .addColumn('product_id', 'integer', (col) =>
            col.references('product.id')
            .onDelete('set null')
        )
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('request_product').execute()
    await db.schema.dropTable('request').execute()
    await db.schema.dropTable('products').execute()
    await db.schema.dropTable('vendor').execute()
    await db.schema.dropTable('collection').execute()
}
