import { useEffect, useMemo, useState } from 'react'
import { Request } from '@/db/types/request'
import { debounce } from 'lodash'
import { findRequest } from '@/repositories/request'
import Pagination from '../Pagination'

export default function RequestSelectionModal({
    excludeId,
    onModalClose,
    onRequestSelect
}: {
    excludeId: number | null,
    onModalClose: () => void,
    onRequestSelect: (data: Request) => void
}) {
    const pageSize = 25

    const [requests, setRequests] = useState<Request[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [vendorSearch, setVendorSearch] = useState('')
    const [referenceSearch, setReferenceSearch] = useState('')
    const [pageNumber, setPageNumber] = useState(1)
    const [pageCount, setPageCount] = useState(1)

    const debouncedSearchChange = useMemo(() => debounce(searchRequest, 500), [])

    useEffect(() => {
        setIsLoading(true)
        debouncedSearchChange(vendorSearch, referenceSearch, pageSize, pageNumber, excludeId)
    }, [pageNumber, vendorSearch, referenceSearch, debouncedSearchChange, excludeId])

    async function searchRequest(vendor: string, reference: string, pageSize: number, pageNumber: number, excludeId: number) {
        const { data, count } = await findRequest({
            vendor_name: vendor,
            reference: reference
        }, pageSize, pageNumber, excludeId)

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

    return (
        <div className="modal">
            <div className="modal-dialog modal-dialog-scrollable" style={{maxWidth: '50vw'}}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Select Request</h5>
                        <button onClick={onModalClose} type="button" className="btn-close"></button>
                    </div>
                    <div className="modal-body">
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
                        {
                            isLoading
                            ? <h5 className="mt-5 mb-5 text-center text-secondary">Searching...</h5>
                            : (
                                requests.length > 0
                                ? (
                                    <ul className="list-group mt-3">
                                        {requests.map(r =>
                                            <li key={r.id} onClick={() => onRequestSelect(r)} role='button' className="list-group-item list-group-item-action">
                                                <div className="row">
                                                    <div className="col-2 fw-bold text-secondary">
                                                        {r.reference}
                                                    </div>
                                                    <div className="col">
                                                        {r.vendor_name}
                                                    </div>
                                                    <div className="col fw-bold text-secondary">
                                                        {r.source_document}
                                                    </div>
                                                    <div className="col-auto">
                                                        {
                                                            r.accepted_at
                                                            ? <span className="badge bg-success">Accepted</span>
                                                            : <span className="badge bg-secondary">RFQ</span>
                                                        }
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <h5 className="mt-5 mb-5 text-center text-secondary">No request found</h5>
                                )
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
            </div>
        </div>
    )
}