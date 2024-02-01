import { RequestProduct } from '@/db/types/request_product'
import { useState } from 'react'
import ProductSelectionInput from './ProductSelectionInput02'
import { Product } from '@/db/types/product'

export default function WaitList(
    { list, isLoading, onDelete, selected, onSelectionChange, saveWaitlist }:
    { list: RequestProduct[], isLoading: boolean, onDelete: any, selected: RequestProduct[], onSelectionChange: any, saveWaitlist: (waitlist: RequestProduct) => Promise<void> }
) {
    const [editing, setEditing] = useState<number | null>(null)

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
                <WaitListItem
                    key={item.id}
                    isEdit={editing === item.id}
                    item={item}
                    isSelected={isSelected(item)}
                    onSelectionChange={onSelectionChange}
                    onDelete={onDelete}
                    onEdit={(id) => setEditing(id)}
                    onSave={saveWaitlist}
                />
            )}
        </ul>
    )
}

function WaitListItem({
    item,
    isEdit = false,
    isSelected = false,
    onSelectionChange,
    onDelete,
    onEdit,
    onSave
}: {
    item: RequestProduct,
    isEdit: boolean,
    isSelected: boolean,
    onSelectionChange: (item: RequestProduct) => void,
    onDelete: (id: number) => void,
    onEdit: (id: number | null) => void,
    onSave: (item: RequestProduct) => Promise<void>
}) {
    const [editing, setEditing] = useState<RequestProduct | null>(null)

    const handlers = {
        async editWaitlist() {
            setEditing({...item})
            onEdit(item.id)
        },
        editDescriptionChange(e: any) {
            const { value } = e.target

            if (editing) setEditing({
                ...editing,
                description: value
            })
        },
        editQuantityChange(e: any) {
            const { value } = e.target

            if (editing) setEditing({
                ...editing,
                quantity: value
            })
        },
        editUnitChange(e: any) {
            const { value } = e.target

            if (editing) setEditing({
                ...editing,
                unit: value
            })
        },
        editNoteChange(e: any) {
            const { value } = e.target

            if (editing) setEditing({
                ...editing,
                note: value
            })
        },
        async editKeyDown(e: any) {
            if (e.key === 'Enter') {
                if (editing) await onSave({...editing})

                clearEditing()
            }
            if (e.key === 'Escape') clearEditing()
        },
        editProductSelect(product: Product | null) {
            if (!editing) return

            if (!product) setEditing({
                ...editing,
                product_id: null
            })

            if (product) setEditing({
                ...editing,
                product_id: product.id,
                description: product.name
            })
        }
    }

    function clearEditing() {
        setEditing(null)
        onEdit(null)
    }

    if (isEdit && editing) return <li key={item.id} className="list-group-item">
        <div className="row g-2 align-items-center">
            <div className="col">
                <ProductSelectionInput
                    productId={editing.product_id}
                    onSelect={handlers.editProductSelect}
                />
            </div>
            <div className="col">
                <input
                    value={editing.description}
                    onChange={handlers.editDescriptionChange}
                    onKeyDown={handlers.editKeyDown}
                    placeholder='Description' type="text" className="form-control" />
            </div>
            <div className="col-1">
                <input
                    value={editing.quantity}
                    onChange={handlers.editQuantityChange}
                    onKeyDown={handlers.editKeyDown}
                    placeholder='Quantity' type="number" className="form-control" />
            </div>
            <div className="col-2">
                <input
                    value={editing.unit || ''}
                    onChange={handlers.editUnitChange}
                    onKeyDown={handlers.editKeyDown}
                    placeholder='Unit' type="text" className="form-control" />
            </div>
            <div className="col-3">
                <input
                    value={editing.note || ''}
                    onChange={handlers.editNoteChange}
                    onKeyDown={handlers.editKeyDown}
                    placeholder='Note' type="text" className="form-control" />
            </div>
        </div>
    </li>

    return <li className="list-group-item list-group-item-action">
        <div className="row">
            <div className="col-auto">
                <input
                    checked={isSelected}
                    onChange={() => onSelectionChange(item)}
                    type="checkbox" id={`itemCheckbox-${item.id}`} className="form-check-input" />
            </div>
            <div onClick={handlers.editWaitlist} className="col">{item.description}</div>
            <div onClick={handlers.editWaitlist} className="col-2">
                <strong>{item.quantity}</strong>
                {item.unit ? ` ${item.unit}` : ''}
            </div>
            <div onClick={handlers.editWaitlist} className="col-3">{item.note}</div>
            <div className="col-auto">
                <a onClick={() => onDelete(item.id)} role="button" className="bi bi-trash text-danger"></a>
            </div>
        </div>
    </li>
}