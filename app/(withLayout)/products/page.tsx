'use client'

import { useState, useCallback, useEffect } from 'react'
import { debounce } from 'lodash'
import { NewRequestProduct } from '@/db/types/request_product'

import Link from 'next/link'
import { deleteProduct, deleteProductBulk, findProduct, updateProduct } from '@/repositories/product'
import ProductList from '@/components/ProductList'
import Pagination from '@/components/Pagination'
import ListSelectorMenu from '@/components/ListSelectorMenu'
import ViewSelectedProductModal from '@/components/modals/ViewSelectedProductModal'
import { createRequestProduct, moveProductToRequest } from '@/repositories/request-product'
import RequestSelectionModal from '@/components/modals/RequestSelectionModal'
import { Request } from '@/db/types/request'
import { Product, ProductUpdate } from '@/db/types/product'

export default function ProductPage() {
    const pageSize = 20
    const [searchQuery, setSearchQuery] = useState('')
    const [pageNumber, setPageNumber] = useState(1)
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [pageCount, setPageCount] = useState(1)
    const [selected, setSelected] = useState<any[]>([])
    const [activeModal, setActiveModal] = useState<'selection' | 'requests' | null>(null)
    const [filterType, setFilterType] = useState<'all' | 'unlisted'>('unlisted')

    const debouncedHandleNameChange = useCallback(debounce(search, 500), [])

    useEffect(() => {
        setIsLoading(true)
        debouncedHandleNameChange(searchQuery, pageNumber, filterType)
    }, [searchQuery, pageNumber, filterType])

    function handleFilterTypeChange(type: 'all' | 'unlisted') {
        setPageNumber(1)
        setFilterType(type)
    }

    async function search(name: string, page: number, filterType: 'all' | 'unlisted') {
        const { data, count } = await findProduct({ name }, pageSize, page, filterType)
        setProducts(data)
        setPageCount(Math.ceil(count / pageSize))
        setIsLoading(false)
    }

    function handleSearchChange(e: any) {
        setPageNumber(1)
        setPageCount(1)
        setSearchQuery(e.target.value)
    }

    async function handleProductDelete(id: number) {
        setIsLoading(true)
        await deleteProduct(id)
        debouncedHandleNameChange(searchQuery, pageNumber, filterType)
    }

    function selectAllProduct() {
        const fresh = products.filter(p => {
            const found = selected.filter(f => f.id === p.id)

            return found.length < 1
        })

        setSelected(prev => [...prev, ...fresh])
    }

    function deselectAllProduct() {
        const removed = selected.filter(p => {
            const found = products.filter(f => f.id === p.id)

            return found.length < 1
        })

        setSelected([...removed])
    }

    function handleSelectionChange(product: any) {
        const found = selected.filter(p => p.id === product.id)

        if (found.length > 0) {
            const removed = selected.filter(p => p.id !== product.id)

            setSelected([...removed])
        } else {
            setSelected(prev => [...prev, product])
        }
    }

    async function deleteSelectedProduct(products: any[]) {
        const ids = products.map(s => s.id)
        setActiveModal(null)
        setSelected([])
        setIsLoading(true)
        await deleteProductBulk(ids)
        await search(searchQuery, pageNumber, filterType)
    }

    async function addToWaitlist(products: any[]) {
        const requestProducts: NewRequestProduct[] = products.map(p => {
            const fresh: NewRequestProduct = {
                description: p.name,
                quantity: 1,
                is_section: false,
                product_id: p.id
            }

            return fresh
        })

        setActiveModal(null)

        await createRequestProduct(requestProducts)
        
        setSelected([])
        setPageNumber(1)
        refreshList()
    }

    async function handleRequestSelect(data: Request) {
        setActiveModal(null)

        await moveProductToRequest(selected, data.id)
        
        setSelected([])
        refreshList()
    }

    function refreshList() {
        setIsLoading(true)
        debouncedHandleNameChange(searchQuery, pageNumber, filterType)
    }

    async function handleProductSave(product: Product) {
        const updateWith: ProductUpdate = {
            name: product.name
        }

        await updateProduct(product.id, updateWith)

        await search(searchQuery, pageNumber, filterType)
    }

    return (
        <main className="container-fluid mt-5 mb-5">
            {
                activeModal === 'selection'
                ? <ViewSelectedProductModal
                    onRequest={() => setActiveModal('requests')}
                    removeSelected={handleSelectionChange}
                    selected={selected}
                    onModalClose={() => setActiveModal(null)}
                    clearSelection={() => setSelected([])}
                    onDelete={() => deleteSelectedProduct(selected)}
                    onWaitlist={() => addToWaitlist(selected)}
                />
                : null
            }
            {
                activeModal === 'requests'
                ? <RequestSelectionModal
                    excludeId={null}
                    onModalClose={() => setActiveModal('selection')}
                    onRequestSelect={handleRequestSelect}
                />
                : null
            }
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="mb-3 text-center">Products</h1>
                    <div className="row mb-3 g-3 align-items-center">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col">
                                            <div className="row g-3 align-items-center">
                                                <div className="col-auto">
                                                    <label htmlFor="inputSearch" className="col-form-label">Search</label>
                                                </div>
                                                <div className="col">
                                                    <input
                                                        value={searchQuery}
                                                        onChange={handleSearchChange}
                                                    type="text" name="inputSearch" id="inputSearch" className="form-control" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <div className="btn-group" role="group">
                                                <input
                                                    onChange={() => handleFilterTypeChange('all')}
                                                    checked={filterType === 'all'}
                                                    value='all'
                                                    type="radio" name="productFilter" id="showAll" className="btn-check" />
                                                <label htmlFor="showAll" className="btn btn-outline-primary">All</label>

                                                <input
                                                    onChange={() => handleFilterTypeChange('unlisted')}
                                                    checked={filterType === 'unlisted'}
                                                    value='unlisted'
                                                    type="radio" name="productFilter" id="showUnlisted" className="btn-check" />
                                                <label htmlFor="showUnlisted" className="btn btn-outline-primary">Unlisted</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-auto">
                            <div className="card">
                                <div className="card-body">
                                    <Link href="/products/create">
                                        <button type="button" className="btn btn-primary" style={{width: '5rem'}}><i className="bi bi-plus"></i></button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ListSelectorMenu onViewSelected={() => setActiveModal('selection')} onDeselectAll={deselectAllProduct} onSelectAllPage={selectAllProduct} selected={selected} />
                    <div className="mt-3 mb-3">
                        <ProductList
                            list={products}
                            isLoading={isLoading}
                            deleteProduct={handleProductDelete}
                            selected={selected}
                            onSelectionChange={handleSelectionChange}
                            onSave={handleProductSave}
                        />
                    </div>
                    <div className="row align-items-center justify-content-center">
                        <div className="col text-secondary">Page {pageNumber} / {pageCount}</div>
                        <div className="col-auto">
                            <Pagination
                                onNext={() => setPageNumber(prev => prev + 1)}
                                onPrev={() => setPageNumber(prev => prev - 1)}
                                pageCount={pageCount} pageNumber={pageNumber} />
                        </div>
                        <div className="col"></div>
                    </div>
                </div>
            </div>
        </main>
    )
}