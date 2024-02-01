import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

interface ConfigLink {
    title: string
    url: string
}

export default function ConfigPage() {
    const configLinks: ConfigLink[] = [
        {
            title: 'Header',
            url: '/config/header'
        }
    ]

    return (
        <main className="container-fluid mt-5">
            <div className="d-grid justify-content-center">
                <div className="listview" style={{width: '18rem'}}>
                    <h1 className="text-center mb-3">Config</h1>
                    <div className="list-group">
                        {configLinks.map((c, index) =>
                            <Link key={index} href={c.url} className="list-group-item list-group-item-action">
                                <div className="row">
                                    <div className="col">{c.title}</div>
                                    <div className="col-auto text-secondary"><i className="bi bi-chevron-right"></i></div>
                                </div>
                            </Link>
                        )}
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </main>
    )
}