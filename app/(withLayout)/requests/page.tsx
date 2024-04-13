'use client'

import Pagination from '@/components/Pagination'
import { Request } from '@/db/types/request'
import { toStringDelimit } from '@/lib/numbering'
import { deleteRequest, findRequest, starRequest } from '@/repositories/request'
import { debounce } from 'lodash'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function RequestPage() {
    const pageSize = 25

    const [vendorSearch, setVendorSearch] = useState('')
    const [referenceSearch, setReferenceSearch] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [requests, setRequests] = useState<Request[]>([])
    const [pageNumber, setPageNumber] = useState(1)
    const [pageCount, setPageCount] = useState(1)

    const debouncedSearchChange = useMemo(() => debounce(searchRequest, 500), [])

    useEffect(() => {
        setIsLoading(true)
        debouncedSearchChange(vendorSearch, referenceSearch, pageSize, pageNumber)
    }, [pageNumber, vendorSearch, referenceSearch, debouncedSearchChange])

    async function searchRequest(vendor: string, reference: string, pageSize: number, pageNumber: number) {
        const { data, count } = await findRequest({
            vendor_name: vendor,
            reference: reference
        }, pageSize, pageNumber)

        setRequests(data)
        setIsLoading(false)
        setPageCount(Math.ceil(count / pageSize) ?? 1)
    }

    function handleVendorSearchChange(e: any) {
        setIsLoading(true)
        setVendorSearch(e.target.value)
        setPageNumber(1)
    }

    function handleReferenceSearchChange(e: any) {
        setIsLoading(true)
        setReferenceSearch(e.target.value)
        setPageNumber(1)
    }

    async function handleStarRequest(id: number, starred: boolean) {
        await starRequest(id, starred)

        debouncedSearchChange(vendorSearch, referenceSearch, pageSize, pageNumber)
    }

    async function handleDeleteRequest(id: number) {
        setIsLoading(true)

        await deleteRequest(id)

        debouncedSearchChange(vendorSearch, referenceSearch, pageSize, pageNumber)
    }

    return (
        <main className="container-fluid mb-5 mt-5">
            <div className="d-grid justify-content-center">
                <div className="listview listview-lg">
                    <h1 className="mb-3 text-center">Requests</h1>
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col">
                                            <div className="row g-3">
                                                <div className="col-auto">
                                                    <label htmlFor="requestSearchVendor" className="col-form-label">Vendor</label>
                                                </div>
                                                <div className="col">
                                                    <input
                                                        autoComplete='off'
                                                        autoCorrect='off'
                                                        value={vendorSearch}
                                                        onChange={handleVendorSearchChange}
                                                        type="text" id="requestSearchVendor" className="form-control" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="row g-3">
                                                <div className="col-auto">
                                                    <label htmlFor="requestSearchReference" className="col-form-label">Ref.</label>
                                                </div>
                                                <div className="col">
                                                    <input
                                                        autoComplete='off'
                                                        autoCorrect='off'
                                                        value={referenceSearch}
                                                        onChange={handleReferenceSearchChange}
                                                        type="text" className="form-control" id="requestSearchReference" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-auto">
                            <div className="card">
                                <div className="card-body">
                                    <Link href={'/requests/create'}>
                                        <button type="button" style={{width: '9rem'}} className="btn btn-primary"><i className="bi bi-plus"></i></button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        isLoading
                        ? <h5 className="mt-5 mb-5 text-center text-secondary">Searching...</h5>
                        : (
                            requests.length < 1
                            ? <h5 className="mt-5 text-center text-secondary">No request found</h5>
                            : <ul className="list-group mt-3">
                            {
                                requests.map(r =>
                                    <li key={r.id} className='list-group-item list-group-item-action'>
                                        <div className="row">
                                            <div className="col-auto">
                                                <a onClick={() => handleStarRequest(r.id, !r.starred)} role='button'>
                                                    {
                                                        r.starred
                                                        ? <i className="bi-star-fill"></i>
                                                        : <i className="bi-star"></i>
                                                    }
                                                </a>
                                            </div>
                                            <div className="col-2 fw-bold text-secondary">{r.reference}</div>
                                            <div className="col">{r.vendor_name}</div>
                                            <div className="col fw-bold text-secondary">{r.source_document}</div>
                                            <div className="col-2">
                                                <span className="badge text-bg-info">
                                                    {toStringDelimit(r.total_cost)}
                                                </span>
                                            </div>
                                            <div className="col-auto">
                                                {
                                                    r.accepted_at
                                                    ? <span className="badge bg-success">Accepted</span>
                                                    : <span className="badge bg-secondary">RFQ</span>
                                                }
                                            </div>
                                            <div className="col-auto">
                                                <div className="row g-3">
                                                    <div className="col">
                                                        <Link className='text-secondary' href={`/requests/${r.id}`}><i className="bi bi-pencil"></i></Link>
                                                    </div>
                                                    <div className="col">
                                                        <a onClick={() => handleDeleteRequest(r.id)} role="button" className="text-danger"><i className="bi bi-trash"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                )
                            }
                        </ul>
                        )
                    }
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
                        <div className="col"></div>
                    </div>
                </div>
            </div>
        </main>
    )
}