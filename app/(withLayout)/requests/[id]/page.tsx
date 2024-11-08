'use client'

import ListSelectorMenu from '@/components/ListSelectorMenu'
import Pagination from '@/components/Pagination'
import ProductSelectionInput from '@/components/ProductSelectionInput02'
import RequestForm from '@/components/RequestForm'
import RequestProductCreationForm from '@/components/RequestProductCreationForm'
import RequestSelectionModal from '@/components/modals/RequestSelectionModal'
import ViewSelectedWailistModal from '@/components/modals/ViewSelectedWaitlistModal'
import { Product } from '@/db/types/product'
import { NewRequest, Request, RequestUpdate } from '@/db/types/request'
import { NewRequestProduct, RequestProduct, RequestProductDetail } from '@/db/types/request_product'
import { toStringDelimit } from '@/lib/numbering'
import { deleteRequest, updateRequest } from '@/repositories/request'
import { createRequestProductWithOrdering, deleteMany, deleteRequestProductWithOrdering, findRequestProduct, moveRequestToRequest, moveRequestToWaitlist, moveWaitlistToRequest, reorderMany, updateRequestProductWithOrdering } from '@/repositories/request-product'
import { formatISO } from 'date-fns'
import { debounce } from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function RequestDetailPage({
    params
}: {
    params: { id: number }
}) {
    const router = useRouter()
    const pageSize = 25

    const [pageNumber, setPageNumber] = useState(1)
    const [pageCount, setPageCount] = useState(1)
    const [totalCost, setTotalCost] = useState(0)
    const [showAddBubble, setShowAddBubble] = useState<number | null>(null)

    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [products, setProducts] = useState<RequestProductDetail[]>([])

    const [editProductIndex, setEditProductIndex] = useState<number | null>(null)

    const [selected, setSelected] = useState<RequestProductDetail[]>([])
    const [activeModal, setActiveModal] = useState<'selection' | 'requests' | null>(null)

    const debouncedSuccessMessage = useMemo(() => debounce(() => setSuccessMessage(''), 10000), [])
    const debouncedErrorMessage = useMemo(() => debounce(() => setErrorMessage(''), 10000), [])

    const editProductDescriptionRef = useRef<any>(null)

    const refreshProducts = useCallback(async () => {
        const { data, count, totalCost } = await findRequestProduct({ request_id: params.id }, pageSize, pageNumber, 'order_in_request')

        setTotalCost(totalCost)
        setPageCount(Math.ceil(count / pageSize))
        setProducts(data)
    }, [pageNumber, params.id])

    useEffect(() => {
        const refresh = async () => {
            await refreshProducts()
        }

        refresh()
    }, [pageNumber, refreshProducts])
    useEffect(() => debouncedSuccessMessage(), [successMessage, debouncedSuccessMessage])
    useEffect(() => debouncedErrorMessage(), [errorMessage, debouncedErrorMessage])

    async function handleSave(request: NewRequest) {
        const data: RequestUpdate = {...request}

        data.accepted_at = !data.accepted_at || data.accepted_at.length < 1 ? null : data.accepted_at
        data.updated_at = formatISO(Date.now())

        try {
            await updateRequest(params.id, data)

            setSuccessMessage('Updated')
        } catch (error) {
            console.log(error)
            setErrorMessage('Something went wrong when updating, please view console logs.')
        }
    }

    async function handleNewProductSave(product: NewRequestProduct) {
        const data: NewRequestProduct = {
            ...product,
            is_section: false,
            request_id: params.id,
            quantity: typeof(product.quantity) !== 'number' ? parseInt(product.quantity) : product.quantity,
        }

        await createRequestProductWithOrdering(data)
        await refreshProducts()
    }

    async function handleNewSectionSave(section: NewRequestProduct) {
        const data: NewRequestProduct = {
            ...section,
            is_section: true,
            request_id: params.id,
        }

        await createRequestProductWithOrdering(data)
        await refreshProducts()
    }

    async function handleDeleteRequest() {
        setProducts([])
        await deleteRequest(params.id)
        router.push('/requests')
    }

    async function handleDeleteProduct(id: number) {
        const removed = selected.filter(p => p.id !== id)
    
        setSelected([...removed])
        
        await deleteRequestProductWithOrdering(id)
        await refreshProducts()
    }

    function handleEditInputProductKeyDown(e: any) {
        if (e.key === 'Enter') {
            if (editProductDescriptionRef) editProductDescriptionRef.current.focus()
        }
    }

    async function handleEditInputKeyDown(e: any) {
        if (e.key === 'Escape' && editProductIndex !== null && products[editProductIndex].id == 0) {
            const prev = [...products]
            prev.splice(editProductIndex, 1)
            setProducts(prev)

            return setEditProductIndex(null)
        }

        if (e.key === 'Escape' || e.key === 'Enter') {
            if (editProductIndex !== null && products[editProductIndex].id !== 0) {
                await saveProduct(products[editProductIndex])
                await refreshProducts()
            }
            
            if (editProductIndex !== null && products[editProductIndex].id === 0) {
                await saveProduct(products[editProductIndex])
                await refreshProducts()
                handleAddProductBubbleClick(editProductIndex + 1, products[editProductIndex].order_in_request! + 1)
            } else setEditProductIndex(null)
        }
    }

    function handleDeselectAll() {
        const removed = selected.filter(s => {
            const found = products.filter(f => f.id === s.id)

            return found.length < 1
        })

        setSelected([...removed])
    }

    function handleSelectAllPage() {
        const fresh = products.filter(i => {
            const found = selected.filter(f => f.id === i.id)

            return found.length < 1
        })

        setSelected(prev => [...prev, ...fresh])
    }

    async function handleProductInputClick(index: number) {
        if (editProductIndex !== null) {
            await saveProduct(products[editProductIndex])
            await refreshProducts()
        }

        setEditProductIndex(index)
    }

    async function saveProduct(product: RequestProductDetail) {
        const { product_name, ...withUpdate } = product

        withUpdate.description = !withUpdate.description && product_name ? product_name : withUpdate.description
        
        const {id, ...withCreate} = withUpdate

        if (product.id == 0) await createRequestProductWithOrdering(withCreate)
        else await updateRequestProductWithOrdering(product.id!, withUpdate)
    }

    async function handleMoveToRequest(data: Request) {
        setActiveModal(null)

        await moveRequestToRequest(selected, params.id, data.id)
        
        setSelected([])
        await refreshProducts()
    }

    async function handleMoveToWaitlist() {
        setActiveModal(null)

        await moveRequestToWaitlist(selected, params.id)

        setSelected([])
        await refreshProducts()
    }

    const editProductHandler = {
        handleOrderChange: (e: any) => {
            if (editProductIndex === null) return

            const newProducts = [...products]
            newProducts[editProductIndex].order_in_request = typeof(e.target.value) !== 'number' ? parseInt(e.target.value) : e.target.value

            setProducts(newProducts)
        },
        handleEditProductSelection: (productData: Product | null) => {
            if (editProductIndex === null) return

            const newProducts = [...products]
            newProducts[editProductIndex].product_id = !productData ? null : productData.id
            newProducts[editProductIndex].product_name = !productData ? '' : productData.name
            newProducts[editProductIndex].description = !productData ? '' : productData.name
            
            setProducts(newProducts)
            if (editProductDescriptionRef) editProductDescriptionRef.current.focus()
        },
        handleEditProductSelectionProductChange: (productData: Product | null) => {
            if (editProductIndex === null) return

            const newProducts = [...products]
            newProducts[editProductIndex].product_id = !productData ? null : productData.id
            newProducts[editProductIndex].product_name = !productData ? '' : productData.name

            setProducts(newProducts)
        },
        handleDescriptionChange: (e: any) => {
            if (editProductIndex === null) return

            const newProducts = [...products]
            newProducts[editProductIndex].description = e.target.value

            setProducts(newProducts)
        },
        handleEditProductDescriptionBlur: (e: any) => {
            if (editProductIndex === null) return
            if (e.target.value.length > 0) return
            if (!products[editProductIndex].product_id) return

            const newProducts = [...products]
            newProducts[editProductIndex].description = newProducts[editProductIndex].product_name

            setProducts(newProducts)
        },
        handleDescriptionFocus: (e: any) => {
            if (editProductIndex === null) return
            if (!products[editProductIndex].product_id) return
            if (products[editProductIndex].description != products[editProductIndex].product_name) return

            const newProducts = [...products]
            newProducts[editProductIndex].description = ''

            setProducts(newProducts)
        },
        handleQuantityChange: (e: any) => {
            if (editProductIndex === null) return

            const newProducts = [...products]
            newProducts[editProductIndex].quantity = typeof(e.target.value) !== 'number' ? parseInt(e.target.value) : e.target.value

            setProducts(newProducts)
        },
        handleUnitChange: (e: any) => {
            if (editProductIndex === null) return

            const newProducts = [...products]
            newProducts[editProductIndex].unit = e.target.value

            setProducts(newProducts)
        },
        handleNoteChange: (e: any) => {
            if (editProductIndex === null) return

            const newProducts = [...products]
            newProducts[editProductIndex].note = e.target.value

            setProducts(newProducts)
        },
        handleCostChange: (e: any) => {
            if (editProductIndex === null) return

            const { value } = e.target
            if (isNaN(value)) return

            const newProducts = [...products]
            newProducts[editProductIndex].cost = value

            setProducts(newProducts)
        },
        isSelected: (requestProduct: RequestProduct): boolean => {
            const found = selected.filter(s => s.id === requestProduct.id)
            return found.length > 0
        },
        handleSelectionChange: (item: RequestProductDetail) => {
            const found = selected.filter(s => s.id === item.id)
    
            if (found.length > 0) {
                const removed = selected.filter(p => p.id !== item.id)
    
                setSelected([...removed])
            } else {
                setSelected(prev => [...prev, item])
            }
        },
    }

    async function handleReorder(newOrder: number) {
        setActiveModal(null)

        await reorderMany(selected, params.id, newOrder)

        setSelected([])
        await refreshProducts()
    }

    async function handleDeleteSelected() {
        setActiveModal(null)

        await deleteMany(selected, params.id)

        setSelected([])
        await refreshProducts()
    }
    function handleAddProductBubbleClick(index: number, order: number) {
        const newRequestProduct: RequestProductDetail = {
            id: 0,
            description: '',
            quantity: 0,
            unit: '',
            order_in_request: order,
            is_section: false,
            note: '',
            request_id: params.id,
            product_id: null,
            cost: 0,
            product_name: ''
        }

        setProducts(prev => [
            ...prev.slice(0, index),
            newRequestProduct,
            ...prev.slice(index)
        ])
        setEditProductIndex(index)
        if (editProductDescriptionRef.current !== null) editProductDescriptionRef.current.focus()
    }

    return (
        <main className="container-fluid mt-5" style={{marginBottom: '25rem'}}>
            {
                activeModal === 'selection'
                ? <ViewSelectedWailistModal
                    onWaitlist={handleMoveToWaitlist}
                    modalTitle='Selected Products'
                    selected={selected}
                    onModalClose={() => setActiveModal(null)}
                    removeSelected={editProductHandler.handleSelectionChange}
                    clearSelection={() => setSelected([])}
                    onDelete={handleDeleteSelected}
                    onRequest={() => setActiveModal('requests')}
                    onReorder={handleReorder}
                />
                : null
            }
            {
                activeModal === 'requests'
                ? <RequestSelectionModal
                    excludeId={params.id}
                    onRequestSelect={handleMoveToRequest}
                    onModalClose={() => setActiveModal('selection')}
                />
                : null
            }
            <div className="d-grid justify-content-center">
                <div className="listview listview-lg">
                    <h1 className="text-center mb-3">Edit Request</h1>
                    <RequestForm
                        request_id={params.id}
                        onPrint={() => {}}
                        onSave={handleSave}
                        onDelete={handleDeleteRequest}
                    />
                    { successMessage ? <div className="alert alert-success mt-3">{successMessage}</div> : null }
                    { errorMessage ? <div className="alert alert-danger mt-3">{errorMessage}</div> : null }
                    <div className="mt-3">
                        <ListSelectorMenu
                                onDeselectAll={handleDeselectAll}
                                onSelectAllPage={handleSelectAllPage}
                                onViewSelected={() => setActiveModal('selection')}
                                selected={selected}
                            />
                    </div>
                    <ul className="list-group mt-3">
                        {
                            products.length > 0
                            ? (
                                products.map((p, index) =>
                                    <li
                                        onMouseEnter={() => setShowAddBubble(index)}
                                        key={p.id} className={`list-group-item list-group-item-action ${p.is_section ? 'bg-body-secondary text-secondary' : ''}`}>
                                        {
                                            showAddBubble == index && editProductIndex == null
                                            ? (
                                                <span className='position-absolute' style={{left: 0, marginLeft: -35, top: 0}}>
                                                    <div className="btn-group-vertical btn-group-sm">
                                                        <button onClick={() => handleAddProductBubbleClick(index, p.order_in_request!)} style={{fontSize: 7}} type="button" className="btn btn-outline-secondary"><i className="bi bi-chevron-up"></i></button>
                                                        <button onClick={() => handleAddProductBubbleClick(index + 1, (p.order_in_request! + 1))} style={{fontSize: 7}} type="button" className="btn btn-outline-secondary"><i className="bi bi-chevron-down"></i></button>
                                                    </div>
                                                </span>
                                            )
                                            : null
                                        }
                                        {
                                            p.is_section
                                            ? (
                                                editProductIndex === index
                                                ? (
                                                    <div className="row g-2">
                                                        <div className="col-1">
                                                            <input
                                                                onKeyDown={handleEditInputKeyDown}
                                                                onChange={editProductHandler.handleOrderChange}
                                                                value={p.order_in_request || ''}
                                                                placeholder='Order' type="number" className="form-control" />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                onKeyDown={handleEditInputKeyDown}
                                                                onChange={editProductHandler.handleDescriptionChange}
                                                                value={p.description}
                                                                placeholder='Section' type="text" className="form-control" />
                                                        </div>
                                                    </div>
                                                )
                                                : (
                                                    <div className="row">
                                                        <div className="col-auto fw-bold">
                                                            <input
                                                                checked={editProductHandler.isSelected(p)}
                                                                onChange={() => editProductHandler.handleSelectionChange(p)}
                                                                type="checkbox" name="" id={`itemCheckbox-${p.id}`} className="form-check-input me-3" />
                                                            <label onClick={() => handleProductInputClick(index)} htmlFor={`itemCheckbox-${p.id}`} className="form-check-label">{p.order_in_request}.</label>
                                                        </div>
                                                        <div onClick={() => handleProductInputClick(index)} className="col fw-bold">
                                                            {p.description}
                                                        </div>
                                                        <div className="col-auto">
                                                            <a onClick={() => handleDeleteProduct(p.id)} role='button' className="text-danger"><i className="bi bi-trash"></i></a>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                            : (
                                                editProductIndex === index
                                                ? (
                                                    <div className="row g-2 align-items-center">
                                                        <div className="col-1">
                                                            <input
                                                                onKeyDown={handleEditInputKeyDown}
                                                                onChange={editProductHandler.handleOrderChange}
                                                                value={p.order_in_request || ''}
                                                                placeholder='Order' type="number" className="form-control" />
                                                        </div>
                                                        <div className="col">
                                                            <ProductSelectionInput
                                                                productId={
                                                                    !products[editProductIndex]
                                                                    ? null
                                                                    : products[editProductIndex].product_id!
                                                                }
                                                                onSelect={editProductHandler.handleEditProductSelection}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                ref={editProductDescriptionRef}
                                                                onBlur={editProductHandler.handleEditProductDescriptionBlur}
                                                                onKeyDown={handleEditInputKeyDown}
                                                                onFocus={editProductHandler.handleDescriptionFocus}
                                                                onChange={editProductHandler.handleDescriptionChange}
                                                                value={p.description}
                                                                placeholder='Description' type="text" className="form-control" />
                                                        </div>
                                                        <div className="col-1">
                                                            <input
                                                                value={p.quantity}
                                                                onChange={editProductHandler.handleQuantityChange}
                                                                onKeyDown={handleEditInputKeyDown}
                                                                placeholder='Quantity' type="number" className="form-control" />
                                                        </div>
                                                        <div className="col-2">
                                                            <input
                                                                value={p.unit || ''}
                                                                onChange={editProductHandler.handleUnitChange}
                                                                onKeyDown={handleEditInputKeyDown}
                                                                placeholder='Unit' type="text" className="form-control" />
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                value={p.note || ''}
                                                                onChange={editProductHandler.handleNoteChange}
                                                                onKeyDown={handleEditInputKeyDown}
                                                                placeholder='Note' type="text" className="form-control" />
                                                        </div>
                                                        <div className="col-1">
                                                            <input
                                                                value={p.cost || ''}
                                                                onChange={editProductHandler.handleCostChange}
                                                                onKeyDown={handleEditInputKeyDown}
                                                                placeholder='Cost' type="text" className="form-control" />
                                                        </div>
                                                        <div className="col-1 text-end fw-bold text-secondary">
                                                            {toStringDelimit(((p.cost || 0) * p.quantity))}
                                                        </div>
                                                    </div>
                                                )
                                                : (
                                                    <div className="row align-items-center">
                                                        <div className="col-1 fw-bold">
                                                            <input
                                                                checked={editProductHandler.isSelected(p)}
                                                                onChange={() => editProductHandler.handleSelectionChange(p)}
                                                                type="checkbox" name="" id={`itemCheckbox-${p.id}`} className="form-check-input me-3" />
                                                            <label onClick={() => handleProductInputClick(index)} htmlFor={`itemCheckbox-${p.id}`} className="form-check-label">{p.order_in_request}.</label>
                                                        </div>
                                                        <div onClick={() => handleProductInputClick(index)} className="col">
                                                            {p.product_name}
                                                        </div>
                                                        <div onClick={() => handleProductInputClick(index)} className="col">
                                                            {p.description}
                                                        </div>
                                                        <div onClick={() => handleProductInputClick(index)} className="col-2">
                                                            <span className="fw-bold">{p.quantity}</span> {p.unit}
                                                        </div>
                                                        <div onClick={() => handleProductInputClick(index)} className="col">
                                                            {
                                                                p.note
                                                                ? (
                                                                    <div className="alert alert-warning mb-0" role='alert'>
                                                                        {p.note}
                                                                    </div>
                                                                )
                                                                : null
                                                            }
                                                        </div>
                                                        <div onClick={() => handleProductInputClick(index)} className="col-1 text-end fw-bold text-secondary">
                                                            {toStringDelimit(p.cost) || ""}
                                                        </div>
                                                        <div className="col-1 text-end fw-bold text-secondary">
                                                            {toStringDelimit(((p.cost || 0) * p.quantity)) || ''}
                                                        </div>
                                                        <div className="col-auto">
                                                            <a onClick={() => handleDeleteProduct(p.id)} role='button' className="text-danger"><i className="bi bi-trash"></i></a>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        }
                                    </li>
                                )
                            )
                            : null
                        }
                        <RequestProductCreationForm
                            onNewProductSave={handleNewProductSave}
                            onSectionSave={handleNewSectionSave} />
                    </ul>
                    <div className="row align-items-center justify-content-center mt-3">
                        <div className="col text-secondary">
                            Page {pageNumber} / {pageCount}
                        </div>
                        <div className="col-auto">
                            <Pagination
                                onNext={() => setPageNumber(prev => prev + 1)}
                                onPrev={() => setPageNumber(prev => prev - 1)}
                                pageCount={pageCount}
                                pageNumber={pageNumber}
                            />
                        </div>
                        <div className="col text-secondary text-end">Total Cost: <span className="fw-bold">{toStringDelimit(totalCost)}</span></div>
                    </div>
                </div>
            </div>
        </main>
    )
}