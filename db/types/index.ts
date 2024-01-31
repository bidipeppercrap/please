import { CategoryTable } from './category'
import { CollectionTable } from './collection'
import { ProductTable } from './product'
import { ProductCollectionTable } from './product_collection'
import { RequestTable } from './request'
import { RequestProductTable } from './request_product'
import { VendorTable } from './vendor'

export interface Database {
    category: CategoryTable
    product: ProductTable
    vendor: VendorTable
    request: RequestTable
    request_product: RequestProductTable
    collection: CollectionTable
    product_collection: ProductCollectionTable
}
