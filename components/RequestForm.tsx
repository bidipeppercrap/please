import { NewRequest } from '@/db/types/request'
import { Vendor } from '@/db/types/vendor'
import { findRequestById } from '@/repositories/request'
import { findVendor, findVendorById } from '@/repositories/vendor'
import { formatISO, isValid, parseISO } from 'date-fns'
import { debounce } from 'lodash'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const defaultRequest: NewRequest = {
    reference: '',
    note: '',
    source_document: '',
    vendor_name: '',
    vendor_id: null,
    accepted_at: '',
    updated_at: Date.now().toString()
}

export default function RequestForm({
    request_id = null,
    onSave,
    onDelete,
    onPrint
}: {
    request_id: number | null,
    onSave: (request: NewRequest) => Promise<void>,
    onDelete: any,
    onPrint: (() => void) | null
}) {
    const [ready, setReady] = useState(false)
    const [request, setRequest] = useState<NewRequest>(defaultRequest)
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [vendorList, setVendorList] = useState<Vendor[]>([])
    const [vendorDisplay, setVendorDisplay] = useState('')
    const [vendorSelection, setVendorSelection] = useState(false)
    const [vendorSearching, setVendorSearching] = useState(false)
    const [vendorIndex, setVendorIndex] = useState(-1)

    const [acceptedAtError, setAcceptedAtError] = useState(false)

    const debouncedHandleVendorChange = useMemo(() => debounce(searchVendor, 500), [])

    useEffect(() => {
        const fetchData = async () => {
            if (!request_id) return

            const req = await findRequestById(request_id)

            if (req) {
                const parsed: NewRequest = {
                    reference: req.reference,
                    note: req.note,
                    source_document: req.source_document,
                    accepted_at: req.accepted_at ? formatISO(req.accepted_at, { representation: 'date' }) : '',
                    updated_at: req.updated_at ? formatISO(req.updated_at) : '',
                    vendor_name: req.vendor_name,
                    vendor_id: req.vendor_id
                }

                setRequest(parsed)
                setReady(true)
            }
        }

        fetchData()
    }, [request_id])

    useEffect(() => {
        if (request.vendor_id) {
            const fetchVendor = async () => await findVendorById(request.vendor_id!)

            fetchVendor().then(result => setVendor(result!))
        }
    }, [request.vendor_id])

    useEffect(() => {
        const vendorName = vendor ? vendor.name : ''
        const vendorId = vendor ? vendor.id : null

        setVendorDisplay(vendorName)
        setRequest(r => { return {
            ...r,
            vendor_id: vendorId
        }})
    }, [vendor])

    useEffect(() => {
        debouncedHandleVendorChange(vendorDisplay)
    }, [vendorDisplay, debouncedHandleVendorChange])

    async function searchVendor(name: string) {
        const { data } = await findVendor({ name }, 5)

        setVendorList(data)
        setVendorSearching(false)
    }

    function handleVendorBlur() {
        setVendorSelection(false)

        if (!vendor) setVendorDisplay('')
        else setVendorDisplay(vendor.name)
    }

    function handleVendorChange(e: any) {
        setVendorDisplay(e.target.value)
        setVendorSearching(true)
        setVendorSelection(true)
    }

    function handleVendorFocus() {
        setVendorDisplay('')
        setVendorSelection(true)
    }

    function selectVendor() {
        setVendor(vendorList[vendorIndex])
        setRequest({
            ...request,
            vendor_name: vendorList[vendorIndex].name
        })
        setVendorList([])
        setVendorSelection(false)
        setVendorIndex(-1)
    }

    function handleVendorKeyDown(e: any) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault()
        if (e.key == 'ArrowDown') moveSelection(1)
        if (e.key == 'ArrowUp') moveSelection(-1)
        if (e.key === 'Enter') selectVendor()
        e.stopPropagation()
    }

    function moveSelection(step: number) {
        if (vendorIndex + step < -1) return
        if (vendorIndex > -1 && vendorIndex + step === vendorList.length) return
        setVendorIndex(prev => prev + step)
    }

    function clearVendor() {
        setVendor(null)
    }

    const handlers = {
        referenceChange(e: any) {
            setRequest({
                ...request,
                reference: e.target.value
            })
        },
        vendorNameChange(e: any) {
            setRequest({
                ...request,
                vendor_name: e.target.value
            })
        },
        vendorChange: () => {},
        sourceDocumentChange(e: any) {
            setRequest({
                ...request,
                source_document: e.target.value
            })
        },
        noteChange(e: any) {
            setRequest({
                ...request,
                note: e.target.value
            })
        },
        acceptedAtChange(e: any) {
            const value = e.target.value

            if (!value) setRequest({
                ...request,
                accepted_at: undefined
            })
            else setRequest({
                ...request,
                accepted_at: value
            })

            if (value.length < 1) {
                setAcceptedAtError(false)
                return
            }

            const parsed = parseISO(value)

            if (isValid(parsed)) {
                setAcceptedAtError(false)
            }
            else setAcceptedAtError(true)
        }
    }

    if (request_id && !ready) return (
        <div className="card">
            <div className="card-body p-5">
                <h1 className="text-center mb-5 mt-5">Loading...</h1>
            </div>
        </div>
    )

    return (
        <div className="card">
            <div className="card-body">
                <div className="row mb-3">
                    <div className="col-auto">
                        <input
                            value={request.reference}
                            onChange={handlers.referenceChange}
                            autoComplete='off'
                            autoCorrect='off'
                            placeholder='P#####' type="text" name="" id="requestName" className="form-control form-control-lg" />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-auto">
                        <label htmlFor="requestVendorName" className="form-label">Vendor Name</label>
                        <input
                            value={request.vendor_name || ''}
                            onChange={handlers.vendorNameChange}
                            autoComplete='off'
                            autoCorrect='off'
                            type="text" name="" id="requestVendorName" className="form-control" />
                    </div>
                    <div className="col"></div>
                    <div className="col-auto">
                        <label htmlFor="requestSourceDocument" className="form-label">Source Document</label>
                        <input
                            value={request.source_document || ''}
                            onChange={handlers.sourceDocumentChange}
                            autoComplete='off'
                            autoCorrect='off'
                            type="text" id='requestSourceDocument' className="form-control" />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-auto">
                        <label htmlFor="requestVendor" className="form-label">Vendor</label>
                        <div className="input-group">
                            <input
                                value={vendorDisplay}
                                onChange={handleVendorChange}
                                onBlur={handleVendorBlur}
                                onFocus={handleVendorFocus}
                                onKeyDown={handleVendorKeyDown}
                                autoComplete='off'
                                autoCorrect='off'
                                id='requestVendor' type="text" className="form-control" />
                            <button onClick={clearVendor} type="button" className="btn btn-danger"><i className="bi bi-x-lg"></i></button>
                        </div>
                        {
                            vendorSelection
                            ?
                                <ul className="list-group position-absolute mt-2" style={{width: '18rem'}}>
                                    {
                                        vendorDisplay.length > 0
                                        ? (
                                            vendorSearching
                                            ? <li className="list-group-item text-secondary">Searching...</li>
                                            : (
                                                vendorList.length < 1
                                                ? <li className="list-group-item text-secondary">No vendor found</li>
                                                : vendorList.map((v, index) => <li key={v.id} className={`list-group-item ${vendorIndex === index ? 'active' : ''}`}>{v.name}</li>)
                                            )
                                        )
                                        : <li className="list-group-item text-secondary">Type vendor name</li>
                                    }
                                </ul>
                            : null
                        }
                    </div>
                    <div className="col"></div>
                    <div className="col-auto">
                        <label htmlFor="requestAcceptedAt" className="form-label">Accepted At</label>
                        <input
                            value={request.accepted_at || ''}
                            onChange={handlers.acceptedAtChange}
                            autoComplete='off'
                            autoCorrect='off'
                            id='requestAcceptedAt' type="text" className="form-control" />
                        {
                            acceptedAtError
                            ? <div className="invalid-feedback">Wrong date format</div>
                            : <div className="valid-feedback">Looks good!</div>
                        }
                    </div>
                </div>
                <div className="row align-items-end">
                    <div className="col-auto">
                        <label htmlFor="requestNote" className="form-label">Note</label>
                        <textarea
                            value={request.note || ''}
                            onChange={handlers.noteChange}
                            autoComplete='off'
                            autoCorrect='off'
                            style={{resize: 'none', width: '18rem'}} rows={3} id='requestNote' className="form-control" />
                    </div>
                    <div className="col"></div>
                    {
                        onPrint !== null
                        ? (
                            <div className="col-auto">
                                <Link
                                    href={`/print/request/${request_id}`}
                                    onClick={onPrint}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    type="button" className="btn btn-lg btn-outline-secondary">
                                    Print
                                </Link>
                            </div>
                        )
                        : null
                    }
                    {
                        onDelete
                        ? (
                            <div className="col-auto">
                                <button onClick={onDelete} type="button" className="btn btn-lg btn-danger">Delete</button>
                            </div>
                        )
                        : null
                    }
                    <div className="col-auto">
                        <button
                            disabled={acceptedAtError}
                            onClick={() => onSave(request)}
                            style={{width: '5rem'}} type="button" className="btn btn-lg btn-primary">Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}