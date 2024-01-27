import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ProductTable {
    id: Generated<number>
    name: string
    category_id: number | null
}

export type Product = Selectable<ProductTable>
export type NewProduct = Insertable<ProductTable>
export type ProductUpdate = Updateable<ProductTable>
