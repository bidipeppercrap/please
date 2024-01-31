import { Product } from '@/db/types/product'
import { useState } from 'react'

export default function ProductList(
    { list, isLoading, deleteProduct, selected, onSelectionChange, onSave }:
    { list: any[], isLoading: boolean, deleteProduct: any, selected: any[], onSelectionChange: any, onSave: (product: Product) => Promise<void> }
) {
    const [editing, setEditing] = useState<Product | null>(null)

    const handlers = {
        editNameChange(e: any) {
            const { value } = e.target

            if (editing) setEditing({
                ...editing,
                name: value
            })
        },
        editNameKeyDown(e: any) {
            if (e.key === 'Enter') saveProduct()
            if (e.key === 'Escape') setEditing(null)
        },
        clearCategory() {

        }
    }
    
    function isSelected(product: any): boolean {
        const found = selected.filter(p => p.id === product.id)
        return found.length > 0
    }

    function editProduct(product: Product) {
        setEditing(product)
    }

    async function saveProduct() {
        if (editing) await onSave(editing)

        setEditing(null)
    }

    if (isLoading)
        return <h5 className="text-secondary text-center mt-5 mb-5">Searching...</h5>
    return (
        <ul className="list-group">
            {list.map(product =>
                <li key={product.id} className="list-group-item list-group-item-action">
                    {
                        editing && editing.id === product.id
                        ? (
                            <div className="row">
                                <div className="col">
                                    <input
                                        autoComplete='off'
                                        autoFocus={true}
                                        onKeyDown={handlers.editNameKeyDown}
                                        onChange={handlers.editNameChange}
                                        value={editing.name}
                                        type="text" className="form-control" />
                                </div>
                                <div className="col-5">
                                    <div className="input-group">
                                        <input type="text" className="form-control" />
                                        <button onClick={handlers.clearCategory} type="button" className="btn btn-danger"><i className="bi bi-x-lg"></i></button>
                                    </div>
                                </div>
                            </div>
                        )
                        : (
                            <div className="row">
                                <div className="col-auto">
                                    <input
                                        checked={isSelected(product)}
                                        onChange={() => onSelectionChange(product)}
                                        type="checkbox" name="" id={`productCheckbox-${product.id}`} className="form-check-input" />
                                </div>
                                <div onClick={() => editProduct(product)} className="col">{product.name}</div>
                                <div className="col-auto">
                                    <a onClick={() => deleteProduct(product.id)} role="button" className="bi bi-trash text-danger"></a>
                                </div>
                            </div>
                        )
                    }
                </li>    
            )}
        </ul>
    )
}