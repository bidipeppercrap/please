export default function ProductList(
    { list, isLoading, deleteProduct, selected, onSelectionChange }:
    { list: any[], isLoading: boolean, deleteProduct: any, selected: any[], onSelectionChange: any }
) {
    function isSelected(product: any): boolean {
        const found = selected.filter(p => p.id === product.id)
        return found.length > 0
    }

    if (isLoading)
        return <h5 className="text-secondary text-center">Searching...</h5>
    if (list.length < 1 && !isLoading)
        return <h5 className='text-secondary text-center'>No product found</h5>
    return (
        <ul className="list-group">
            {list.map(product =>
                <li key={product.id} className="list-group-item list-group-item-action">
                    <div className="row g-2 align-items-center">
                        <div className="col">
                            <input
                                checked={isSelected(product)}
                                onChange={() => onSelectionChange(product)}
                                type="checkbox" name="" id={`productCheckbox-${product.id}`} className="form-check-input me-3" />
                            <label htmlFor={`productCheckbox-${product.id}`} className="form-check-label">{product.name}</label>
                        </div>
                        <div className="col-auto">
                            <button type="button" className="btn btn-sm bi bi-pencil"></button>
                        </div>
                        <div className="col-auto">
                            <button onClick={() => deleteProduct(product.id)} type="button" className="btn btn-sm bi bi-trash text-danger"></button>
                        </div>
                    </div>
                </li>    
            )}
        </ul>
    )
}