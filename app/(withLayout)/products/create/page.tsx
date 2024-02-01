'use client'

import { useMemo, useRef, useState } from 'react'
import { debounce } from 'lodash'
import { save } from './actions'
import { find } from '../actions'

import CategorySelectionInput from '@/components/CategorySelectionInput'
import DuplicateList from '@/components/DuplicateList'
import { Category } from '@/db/types/category'

export default function CreateProductPage() {
    const [name, setName] = useState('')
    const [category, setCategory] = useState<Category>()
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const nameInput = useRef<any>(null)

    const debouncedHandleNameChange = useMemo(() => debounce(findProducts, 500), [])

    async function findProducts(name: string) {
        if (name.length < 1) return
        
        const { data } = await find(name, 10)
        setIsLoading(false)

        setProducts(data)
    }

    function handleNameChange(e: any) {
        setProducts([])
        setIsLoading(true)
        setName(e.target.value)
        debouncedHandleNameChange(e.target.value)
    }

    function handleNameKeyUp(e: any) {
        if (e.key != 'Enter') return

        const name = e.target.value
        const categoryId = !category ? null : category.id

        save(name, categoryId)

        setName('')
    }

    function onCategorySelect(category: any) {
        setCategory(category)
        if (nameInput.current) nameInput.current.focus()
    }

    return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="text-center mb-3">Create Product</h1>
                    <div className="card mb-5">
                        <div className="card-body">
                            <div className="row">
                                <div className="col">
                                    <label htmlFor="productName" className="form-label">Name</label>
                                    <input
                                        ref={nameInput}
                                        value={name}
                                        onKeyUp={handleNameKeyUp}
                                        onChange={handleNameChange}
                                        autoComplete='off'
                                        id="productName" type="text" className="form-control"
                                    />
                                </div>
                                <div className="col">
                                    <CategorySelectionInput onCategorySelect={onCategorySelect} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DuplicateList name={name} list={products} isLoading={isLoading}>
                        <ul className="list-group">
                            {products.map(product =>
                                <li key={product.id} className="list-group-item">{product.name}</li>
                            )}
                        </ul>
                    </DuplicateList>
                </div>
            </div>
        </main>
    )
}