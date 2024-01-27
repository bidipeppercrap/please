export default function CategoryForm({ handleNameChange }: { handleNameChange: any }) {
    return (
        <div className="row">
            <div className="col mb-3">
                <label htmlFor="nameInput" className="form-label">Name</label>
                <input
                    onChange={handleNameChange}
                    className="form-control"
                    type="text"
                    id="nameInput"
                />
            </div>
        </div>
    )
}