'use client'

import RequestForm from '@/components/RequestForm'
import { NewRequest } from '@/db/types/request'
import { Vendor } from '@/db/types/vendor'
import { createRequest, getLastRequestId } from '@/repositories/request'
import { formatISO } from 'date-fns'
import { debounce } from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const defaultRequest: NewRequest = {
    reference: '',
    note: '',
    source_document: '',
    vendor_name: '',
    vendor_id: null,
    accepted_at: '',
    updated_at: ''
}

export default function CreateRequestPage() {
    const router = useRouter()

    const [newRequest, setNewRequest] = useState<NewRequest>(defaultRequest)
    const [errorMessage, setErrorMessage] = useState('')

    const debouncedErrorMessage = useCallback(debounce(() => setErrorMessage(''), 10_000), [])

    useEffect(() => {
        debouncedErrorMessage()
    }, [errorMessage])

    function handleReferenceChange(e: any) {
        setNewRequest({
            ...newRequest,
            reference: e.target.value
        })
    }

    function handleSourceDocumentChange(e: any) {
        setNewRequest({
            ...newRequest,
            source_document: e.target.value
        })
    }

    function handleVendorNameChange(e: any) {
        setNewRequest({
            ...newRequest,
            vendor_name: e.target.value
        })
    }

    function handleNoteChange(e: any) {
        setNewRequest({
            ...newRequest,
            note: e.target.value
        })
    }

    function handleVendorChange(vendor: Vendor | null) {
        setNewRequest({
            ...newRequest,
            vendor_id: vendor ? vendor.id : null,
            vendor_name: vendor ? vendor.name : null
        })
    }

    function handleAcceptedAtChange(date: string) {
        if (!date) setNewRequest({
            ...newRequest,
            accepted_at: undefined
        })
        else setNewRequest({
            ...newRequest,
            accepted_at: date
        })
    }

    function clearRequest() {
        setNewRequest({...defaultRequest})
    }

    async function handleSave() {
        const data = {...newRequest}

        if (!data.reference) {
            const lastId = await getLastRequestId()
            
            data.reference = `P${lastId + 1}`
        }

        data.accepted_at =  !data.accepted_at || data.accepted_at.length < 1 ? undefined : data.accepted_at
        data.updated_at = formatISO(Date.now())

        try {
            const { id } = await createRequest(data)
            
            router.push(`/requests/${id}`)
        } catch (error) {
            console.log(error)
            setErrorMessage('Something went wrong when creating, please view console logs.')
        }
    }

    return (
        <main className="container-fluid mb-5 mt-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="mb-3 text-center">Create Requests</h1>
                    <RequestForm
                        request={newRequest}
                        handler={{
                            referenceChange: handleReferenceChange,
                            vendorNameChange: handleVendorNameChange,
                            sourceDocumentChange: handleSourceDocumentChange,
                            vendorChange: handleVendorChange,
                            noteChange: handleNoteChange,
                            acceptedAtChange: handleAcceptedAtChange
                        }}
                        onPrint={null}
                        onSave={handleSave}
                        onDelete={null}
                    />
                    {
                        errorMessage.length > 0
                        ? <div className="alert alert-danger">{errorMessage}</div>
                        : null
                    }
                    <h5 className="text-secondary text-center mt-5">Save request first to add product</h5>
                </div>
            </div>
        </main>
    )
}