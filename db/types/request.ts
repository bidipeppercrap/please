import { Generated, Insertable, Selectable, Updateable, ColumnType } from 'kysely';

export interface RequestTable {
    id: Generated<number>
    reference: string
    note: string | null
    source_document: string | null
    accepted_at: ColumnType<Date, string | undefined, string | null>
    updated_at: ColumnType<Date, string, string>
    vendor_name: string | null
    vendor_id: number | null
}

export type Request = Selectable<RequestTable>
export type NewRequest = Insertable<RequestTable>
export type RequestUpdate = Updateable<RequestTable>
