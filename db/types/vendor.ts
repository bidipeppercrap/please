import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface VendorTable {
    id: Generated<number>
    name: string
}

export type Vendor = Selectable<VendorTable>
export type NewVendor = Insertable<VendorTable>
export type VendorUpdate = Updateable<VendorTable>
