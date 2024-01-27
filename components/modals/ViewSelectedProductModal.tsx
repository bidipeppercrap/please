export default function ViewSelectedProductModal({
    onModalClose,
    selected,
    removeSelected,
    clearSelection,
    onDelete,
    onWaitlist,
    onRequest = null
}: {
    onModalClose: any,
    selected: any[],
    removeSelected: any,
    clearSelection: any,
    onDelete: any,
    onWaitlist: any,
    onRequest: (() => void) | null
}) {
    return (
        <div className="modal">
            <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Selected Products</h5>
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
                                {selected.map(product =>
                                    <li key={product.id} className="list-group-item list-group-item">
                                        <div className="row align-items-center">
                                            <div className="col">{product.name}</div>
                                            <div className="col-auto">
                                                <button onClick={() => removeSelected(product)} type="button" className="btn btn-sm text-danger"><i className="bi bi-x"></i></button>
                                            </div>
                                        </div>
                                    </li>    
                                )}
                            </ul>
                            : null
                        }
                    </div>
                    <div className="modal-footer">
                        <button disabled={!onRequest} onClick={onRequest!} type="button" className="btn btn-secondary">Add to Request</button>
                        <button onClick={onWaitlist} type="button" className="btn btn-secondary">Add to Waitlist</button>
                        <button onClick={onDelete} type="button" className="btn btn-danger"><i className="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
    )
}