'use client'

import RequestForm from '@/components/RequestForm'
import { NewRequest } from '@/db/types/request'
import { createRequest, getLastRequestId } from '@/repositories/request'
import { formatISO } from 'date-fns'
import { debounce } from 'lodash'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function CreateRequestPage() {
    const router = useRouter()

    const [errorMessage, setErrorMessage] = useState('')

    const debouncedErrorMessage = useMemo(() => debounce(() => setErrorMessage(''), 10_000), [])

    useEffect(() => {
        debouncedErrorMessage()
    }, [errorMessage, debouncedErrorMessage])

    async function handleSave(request: NewRequest) {
        const data = {...request}

        if (!data.reference) {
            const lastId = await getLastRequestId()
            
            data.reference = `P${lastId + 1}`
        }

        data.accepted_at = !data.accepted_at || data.accepted_at.length < 1 ? undefined : data.accepted_at
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
                        request_id={null}
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