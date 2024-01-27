import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface RequestProductTable {
    id: Generated<number>
    description: string
    quantity: number
    unit: string | null
    note: string | null
    order_in_request: number | null
    is_section: boolean
    request_id: number | null
    product_id: number | null
}

export type RequestProduct = Selectable<RequestProductTable>
export type NewRequestProduct = Insertable<RequestProductTable>
export type RequestProductUpdate = Updateable<RequestProductTable>

export type RequestProductDetail = RequestProduct & {
    product_name: string
}