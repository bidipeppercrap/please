import { Product } from '@/db/types/product'
import { NewRequestProduct } from '@/db/types/request_product'
import { useEffect, useRef, useState } from 'react'
import ProductSelectionInput from './ProductSelectionInput02'
import { toStringDelimit } from '@/lib/numbering'

const defaultProduct: NewRequestProduct = {
    description: '',
    quantity: 1,
    is_section: false,
    note: '',
    unit: '',
    product_id: null,
}

const defaultSection: NewRequestProduct = {
    ...defaultProduct,
    quantity: 0,
    is_section: true
}

export default function RequestProductCreationForm({ onNewProductSave, onSectionSave }: { onNewProductSave: any, onSectionSave: any }) {
    const [addMode, setAddMode] = useState<'product' | 'section' | null>(null)

    const [newSection, setNewSection] = useState<NewRequestProduct>(defaultSection)

    const [newProduct, setNewProduct] = useState<NewRequestProduct>(defaultProduct)
    const [product, setProduct] = useState<Product | null>(null)
    const [ordering, setOrdering] = useState(false)

    const addSectionInputRef = useRef<any>(null)
    const productDescriptionInputRef = useRef<any>(null)

    useEffect(() => {
        if (addSectionInputRef.current) addSectionInputRef.current.focus()
    }, [addSectionInputRef])

    function handleAddSectionKeyDown(e: any) {
        if (e.key === 'Escape') return cancleAddSection()
        if (e.key === 'Enter') return saveSection()
    }

    function cancleAddSection() {
        setAddMode(null)
        setNewSection(defaultSection)
        setOrdering(false)
    }

    function handleSectionChange(e: any) {
        setNewSection({
            ...newSection,
            description: e.target.value
        })
    }

    function handleAddSectionClick() {
        setAddMode('section')
    }

    function handleCancelAddProduct() {
        setAddMode(null)
        setNewProduct(defaultProduct)
        setProduct(null)
        setOrdering(false)
    }

    function handleNewProductDescriptionChange(e: any) {
        setNewProduct({
            ...newProduct,
            description: e.target.value
        })
    }

    function handleNewProductQuantityChange(e: any) {
        setNewProduct({
            ...newProduct,
            quantity: e.target.value
        })
    }

    function handleNewProductNoteChange(e: any) {
        setNewProduct({
            ...newProduct,
            note: e.target.value
        })
    }

    function handleNewProductUnitChange(e: any) {
        setNewProduct({
            ...newProduct,
            unit: e.target.value
        })
    }

    function handleNewProductCostChange(e: any) {
        const { value } = e.target
        if (isNaN(value)) return

        setNewProduct({
            ...newProduct,
            cost: value
        })
    }

    function handleNewProductInputKeyDown(e: any) {
        if (e.key === 'Enter') saveNewProduct()
        if (e.key === 'Escape') handleCancelAddProduct()
    }

    function handleOnSelectProduct(productData: Product | null) {
        setProduct(productData)
        setNewProduct({
            ...newProduct,
            product_id: productData ? productData.id : null,
            description: productData ? productData.name : ''
        })
        if (productDescriptionInputRef) productDescriptionInputRef.current.focus()
    }

    function saveNewProduct() {
        onNewProductSave({
            ...newProduct,
            description: newProduct.description.length < 1 && product ? product.name : newProduct.description
        })
        setNewProduct(prev => ({
            ...defaultProduct,
            order_in_request: prev.order_in_request ? prev.order_in_request++ : null
        }))
        setProduct(null)
        if (productDescriptionInputRef) productDescriptionInputRef.current.focus()
    }

    function saveSection() {
        setNewSection(defaultSection)
        setAddMode(null)
        onSectionSave(newSection)
    }

    function handleNewProductDescriptionBlur(e: any) {
        if (e.target.value.length < 1 && product !== null) setNewProduct({
            ...newProduct,
            description: product.name
        })
    }

    function handleNewProductDescriptionFocus(e: any) {
        if (product !== null && e.target.value == product.name) setNewProduct({
            ...newProduct,
            description: ''
        })
    }

    const handlers = {
        orderChange(e: any) {
            setNewProduct({
                ...newProduct,
                order_in_request: e.target.value
            })
        },
        sectionOrderChange(e: any) {
            setNewSection(prev => ({
                ...prev,
                order_in_request: e.target.value
            }))
        },
        toggleOrdering() {
            setOrdering(prev => !prev)

            setNewProduct({
                ...newProduct,
                order_in_request: ordering ? null : 1
            })
        }
    }

    return (
        <li className="list-group-item">
            {
                !addMode
                ? (
                    <div className="row">
                        <div className="col-auto">
                            <button onClick={() => setAddMode('product')} type="button" className="btn text-primary">Add product</button>
                        </div>
                        <div className="col-auto">
                            <button onClick={handleAddSectionClick} type="button" className="btn text-primary">Add section</button>
                        </div>
                    </div>
                )
                : (
                    addMode === 'product'
                    ? (
                        <div className="row g-2 align-items-center">
                            <div className="col-auto">
                                <input
                                    checked={ordering}
                                    onChange={handlers.toggleOrdering}
                                    type="checkbox" id={`createProductOrderCheckbox`} className="form-check-input me-3" />
                            </div>
                            <div className="col-1">
                                <input
                                    disabled={!ordering}
                                    value={newProduct.order_in_request || ''}
                                    onChange={handlers.orderChange}
                                    onKeyDown={handleNewProductInputKeyDown}
                                    placeholder='Order' type="number" className="form-control" />
                            </div>
                            <div className="col">
                                <ProductSelectionInput
                                    productId={null}
                                    onSelect={handleOnSelectProduct}
                                />
                            </div>
                            <div className="col">
                                <input
                                    ref={productDescriptionInputRef}
                                    value={newProduct.description}
                                    onBlur={handleNewProductDescriptionBlur}
                                    onFocus={handleNewProductDescriptionFocus}
                                    onChange={handleNewProductDescriptionChange}
                                    onKeyDown={handleNewProductInputKeyDown}
                                    placeholder='Description' type="text" className="form-control" />
                            </div>
                            <div className="col-1">
                                <input
                                    value={newProduct.quantity}
                                    onChange={handleNewProductQuantityChange}
                                    onKeyDown={handleNewProductInputKeyDown}
                                    placeholder='Qty' type="number" className="form-control" />
                            </div>
                            <div className="col-2">
                                <input
                                    value={newProduct.unit || ''}
                                    onKeyDown={handleNewProductInputKeyDown}
                                    onChange={handleNewProductUnitChange}
                                    placeholder='Unit' type="text" className="form-control" />
                            </div>
                            <div className="col">
                                <input
                                    value={newProduct.note || ''}
                                    onKeyDown={handleNewProductInputKeyDown}
                                    onChange={handleNewProductNoteChange}
                                    placeholder='Note' type="text" className="form-control" />
                            </div>
                            <div className="col-1">
                                <input
                                    value={newProduct.cost || ''}
                                    onKeyDown={handleNewProductInputKeyDown}
                                    onChange={handleNewProductCostChange}
                                    placeholder='Cost' type="text" className="form-control" />
                            </div>
                            <div className="col-1 fw-bold text-secondary text-end">
                                {toStringDelimit(((newProduct.cost || 0) * newProduct.quantity)) || ''}
                            </div>
                            <div className="col-auto">
                                <a onClick={handleCancelAddProduct} role='button' className='text-danger ms-2'><i className="bi bi-x-lg"></i></a>
                            </div>
                        </div>
                    )
                    : (
                        <div className="row g-2 align-items-center">
                            <div className="col-auto">
                                <input
                                    checked={ordering}
                                    onChange={handlers.toggleOrdering}
                                    type="checkbox" id={`createProductOrderCheckbox`} className="form-check-input me-3" />
                            </div>
                            <div className="col-1">
                                <input
                                    disabled={!ordering}
                                    value={newSection.order_in_request || ''}
                                    onChange={handlers.sectionOrderChange}
                                    onKeyDown={handleAddSectionKeyDown}
                                    placeholder='Order' type="number" className="form-control" />
                            </div>
                            <div className="col">
                                <input
                                    value={newSection.description}
                                    onChange={handleSectionChange}
                                    ref={addSectionInputRef}
                                    onKeyDown={handleAddSectionKeyDown}
                                    placeholder='Section' type="text" className="form-control" />
                            </div>
                        </div>
                    )
                )
            }
            
        </li>
    )
}