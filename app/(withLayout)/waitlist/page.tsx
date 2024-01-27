'use client'

import ListSelectorMenu from '@/components/ListSelectorMenu'
import Pagination from '@/components/Pagination'
import WaitList from '@/components/WaitList'
import RequestSelectionModal from '@/components/modals/RequestSelectionModal'
import ViewSelectedWailistModal from '@/components/modals/ViewSelectedWaitlistModal'
import { Request } from '@/db/types/request'
import { RequestProductDetail } from '@/db/types/request_product'
import { deleteRequestProduct, findRequestProduct, moveWaitlistToRequest } from '@/repositories/request-product'
import { debounce } from 'lodash'
import { useState, useCallback, useEffect } from 'react'

export default function WaitlistPage() {
    const pageSize = 20

    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [waitlist, setWaitlist] = useState<RequestProductDetail[]>([])
    const [selected, setSelected] = useState<RequestProductDetail[]>([])
    const [activeModal, setActiveModal] = useState<'selection' | 'requests' | null>(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [pageCount, setPageCount] = useState(1)

    const debouncedHandleSearchChange = useCallback(debounce(searchWaitlist, 500), [])

    useEffect(() => {
        refreshList(search)
    }, [pageNumber])
    
    async function searchWaitlist(description: string, pageSize: number, pageNumber: number) {
        const { data, count } = await findRequestProduct({ description }, pageSize, pageNumber, 'description')

        setPageCount(Math.ceil(count / pageSize))
        setWaitlist(data)
        setIsLoading(false)
    }

    function handleSearchChange(e: any) {
        const query = e.target.value

        setPageNumber(1)
        refreshList(query)
    }

    function refreshList(query: string) {
        setWaitlist([])
        setIsLoading(true)
        setSearch(query)
        debouncedHandleSearchChange(query, pageSize, pageNumber)
    }

    async function handleItemDelete(id: number) {
        await deleteRequestProduct([id])

        refreshList(search)
    }

    function handleSelectionChange(item: RequestProductDetail) {
        const found = selected.filter(s => s.id === item.id)

        if (found.length > 0) {
            const removed = selected.filter(p => p.id !== item.id)

            setSelected([...removed])
        } else {
            setSelected(prev => [...prev, item])
        }
    }

    function handleDeselectAll() {
        const removed = selected.filter(s => {
            const found = waitlist.filter(f => f.id === s.id)

            return found.length < 1
        })

        setSelected([...removed])
    }

    function handleSelectAllPage() {
        const fresh = waitlist.filter(i => {
            const found = selected.filter(f => f.id === i.id)

            return found.length < 1
        })

        setSelected(prev => [...prev, ...fresh])
    }

    async function handleDeleteSelected() {
        const ids = selected.map(s => s.id)
        setActiveModal(null)
        setSelected([])
        
        await deleteRequestProduct(ids)
        refreshList(search)
    }

    function handleRequestSelected() {
        setActiveModal('requests')
    }

    async function handleMoveToRequest(data: Request) {
        setActiveModal(null)
        
        await moveWaitlistToRequest(selected, data.id)
        
        setSelected([])
        refreshList(search)
    }

    return (
        <main className="container-fluid mb-5 mt-5">
            {
                activeModal === 'selection'
                ? <ViewSelectedWailistModal
                    modalTitle='Selected Waitlist'
                    onWaitlist={null}
                    selected={selected}
                    onModalClose={() => setActiveModal(null)}
                    removeSelected={handleSelectionChange}
                    clearSelection={() => setSelected([])}
                    onDelete={handleDeleteSelected}
                    onRequest={handleRequestSelected}
                />
                : null
            }
            {
                activeModal === 'requests'
                ? <RequestSelectionModal
                    excludeId={null}
                    onRequestSelect={handleMoveToRequest}
                    onModalClose={() => setActiveModal('selection')}
                />
                : null
            }
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="mb-3 text-center">Waitlist</h1>
                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-auto">
                                    <label htmlFor="searchInput" className="col-form-label">Search</label>
                                </div>
                                <div className="col">
                                    <input
                                        value={search}
                                        onChange={handleSearchChange}
                                        type="text" name="" id="searchInput" className="form-control" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <ListSelectorMenu
                            onDeselectAll={handleDeselectAll}
                            onSelectAllPage={handleSelectAllPage}
                            onViewSelected={() => setActiveModal('selection')}
                            selected={selected}
                        />
                    </div>
                    <WaitList
                        list={waitlist}
                        isLoading={isLoading}
                        onDelete={handleItemDelete}
                        onSelectionChange={handleSelectionChange}
                        selected={selected}
                    />
                    <div className="row align-items-center justify-content-center mt-3">
                        <div className="col text-secondary">Page {pageNumber} / {pageCount}</div>
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