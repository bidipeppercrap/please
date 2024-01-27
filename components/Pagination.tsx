export default function Pagination(
    { pageCount, pageNumber, onPrev, onNext }:
    { pageCount: number, pageNumber: number, onPrev: any, onNext: any }
) {
    return (
        <div className="btn-group">
            <button onClick={onPrev} disabled={pageNumber <= 1} type="button" className="btn btn-outline-primary">
                <i className="bi bi-arrow-left"></i>
            </button>
            <button onClick={onNext} disabled={pageNumber >= pageCount} type="button" className="btn btn-outline-primary">
                <i className="bi bi-arrow-right"></i>
            </button>
        </div>
    )
}