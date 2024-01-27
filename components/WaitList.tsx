import { RequestProduct } from '@/db/types/request_product'

export default function WaitList(
    { list, isLoading, onDelete, selected, onSelectionChange }:
    { list: RequestProduct[], isLoading: boolean, onDelete: any, selected: RequestProduct[], onSelectionChange: any }
) {
    function isSelected(requestProduct: RequestProduct): boolean {
        const found = selected.filter(s => s.id === requestProduct.id)
        return found.length > 0
    }

    if (isLoading)
        return <h5 className="text-secondary text-center">Searching...</h5>
    if (list.length < 1 && !isLoading)
        return <h5 className='text-secondary text-center'>No item found</h5>
    return (
        <ul className="list-group">
            {list.map(item =>
                <li key={item.id} className="list-group-item list-group-item-action">
                    <div className="row g-2 align-items-center">
                        <div className="col">
                            <input
                                checked={isSelected(item)}
                                onChange={() => onSelectionChange(item)}
                                type="checkbox" name="" id={`itemCheckbox-${item.id}`} className="form-check-input me-3" />
                            <label htmlFor={`itemCheckbox-${item.id}`} className="form-check-label">{item.description}</label>
                        </div>
                        <div className="col-auto">
                            <button type="button" className="btn btn-sm bi bi-pencil"></button>
                        </div>
                        <div className="col-auto">
                            <button onClick={() => onDelete(item.id)} type="button" className="btn btn-sm bi bi-trash text-danger"></button>
                        </div>
                    </div>
                </li>    
            )}
        </ul>
    )
}