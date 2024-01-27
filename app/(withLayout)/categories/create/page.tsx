'use client'

import { useCallback, useState } from 'react';

import { save } from './actions'
import { find } from '../actions';
import DuplicateList from '@/components/DuplicateList';
import { debounce } from 'lodash';

export default function CreateCategoryPage() {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    const debouncedHandleNameChange = useCallback(debounce(findCategories, 500), [])

    function handleNameChange(e: any) {
        setCategories([])
        setLoading(true)
        setName(e.target.value)
        debouncedHandleNameChange(e.target.value)
    }

    async function handleNameKeyUp(e: any) {
        if (e.key === 'Enter') await saveCategory()
    }

    async function saveCategory() {
        save(name)
        setName('')
    }

    async function findCategories(name: string) {
        if (name.length < 1) return
        
        const result = await find(name, 10)
        setLoading(false)

        setCategories(result)
    }

    return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="text-center mb-3">Create Category</h1>
                    <div className="card mb-5" style={{width: '25rem', justifySelf: 'center'}}>
                        <div className="card-body">
                            <label htmlFor="categoryName" className="form-label">Name</label>
                            <input
                                value={name}
                                onKeyUp={handleNameKeyUp}
                                onChange={handleNameChange}
                                autoComplete='off'
                                id="categoryName" type="text" className="form-control"
                            />
                        </div>
                    </div>
                    <DuplicateList name={name} isLoading={loading} list={categories} >
                        <ul className="list-group">
                            {categories.map(category =>
                                <li key={category.id} className="list-group-item">{category.name}</li>
                            )}
                        </ul>
                    </DuplicateList>
                </div>
            </div>
        </main>
    )
}