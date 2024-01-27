export default function ListSelectorMenu({
    onSelectAllPage,
    onDeselectAll,
    onViewSelected,
    selected
}: {
    onSelectAllPage: any,
    onDeselectAll: any,
    onViewSelected: any,
    selected: any[]
}) {
    return (
        <div className="card">
            <div className="row card-body">
                <div className="col">
                    <div className="btn-group">
                        <button onClick={onSelectAllPage} type="button" className="btn btn-sm btn-outline-secondary">Select All this Page</button>
                        <button onClick={onDeselectAll} type="button" className="btn btn-sm btn-outline-secondary">Deselect All</button>
                    </div>
                </div>
                <div className="col-auto">
                    <button disabled={selected.length < 1} onClick={onViewSelected} type="button" className="btn btn-sm btn-outline-primary">View Selected ({selected.length})</button>
                </div>
            </div>
        </div>
    )
}