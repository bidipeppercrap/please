import { CategoryTable } from './category'
import { ProductTable } from './product'
import { RequestTable } from './request'
import { RequestProductTable } from './request_product'
import { VendorTable } from './vendor'

export interface Database {
    category: CategoryTable
    product: ProductTable
    vendor: VendorTable
    request: RequestTable
    request_product: RequestProductTable
}
