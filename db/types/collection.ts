import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface CollectionTable {
    id: Generated<number>
    name: string
}

export type Collection = Selectable<CollectionTable>
export type NewCollection = Insertable<CollectionTable>
export type CollectionUpdate = Updateable<CollectionTable>
