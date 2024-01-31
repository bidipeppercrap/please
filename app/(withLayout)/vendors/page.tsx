'use client'

import Pagination from '@/components/Pagination'
import { Vendor } from '@/db/types/vendor'
import { deleteVendor, findVendor } from '@/repositories/vendor'
import { debounce } from 'lodash'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

const paginationDefault = {
    pageNumber: 1,
    pageCount: 1,
}

export default function VendorPage() {
    const pageSize = 10

    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState(paginationDefault)
    const [vendors, setVendors] = useState<Vendor[]>([])

    const debouncedSearchChange = useCallback(debounce(searchVendors, 500), [])

    useEffect(() => {
        debouncedSearchChange(search, pagination.pageNumber)
    }, [search, pagination.pageNumber])

    const handlers = {
        searchChange(e: any) {
            const { value } = e.target

            setSearch(value)
            setLoading(true)
            setVendors([])
        },
        movePage(step: number) {
            setVendors([])
            setLoading(true)
            setPagination({
                ...pagination,
                pageNumber: pagination.pageNumber + step
            })
        },
        async onVendorDelete(id: number) {
            setLoading(true)
            setVendors([])
            
            await deleteVendor(id)

            debouncedSearchChange(search, pagination.pageNumber)
        }
    }

    async function searchVendors(name: string, pageNumber: number) {
        const { data, count } = await findVendor({ name }, pageSize, pageNumber)

        setVendors(data)
        setPagination({
            pageNumber,
            pageCount: Math.ceil(count / pageSize)
        })
        setLoading(false)
    }

    return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="mb-3 text-center">Vendors</h1>
                    <div className="row mb-3">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <div className="input-group">
                                        <span className="input-group-text">Search</span>
                                        <input
                                            autoComplete='off'
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
                                    <Link href='/vendors/create' style={{width: '10rem'}} className="btn btn-primary"><i className="bi bi-plus"></i></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        {VendorList(vendors, search, loading, handlers.onVendorDelete)}
                    </div>
                    <div className="row align-items-center">
                        <div className="col text-secondary">
                            Page {pagination.pageNumber} / {pagination.pageCount}
                        </div>
                        <div className="col-auto">
                            <Pagination
                                pageCount={pagination.pageCount}
                                pageNumber={pagination.pageNumber}
                                onNext={() => handlers.movePage(1)}
                                onPrev={() => handlers.movePage(-1)}
                            />
                        </div>
                        <div className="col">

                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

function VendorList(
    vendors: Vendor[],
    search = '',
    loading = false,
    onDelete: (id: number) => void = () => {}
) {
    if (vendors.length > 0) return (
        <div className="list-group">
            {
                vendors.map(v =>
                    <button type="button" className="list-group-item list-group-item-action">
                        <div className="row">
                            <div className="col">{v.name}</div>
                            <div className="col-auto">
                                <a onClick={() => onDelete(v.id)} className='text-danger' role='button'><i className="bi bi-trash"></i></a>
                            </div>
                        </div>
                    </button>
                )
            }
        </div>
    )
    if (loading) return <h5 className="text-secondary mt-5 mb-5 text-center">Loading...</h5>
    if (!search) return <h5 className="text-secondary mt-5 mb-5 text-center">Type vendor name</h5>
    return <h5 className="text-secondary mt-5 mb-5 text-center">No vendor found</h5>
}