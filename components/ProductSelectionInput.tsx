import { Product } from '@/db/types/product'
import { findProduct } from '@/repositories/product'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

export default function ProductSelectionInput({
    preSelected = null,
    onSelect,
    onProductChange,
    onKeyDown
}: {
    preSelected: Product | null,
    onSelect: (product: Product) => void,
    onProductChange: (product: Product | null) => void,
    onKeyDown: any
}) {
    const [productDisplay, setProductDisplay] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [product, setProduct] = useState<Product | null>(preSelected)
    const [productSelection, setProductSelection] = useState(false)
    const [productSearching, setProductSearching] = useState(false)
    const [productIndex, setProductIndex] = useState(-1)

    const debouncedProductDisplayChange = useCallback(debounce(searchProducts, 500), [])

    useEffect(() => {
        setProductDisplay(product ? product.name : '')
        onProductChange(product)
    }, [product])

    useEffect(() => {
        debouncedProductDisplayChange(productDisplay)
    }, [productDisplay])

    async function searchProducts(name: string) {
        const { data } = await findProduct({ name }, 5)

        setProducts(data)
        setProductSearching(false)
    }

    function handleProductDisplayBlur() {
        setProductSelection(false)

        if (!product) setProductDisplay('')
        else setProductDisplay(product.name)
    }

    function handleProductDisplayChange(e: any) {
        setProductDisplay(e.target.value)
        setProductSearching(true)
        setProductSelection(true)
    }

    function handleProductDisplayFocus() {
        setProductDisplay('')
        setProductSelection(true)
    }

    function clearProductDisplay() {
        setProduct(null)
    }

    function selectProduct() {
        setProduct(products[productIndex])
        setProducts([])
        setProductSelection(false)
        setProductIndex(-1)
        onSelect(products[productIndex])
    }
    
    function moveSelection(step: number) {
        if (productIndex + step < -1) return
        if (productIndex > -1 && productIndex + step === products.length) return
        setProductIndex(prev => prev + step)
    }

    function handleNewProductDisplayKeyDown(e: any) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
        if (e.key == 'ArrowDown') moveSelection(1)
        if (e.key == 'ArrowUp') moveSelection(-1)
        if (e.key === 'Enter') selectProduct()
        onKeyDown(e)
        e.stopPropagation()
    }
    
    return (
        <>
        <div className="input-group">
            <input
                value={productDisplay}
                onChange={handleProductDisplayChange}
                onBlur={handleProductDisplayBlur}
                onFocus={handleProductDisplayFocus}
                onKeyDown={handleNewProductDisplayKeyDown}
                autoComplete='off'
                autoCorrect='off'
                placeholder='Product' type="text" className="form-control" />
            <button disabled={product !== null ? false : true} onClick={clearProductDisplay} type="button" className="btn btn-danger"><i className="bi bi-x-lg"></i></button>
        </div>
        {
            productSelection
            ?
                <ul className="list-group position-absolute mt-2" style={{width: '18rem'}}>
                    {
                        productDisplay.length > 0
                        ? (
                            productSearching
                            ? <li className="list-group-item text-secondary">Searching...</li>
                            : (
                                products.length < 1
                                ? <li className="list-group-item text-secondary">No product found</li>
                                : products.map((p, index) => <li key={p.id} className={`list-group-item ${productIndex === index ? 'active' : ''}`}>{p.name}</li>)
                            )
                        )
                        : <li className="list-group-item text-secondary">Type product name</li>
                    }
                </ul>
            : null
        }
        </>
    )
}