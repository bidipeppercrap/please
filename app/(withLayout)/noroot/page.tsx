import RootForm from "@/components/RootForm"
import { isRootExists, saveRoot } from "@/repositories/auth"
import Link from "next/link"

export default async function NoRootPage() {
    const exist = await isRootExists()

    if (exist) return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Root already exist</h5>
                            <Link href={'/login'} className="btn btn-primary">Login screen</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )

    return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <RootForm onSave={saveRoot} />
                </div>
            </div>
        </main>
    )
}