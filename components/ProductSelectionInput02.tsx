import { Product } from '@/db/types/product'
import { findProduct, findProductById } from '@/repositories/product'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

export default function ProductSelectionInput({
    productId,
    onSelect
}: {
    productId: number | null,
    onSelect: (product: Product | null) => void
}) {
    const [loading, setLoading] = useState(false)
    const [productDisplay, setProductDisplay] = useState('')
    const [product, setProduct] = useState<Product | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [productSelection, setProductSelection] = useState(false)
    const [productSearching, setProductSearching] = useState(false)
    const [productIndex, setProductIndex] = useState(-1)
    
    const debouncedProductDisplayChange = useCallback(debounce(searchProducts, 500), [])

    useEffect(() => {
        const fetchData = async () => {
            if (!productId) return

            setLoading(true)

            const result = await findProductById(productId)

            if (result) {
                setProduct(result)
                setProductDisplay(result.name)
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (product) setProductDisplay(product.name)
        if (!product) setProductDisplay('')
    }, [product])

    useEffect(() => {
        debouncedProductDisplayChange(productDisplay)
    }, [productDisplay])

    async function searchProducts(name: string) {
        const { data } = await findProduct({ name }, 5)

        setProducts(data)
        setProductSearching(false)
    }

    function handleProductDisplayChange(e: any) {
        setProducts([])
        setProductSearching(true)

        const { value } = e.target

        setProductDisplay(value)
    }

    function handleProductDisplayFocus(e: any) {
        setProductDisplay('')
        setProductSelection(true)
    }

    function handleProductDisplayBlur(e: any) {
        setProductSelection(false)

        if (product) setProductDisplay(product.name)
        else setProductDisplay('')
    }

    function moveSelection(step: number) {
        if (productIndex + step < -1) return
        if (productIndex > -1 && productIndex + step === products.length) return
        setProductIndex(prev => prev + step)
    }

    function selectProduct() {
        setProduct(products[productIndex])
        setProducts([])
        setProductSelection(false)
        setProductIndex(-1)
        onSelect(products[productIndex])
    }

    function handleProductDisplayKeyDown(e: any) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
        if (e.key == 'ArrowDown') moveSelection(1)
        if (e.key == 'ArrowUp') moveSelection(-1)
        if (e.key === 'Enter') selectProduct()
        e.stopPropagation()
    }

    function clearProduct() {
        setProduct(null)
        onSelect(null)
    }

    if (loading) return <div className="text-center text-secondary">Loading...</div>
    return <>
        <div className="input-group">
            <input
                value={productDisplay}
                onFocus={handleProductDisplayFocus}
                onBlur={handleProductDisplayBlur}
                onChange={handleProductDisplayChange}
                onKeyDown={handleProductDisplayKeyDown}
                type="text" className="form-control" />
            <button onClick={clearProduct} type="button" className="btn btn-danger"><i className="bi bi-x-lg"></i></button>
        </div>
        {
            productSelection
            ?
                <ul className="list-group position-absolute mt-2" style={{width: '18rem', zIndex: '999'}}>
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
}