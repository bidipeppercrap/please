import { RequestProduct } from '@/db/types/request_product'

export default function ViewSelectedWailistModal({
    modalTitle = 'Selected Waitlist',
    onModalClose,
    selected,
    removeSelected,
    clearSelection,
    onDelete,
    onRequest,
    onWaitlist = null
}: {
    modalTitle: string,
    onModalClose: any,
    selected: RequestProduct[],
    removeSelected: any,
    clearSelection: any,
    onDelete: any | null,
    onRequest: any,
    onWaitlist: any | null
}) {
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
                                    <li key={item.id} className="list-group-item list-group-item">
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
                        {
                            onWaitlist
                            ? <button onClick={onWaitlist} type="button" className="btn btn-secondary">Move to Waitlist</button>
                            : null
                        }
                        <button onClick={onRequest} type="button" className="btn btn-secondary">Move to Request</button>
                        <button disabled={!onDelete} onClick={onDelete} type="button" className="btn btn-danger"><i className="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
    )
}