'use client'

import { useRouter } from 'next/navigation'

export default function CategoryPage() {
    const router = useRouter()

    return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <h1 className="text-center mb-3">Categories</h1>
                </div>
            </div>
            <button onClick={() => router.push('/categories/create')} className="btn btn-outline-primary">
                <i className="bi bi-plus-lg"></i>
            </button>
        </main>
    )
}