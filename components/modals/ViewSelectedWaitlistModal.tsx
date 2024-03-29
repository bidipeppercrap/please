import { RequestProduct } from '@/db/types/request_product'

export default function ViewSelectedWailistModal({
    modalTitle = 'Selected Waitlist',
    onModalClose,
    selected,
    removeSelected,
    clearSelection,
    onDelete,
    onRequest,
    onWaitlist = null,
    onReorder = null
}: {
    modalTitle: string,
    onModalClose: any,
    selected: RequestProduct[],
    removeSelected: any,
    clearSelection: any,
    onDelete: any | null,
    onRequest: any,
    onWaitlist: any | null,
    onReorder: ((newOrder: number) => Promise<void>) | null
}) {
    function handleReorderKeyDown(e: any) {
        if (e.key === 'Enter' && onReorder) onReorder(e.target.value)
    }

    return (
        <div className="modal">
            <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{modalTitle}</h5>
                        <button onClick={onModalClose} type="button" className="btn-close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-grid">
                            <button onClick={clearSelection} disabled={selected.length < 1} type="button" className="btn btn-sm btn-secondary">Clear</button>
                        </div>
                        {
                            selected.length > 0
                            ?
                            <ul className="list-group mt-3">
                                {selected.map(item =>
                                    <li key={item.id} className={`list-group-item list-group-item ${item.is_section ? 'bg-body-secondary text-secondary fw-bold' : ''}`}>
                                        <div className="row align-items-center">
                                            <div className="col">{item.description}</div>
                                            <div className="col-auto">
                                                <button onClick={() => removeSelected(item)} type="button" className="btn btn-sm text-danger"><i className="bi bi-x"></i></button>
                                            </div>
                                        </div>
                                    </li>    
                                )}
                            </ul>
                            : null
                        }
                    </div>
                    <div className="modal-footer">
                        <div className="row g-2">
                            {
                                onReorder
                                ? (
                                    <div className="col">
                                        <input
                                            onKeyDown={handleReorderKeyDown}
                                            type="number" autoComplete='off' className="form-control" />
                                    </div>
                                )
                                : null
                            }
                            {
                                onWaitlist
                                ? <div className='col-auto'><button onClick={onWaitlist} type="button" className="btn btn-secondary">Move to Waitlist</button></div>
                                : null
                            }
                            <div className="col-auto">
                                <button onClick={onRequest} type="button" className="btn btn-secondary">Move to Request</button>
                            </div>
                            <div className="col-auto">
                                <button disabled={!onDelete} onClick={onDelete} type="button" className="btn btn-danger"><i className="bi bi-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}