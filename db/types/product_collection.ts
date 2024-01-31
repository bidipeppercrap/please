import { Insertable, Selectable, Updateable } from "kysely";
import { Product } from "./product";

export interface ProductCollectionTable {
    product_id: number
    collection_id: number
    description: string
    note: string
}

export type ProductCollection = Selectable<ProductCollectionTable>
export type NewProductCollection = Insertable<ProductCollectionTable>
export type ProductCollectionUpdate = Updateable<ProductCollectionTable>

export type ProductCollectionExtended = ProductCollection & Product