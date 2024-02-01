'use client'

import { useEffect, useMemo, useState } from 'react'
import { HeaderConfig, fetchHeader, saveHeader } from '@/repositories/config'
import { debounce } from 'lodash'

export default function HeaderConfigPage() {
    return (
        <main className="container-fluid mt-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="text-center">Header Config</h1>
                    <HeaderForm />
                </div>
            </div>
        </main>
    )
}

interface SaveStatus {
    message: string
    status: 'error' | 'success' | null
}

function HeaderForm() {
    const headerDefault: HeaderConfig = useMemo(() => {
        return {
            name: '',
            phone: '',
            phoneUrl: '',
            email: ''
        }
    }, [])
    const saveStatusDefault: SaveStatus = {
        message: '',
        status: null
    }

    const [header, setHeader] = useState<HeaderConfig>(headerDefault)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>(saveStatusDefault)

    const debouncedClearSaveStatus = useMemo(() => debounce(() => setSaveStatus({
        message: '',
        status: null
    }), 5000), [])

    useEffect(() => {
        const fetch = async () => {
            const data = await fetchHeader() || headerDefault
            setHeader(data)
        }

        fetch()
    }, [headerDefault])

    useEffect(() => debouncedClearSaveStatus(), [saveStatus, debouncedClearSaveStatus])

    const handlers = {
        headerNameChange(e: any) {
            setHeader({
                ...header,
                name: e.target.value
            })
        },
        headerPhoneChange(e: any) {
            setHeader({
                ...header,
                phone: e.target.value
            })
        },
        headerPhoneUrlChange(e: any) {
            setHeader({
                ...header,
                phoneUrl: e.target.value
            })
        },
        headerEmailChange(e: any) {
            setHeader({
                ...header,
                email: e.target.value
            })
        },
        async headerSave() {
            try {
                await saveHeader(header)
                
                setSaveStatus({
                    message: 'Saved',
                    status: 'success'
                })
            } catch (error) {
                console.log(error)
                setSaveStatus({
                    message: 'An error occured. Please see console logs',
                    status: 'error'
                })
            }
        }
    }

    return (
        <div className="card">
            <div className="card-body">
                <div className="mb-3">
                    <label htmlFor="headerName" className="form-label">Name</label>
                    <input
                        value={header.name}
                        onChange={handlers.headerNameChange}
                        id='headerName' type="text" className="form-control" />
                </div>
                <div className="mb-3">
                    <label htmlFor="headerPhone" className="form-label">Phone</label>
                    <input
                        value={header.phone}
                        onChange={handlers.headerPhoneChange}
                        type="text" id='headerPhone' className="form-control" />
                </div>
                <div className="mb-3">
                    <label htmlFor="headerPhoneUrl" className="form-label">Phone Url</label>
                    <input
                        value={header.phoneUrl}
                        onChange={handlers.headerPhoneUrlChange}
                        type="text" id='headerPhoneUrl' className="form-control" />
                </div>
                <div className="mb-3">
                    <label htmlFor="headerEmail" className="form-label">Email</label>
                    <input
                        value={header.email}
                        onChange={handlers.headerEmailChange}
                        type="text" id='headerEmail' className="form-control" />
                </div>
                <button onClick={handlers.headerSave} type="button" className="btn btn-primary">Save</button>
                {
                    saveStatus.status === 'error'
                    ? <div className="mt-3 alert alert-danger">{saveStatus.message}</div>
                    : saveStatus.status === 'success'
                    ? <div className="mt-3 alert alert-success">{saveStatus.message}</div>
                    : null
                }
            </div>
        </div>
    )
}