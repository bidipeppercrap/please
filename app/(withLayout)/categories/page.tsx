'use client'

import Pagination from '@/components/Pagination'
import { Category } from '@/db/types/category'
import { deleteCategory, findCategories } from '@/repositories/category'
import { debounce } from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const paginationDefault = {
    pageNumber: 1,
    pageCount: 1
}

export default function CategoryPage() {
    const router = useRouter()
    const pageSize = 10

    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState(paginationDefault)
    const [categories, setCategories] = useState<Category[]>([])

    const debouncedSearchChange = useCallback(debounce(searchCategories, 500), [])

    useEffect(() => {
        debouncedSearchChange(search, pagination.pageNumber)
    }, [search, pagination.pageNumber])

    const handlers = {
        searchChange(e: any) {
            const { value } = e.target
            
            setCategories([])
            setLoading(true)
            setSearch(value)
        },
        async deleteCategory(id: number) {
            setLoading(true)
            setCategories([])
            
            await deleteCategory(id)

            debouncedSearchChange(search, pagination.pageNumber)
        },
        movePage(step: number) {
            setLoading(true)
            setCategories([])
            setPagination({
                ...pagination,
                pageNumber: pagination.pageNumber + step
            })
        }
    }
    
    async function searchCategories(name: string, pageNumber: number) {
        const { data, count } = await findCategories({ name }, pageSize, pageNumber)

        setPagination({
            pageNumber: pageNumber,
            pageCount: Math.ceil(count / pageSize)
        })
        setLoading(false)
        setCategories(data)
    }
    
    return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="text-center mb-3">Categories</h1>
                    <div className="row mb-3">
                        <div className="col">
                            <div className="card">
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
                        </div>
                        <div className="col-auto">
                            <div className="card">
                                <div className="card-body">
                                    <button style={{width: '10rem'}} onClick={() => router.push('/categories/create')} className="btn btn-primary">
                                        <i className="bi bi-plus-lg"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        {CategoryList(categories, search, loading, handlers.deleteCategory)}
                    </div>
                    <div className="row align-items-center">
                        <div className="col text-secondary">Page {pagination.pageNumber} / {pagination.pageCount}</div>
                        <div className="col-auto">
                            <Pagination
                                pageNumber={pagination.pageNumber}
                                pageCount={pagination.pageCount}
                                onNext={() => handlers.movePage(1)}
                                onPrev={() => handlers.movePage(-1)}
                            />
                        </div>
                        <div className="col"></div>
                    </div>
                </div>
            </div>
        </main>
    )
}

function CategoryList(list: Category[], search = '', loading = false, onDelete: (id: number) => void) {
    if (list.length > 0) return <div className="list-group">
        {
            list.map(i =>
                <button type="button" className="list-group-item list-group-item-action">
                    <div className="row">
                        <div className="col">{i.name}</div>
                        <div className="col-auto">
                            <a onClick={() => onDelete(i.id)} className='text-danger' role='button'><i className="bi bi-trash"></i></a>
                        </div>
                    </div>
                </button>
            )
        }
    </div>
    if (loading) return <h5 className="text-center text-secondary mb-5 mt-5">Loading...</h5>
    if (!search) return <h5 className="text-center text-secondary mb-5 mt-5">Type category</h5>
    return <h5 className="text-center text-secondary mb-5 mt-5">No category found</h5>
}