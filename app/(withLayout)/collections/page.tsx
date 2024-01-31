'use client'

import Pagination from '@/components/Pagination'
import { Collection, CollectionUpdate, NewCollection } from '@/db/types/collection'
import { ProductCollectionExtended } from '@/db/types/product_collection'
import { createCollection, deleteCollection, findCollections } from '@/repositories/collection'
import { deleteProductCollection, findProductCollection } from '@/repositories/product-collection'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

const paginationDefault = {
    pageNumber: 1,
    pageCount: 1
}

export default function CollectionPage() {
    const [collection, setCollection] = useState<Collection | null>(null)

    const handlers = {
        selectCollection(collection: Collection) {
            setCollection(collection)
        }
    }

    return (
        <div className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview listview-lg">
                    <div className="row">
                        <div className="col-4">
                            {CollectionSection(handlers.selectCollection)}
                        </div>
                        <div className="col">
                            {ProductSection(collection)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProductSection(collection: Collection | null) {
    const pageSize = 25

    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<ProductCollectionExtended[]>([])
    const [pagination, setPagination] = useState(paginationDefault)

    const debouncedSearchChange = useCallback(debounce(searchProduct, 500), [])

    useEffect(() => {
        setLoading(true)
        setProducts([])
    }, [collection])

    useEffect(() => {
        if (collection) debouncedSearchChange(search, collection.id, pagination.pageNumber)
    }, [search, pagination.pageNumber, collection])

    async function searchProduct(name = '', colId: number | null, pageNumber: number) {
        if (colId === null) return setProducts([])

        const { data, count } = await findProductCollection({ name, collection_id: colId }, pageSize, pageNumber)

        setProducts(data)
        setPagination({
            pageNumber: pageNumber,
            pageCount: Math.ceil(count / pageSize) || 1
        })
        setLoading(false)
    }

    const handlers = {
        searchChange(e: any) {
            const { value } = e.target

            setLoading(true)
            setProducts([])
            setSearch(value)
        },
        async onDelete(id: number) {
            if (!collection) return

            setProducts([])
            setLoading(true)

            if (collection) await deleteProductCollection(id, collection.id)

            debouncedSearchChange(search, collection.id, pagination.pageNumber)
        },
        movePage(step: number) {
            setPagination({
                ...pagination,
                pageNumber: pagination.pageNumber + step
            })
        }
    }

    if (!collection) return <h3 className="text-center text-secondary mt-5 mb-5">Please select a collection</h3>

    return <>
        <h1 className="mb-3">Products in {collection.name}</h1>
        <div className="card mb-3">
            <div className="card-body">
                <div className="input-group">
                    <span className="input-group-text">Search</span>
                    <input
                        value={search}
                        onChange={handlers.searchChange}
                        type="text" className="form-control" />
                </div>
            </div>
        </div>
        <div className="mb-3">
            {ProductList(products, loading, handlers.onDelete)}
        </div>
        <div className="row align-items-center">
            <div className="col text-secondary">Page {pagination.pageNumber} / {pagination.pageCount}</div>
            <div className="col-auto">
                <Pagination
                    pageCount={pagination.pageCount}
                    pageNumber={pagination.pageNumber}
                    onNext={() => handlers.movePage(1)}
                    onPrev={() => handlers.movePage(-1)}
                />
            </div>
            <div className="col"></div>
        </div>
    </>
}

function ProductList(list: ProductCollectionExtended[], loading = false, onDelete: (id: number) => void) {
    if (list.length > 0) return <div className="list-group">
        {
            list.map(i =>
                <button type="button" className="list-group-item list-group-item-action">
                    <div className="row">
                        <div className="col">{i.name}</div>
                        <div className="col">{i.description}</div>
                        <div className="col-auto">
                            <a onClick={() => onDelete(i.id)} role="button" className="text-danger"><i className="bi bi-trash"></i></a>
                        </div>
                    </div>
                </button>
            )
        }
    </div>
    if (loading) return <h5 className="text-secondary text-center mb-5 mt-5">Loading...</h5>
    return <h5 className="text-secondary text-center mb-5 mt-5">No product found</h5>
}

function CollectionSection(onSelect: (collection: Collection) => void) {
    const pageSize = 25

    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [collections, setCollections] = useState<Collection[]>([])
    const [pagination, setPagination] = useState(paginationDefault)

    const debouncedSearchChange = useCallback(debounce(searchCollection, 500), [])

    useEffect(() => {
        debouncedSearchChange(search, pagination.pageNumber)
    }, [search, pagination.pageNumber])

    const handlers = {
        async onDeleteCollection(id: number) {
            setLoading(true)
            setCollections([])

            await deleteCollection(id)

            debouncedSearchChange(search, pagination.pageNumber)
        },
        searchChange(e: any) {
            const { value } = e.target

            setSearch(value)
            setCollections([])
            setLoading(true)
        },
        movePage(step: number) {
            setPagination({
                ...pagination,
                pageNumber: pagination.pageNumber + step
            })
        },
        searchKeyDown(e: any) {
            if (e.key === 'Enter' && search) saveCollection()
        }
    }

    async function saveCollection() {
        const collection: NewCollection = {
            name: search
        }

        await createCollection(collection)

        setCollections([])
        setLoading(true)
        debouncedSearchChange(search, pagination.pageNumber)
    }

    async function searchCollection(name: string, pageNumber: number) {
        const { data, count } = await findCollections({ name }, pageSize, pageNumber)

        setCollections(data)
        setPagination({
            pageNumber: pageNumber,
            pageCount: Math.ceil(count / pageSize) || 1
        })
        setLoading(false)
    }

    return <>
        <h1 className="mb-3">Collections</h1>
        <div className="mb-3 card">
            <div className="card-body">
                <div className="input-group">
                    <input
                        onKeyDown={handlers.searchKeyDown}
                        value={search}
                        onChange={handlers.searchChange}
                        type="text" className="form-control" />
                </div>
            </div>
        </div>
        <div className="mb-3">
            {CollectionList(collections, loading, handlers.onDeleteCollection, () => {}, onSelect)}
        </div>
        <div className="row align-items-center">
            <div className="col text-secondary">
                Page {pagination.pageNumber} / {pagination.pageCount}
            </div>
            <div className="col">
                <Pagination
                    pageNumber={pagination.pageNumber}
                    pageCount={pagination.pageCount}
                    onNext={() => handlers.movePage(1)}
                    onPrev={() => handlers.movePage(-1)}
                />
            </div>
            <div className="col">

            </div>
        </div>
    </>
}

function CollectionList(
    list: Collection[],
    loading = false,
    onDelete: (id: number) => void,
    onEdit: (id: number, collection: CollectionUpdate) => void,
    onSelect: (collection: Collection) => void
) {
    function editMode(index: number) {

    }

    if (list.length > 0) return <div className="list-group">
        {
            list.map((i, index) =>
                <button type="button" className="list-group-item list-group-item-action">
                    <div className="row">
                        <div onClick={() => onSelect(i)} className="col">{i.name}</div>
                        <div className="col-auto">
                            <a onClick={() => editMode(index)} role='button'><i className="bi bi-pencil"></i></a>
                        </div>
                        <div className="col-auto">
                            <a onClick={() => onDelete(i.id)} role="button" className="text-danger"><i className="bi bi-trash"></i></a>
                        </div>
                    </div>
                </button>
            )
        }
    </div>
    if (loading) return <h5 className="text-secondary text-center mb-5 mt-5">Loading...</h5>
    return <h5 className="text-secondary text-center mb-5 mt-5">No collection found</h5>
}