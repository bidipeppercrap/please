import Link from "next/link";

export default function VendorPage() {
    return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="list-view">
                    <h1 className="mb-3 text-center">Vendors</h1>
                    <Link href='/vendors/create' className="btn btn-primary"><i className="bi bi-plus"></i></Link>
                </div>
            </div>
        </main>
    )
}