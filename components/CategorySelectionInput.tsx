import { useState, useEffect, useRef, useMemo } from 'react'
import { debounce } from 'lodash'

import { find } from '@/app/(withLayout)/categories/actions'
import { Category } from '@/db/types/category'

function CategoryList({ name, categories, isSearching, selectedIndex }: { name: string, categories: any[], isSearching: boolean, selectedIndex: null | number }) {
    function ListBuilder(name: string) {
        if (name.length < 1) return <li className='list-group-item text-secondary'>Type category name</li>
        if (categories.length > 0) return categories.map((category, index) =>
            <li
                key={category.id}
                className={`list-group-item list-group-item-action ${selectedIndex === index ? 'active' : ''}`}
            >{category.name}</li>
        )
        if (isSearching) return <li className="list-group-item text-secondary text-italic">Searching...</li>
        return <li className="list-group-item">No category found</li>
    }

    return (
        <div className="card position-absolute mt-2" style={{width: '18rem'}}>
            <ul className="list-group list-group-flush">
                {ListBuilder(name)}
            </ul>
        </div>
    )
}

export default function CategorySelectionInput({ onCategorySelect }: { onCategorySelect: Function }) {
    const [name, setName] = useState('')
    const [showList, setShowList] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [selectionIndex, setSelectionIndex] = useState<number>(-1)
    const [isLocked, setIsLocked] = useState(false)

    const inputRef = useRef<any>(null)

    const debouncedHandleNameChange = useMemo(() => debounce(fetchData, 500), [])

    useEffect(() => {
        if (selectedCategory) {
            setName(selectedCategory.name)
            onCategorySelect(selectedCategory)
        }
    }, [selectedCategory, onCategorySelect])

    async function fetchData(name: string) {
        if (name.length < 1) return

        const result = await find(name, 5)
        setIsSearching(false)

        setCategories(result)
    }

    function handleNameChange(e: any) {
        setSelectionIndex(-1)
        setCategories([])
        setIsSearching(true)
        setName(e.target.value)
        debouncedHandleNameChange(e.target.value)
    }

    function handleNameFocus(e: any) {
        setShowList(true)
    }

    function handleNameBlur(e: any) {
        setShowList(false)
        setCategories([])

        if (!selectedCategory) setName('')
        if (selectedCategory) setName(selectedCategory.name)
    }

    function handleNameKeyDown(e: any) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
    }

    function handleNameKeyUp(e: any) {
        if (e.key == 'ArrowDown') moveSelection(1)
        if (e.key == 'ArrowUp') moveSelection(-1)
        if (e.key == 'Enter') selectCategory()
        e.stopPropagation()
    }

    function selectCategory() {
        setSelectedCategory(categories[selectionIndex])
        if (inputRef.current) inputRef.current.blur()
    }

    function moveSelection(step: number) {
        if (selectionIndex + step < -1) return
        if (selectionIndex > -1 && selectionIndex + step === categories.length) return
        setSelectionIndex(prev => prev + step)
    }

    return (
        <>
        <label htmlFor="productCategory" className="form-label">Category</label>
        <div className="input-group">
            <input
                value={name}
                onChange={handleNameChange}
                onFocus={handleNameFocus}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                onKeyUp={handleNameKeyUp}
                ref={inputRef}
                placeholder="Search category..."
                id="productCategory"
                type="text"
                className="form-control"
                autoComplete='off'
            />
            <input onChange={() => setIsLocked(!isLocked)} type="checkbox" className="btn-check" id="productCategoryLock" autoComplete='off' />
            <label htmlFor="productCategoryLock" className='btn btn-outline-primary'><i className="bi bi-lock"></i></label>
        </div>
        {showList ? <CategoryList isSearching={isSearching} name={name} categories={categories} selectedIndex={selectionIndex} /> : null}
        </>
    )
}