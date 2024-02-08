'use client'

import { RequestProductDetail } from '@/db/types/request_product'
import { Request } from '@/db/types/request'
import { HeaderConfig, fetchHeader } from '@/repositories/config'
import { findRequestById } from '@/repositories/request'
import { findRequestProduct } from '@/repositories/request-product'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface SectionData {
    section: string | null,
    products: RequestProductDetail[]
}

export default function RequestPrint({ params }: { params: { id: number }}) {
    const [showQuantity, setShowQuantity] = useState(true)
    const [showNote, setShowNote] = useState(false)
    const [request, setRequest] = useState<Request | null>(null)
    const [products, setProducts] = useState<RequestProductDetail[]>([])
    const [tableData, setTableData] = useState<SectionData[]>([])
    const [header, setHeader] = useState<HeaderConfig>({
        name: '',
        phone: '',
        phoneUrl: '',
        email: ''
    })
    const [csvUrl, setCsvUrl] = useState('')
    const [csvOptions, setCsvOptions] = useState({
        showSection: false
    })

    const handlers = {
        showQuantityChange() { setShowQuantity(!showQuantity) },
        showNoteChange() { setShowNote(!showNote) },
        showSectionCSVChange() {
            setCsvUrl('')
            setCsvOptions({
                ...csvOptions,
                showSection: !csvOptions.showSection
            })
        }
    }

    useEffect(() => {
        const refinedData = [['description', 'quantity', 'unit', 'note']]

        products.forEach(row =>
            row.is_section
            ? csvOptions.showSection ? refinedData.push(Object.values([row.description, '', '', ''])) : null
            : refinedData.push(Object.values([row.description, row.quantity.toString(), row.unit || '', row.note || '']))
        )

        let csv = ''

        refinedData.forEach(row =>
            csv += row.join(',') + '\n'
        )

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
        const objUrl = URL.createObjectURL(blob)

        setCsvUrl(objUrl)
    }, [products, csvOptions.showSection])

    useEffect(() => {
        const sections: SectionData[] = []

        products.map((p, index) => {
            if (!p.is_section && index === 0) sections.push({
                section: null,
                products: []
            })

            if (p.is_section) sections.push({
                section: p.description,
                products: []
            })
            else sections.at(-1)?.products.push(p)
        })

        setTableData(sections)
    }, [products])

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await findRequestProduct({ description: '', request_id: params.id }, null, 1, 'order_in_request')
            const headerConfig = await fetchHeader()
            const requestData = await findRequestById(params.id)

            setProducts(data)
            if (headerConfig) setHeader(headerConfig)
            if (requestData) setRequest(requestData)
        }

        fetchData()
    }, [params.id])

    return (
        <main className="print-preview">
            <div className="print-hide d-grid mt-5">
                <div className="card" style={{justifySelf: 'center'}}>
                    <div className="card-body">
                        <h5 className="card-title">Print Option</h5>
                        <div className="row">
                            <div className="col-auto">
                                <div className="form-check form-switch">
                                    <input
                                        checked={showQuantity}
                                        onChange={handlers.showQuantityChange}
                                        role='switch' type="checkbox" id="showQuantityInput" className="form-check-input" />
                                    <label htmlFor="showQuantityInput" className="form-check-label">Show Quantity</label>
                                </div>
                            </div>
                            <div className="col-auto">
                                <div className="form-check form-switch">
                                    <input
                                        checked={showNote}
                                        onChange={handlers.showNoteChange}
                                        role='switch' type="checkbox" id="showNoteInput" className="form-check-input" />
                                    <label htmlFor="showNoteInput" className="form-check-label">Show Note</label>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <h5 className="card-title">CSV Option</h5>
                        <div className="row mb-2">
                            <div className="col-auto">
                                <div className="form-check form-switch">
                                    <input
                                        checked={csvOptions.showSection}
                                        onChange={handlers.showSectionCSVChange}
                                        role='switch' type="checkbox" id="showSectionCSV" className="form-check-input" />
                                    <label htmlFor="showSectionCSV" className="form-check-label">Show Section</label>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col fw-bold text-secondary">
                                {
                                    csvUrl && request
                                    ? <a href={csvUrl} className="btn btn-sm btn-outline-secondary" download={`${request.reference}.csv`}>Download CSV</a>
                                    : 'Loading CSV File...'
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <hr className='mt-5'></hr>
            </div>
            <header className='mb-3'>
                <h1 className='mb-3'>Request for Quotation</h1>
                {
                    header.name || header.phone || header.email
                    ? (
                        <div className="row">
                            <div className="col-auto">
                                <div className="border border-5 rounded p-2 w-auto">
                                    {
                                        header.name
                                        ? <div>😀 {header.name}</div>
                                        : null
                                    }
                                    {
                                        header.phone
                                        ? (
                                            <div>
                                                {
                                                    header.phoneUrl
                                                    ? <a target='_blank' className='text-reset text-decoration-none' href={header.phoneUrl}>📞 {header.phone}</a>
                                                    : `📞 ${header.phone}`
                                                }
                                            </div>
                                        )
                                        : null
                                    }
                                    {
                                        header.email
                                        ? (
                                            <div>
                                                <a className='text-reset text-decoration-none' href={`mailto:${header.email}`}>📧 {header.email}</a>
                                            </div>
                                        )
                                        : null
                                    }
                                </div>
                            </div>
                            <div className="col"></div>
                        </div>
                    )
                    : null
                }
                <hr />
                {
                    request
                    ? (
                        <div>
                            <h3 className='fw-bold'>{request.reference}</h3>
                            <div className='badge bg-secondary'>Last updated at {format(request.updated_at, 'yyyy MMM dd - HH:mm aa')}</div>
                        </div>
                    )
                    : null
                }
            </header>
            <hr className='mb-5' />
            {
                tableData.map((td, index) =>
                    td.products
                    ?
                        <div key={index} className={`${tableData.indexOf(td) === -1 ? '' : 'mb-5'}`}>
                            {td.section ? <h2 className='mb-3'>{td.section}</h2> : null}
                            <table className="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th scope='col' className='col-1'>#</th>
                                        <th scope='col'>Product</th>
                                        {showQuantity ? <th scope='col' className='col-2'>Quantity</th> : null}
                                        {showNote ? <th scope='col' className='col-3'>Note</th> : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        td.products.map((p, index) =>
                                            <tr key={p.id}>
                                                <th scope='row' className='text-end'>{index + 1}</th>
                                                <td>{p.description}</td>
                                                {showQuantity ? <td className='text-end'>
                                                    {
                                                        p.unit
                                                        ? <><strong>{p.quantity}</strong> {p.unit}</>
                                                        : <strong>{p.quantity}</strong>
                                                    }
                                                </td> : null}
                                                {showNote ? <td>{p.note}</td> : null}
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    : null
                )
            }
            
        </main>
    )
}