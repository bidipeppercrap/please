'use client'

import DuplicateList from '@/components/DuplicateList'
import { useState, useCallback, useEffect } from 'react'
import { debounce } from 'lodash'
import { createVendor, findVendor } from '@/repositories/vendor'

export default function VendorCreatePage() {
    const [name, setName] = useState('')
    const [vendors, setVendors] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const debouncedHandleNameChange = useCallback(debounce(search, 500), [])

    useEffect(() => {
        debouncedHandleNameChange(name)
    }, [name])

    async function search(name: string) {
        const { data } = await findVendor({ name }, 10, 1)

        setVendors(data)
        setIsLoading(false)
    }

    function handleNameChange(e: any) {
        setVendors([])
        setIsLoading(true)
        setName(e.target.value)
    }

    function handleNameKeyUp(e: any) {
        if (e.key != 'Enter') return

        const name = e.target.value

        createVendor({ name })

        setName('')
    }
    
    return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="mb-3 text-center">Create Vendor</h1>
                    <div className="row justify-content-center mb-5">
                        <div className="col-auto">
                            <div className="card" style={{width: '25rem'}}>
                                <div className="card-body">
                                    <label htmlFor="vendorName" className="form-label">Name</label>
                                    <input
                                        value={name}
                                        onChange={handleNameChange}
                                        onKeyUp={handleNameKeyUp}
                                        autoComplete="off"
                                        type="text" name="" id="vendorName" className="form-control"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DuplicateList name={name} list={vendors} isLoading={isLoading}>
                        <ul className="list-group">
                            {vendors.map(vendor =>
                                <li key={vendor.id} className="list-group-item">{vendor.name}</li>    
                            )}
                        </ul>
                    </DuplicateList>
                </div>
            </div>
        </main>
    )
}