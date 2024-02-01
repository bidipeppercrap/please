'use client'

import { isRootExists, login } from "@/repositories/auth"
import { cookies } from "next/headers"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginPage() {
    const router = useRouter()

    const [alert, setAlert] = useState({
        type: '',
        message: ''
    })
    const [ready, setReady] = useState(false)
    const [credential, setCredential] = useState({
        username: '',
        password: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            const exist = await isRootExists()

            if (exist) return setReady(true)
            if (!exist) return router.push('/noroot')
        }

        fetchData()
    }, [router])

    async function signIn() {
        try {
            await login(credential)

            router.push('/')
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Error, please see console log for detailed information'
            })
        }
    }

    if (ready) return (
        <main className="container-fluid mt-5 mb-5">
            <div className="d-grid justify-content-center">
                <div className="listview">
                    <div className="card mt-5">
                        <h5 className="card-header">Login</h5>
                        <div className="card-body">
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Username</label>
                                <input
                                    autoComplete="off"
                                    value={credential.username}
                                    onChange={e => setCredential({...credential, username: e.target.value})}
                                    id="username" type="text" className="form-control" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    autoComplete="off"
                                    value={credential.password}
                                    onChange={e => setCredential({...credential, password: e.target.value})}
                                    type="password" name="" id="password" className="form-control" />
                            </div>
                            <button onClick={signIn} type="button" className="btn btn-primary">Login</button>
                            {
                                alert.type === 'error'
                                ? (
                                    <div className="alert alert-danger mt-3">{alert.message}</div>
                                )
                                : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )

    return <main className="container-fluid mt-5 mb-5">
        <div className="d-grid justify-content-center">
            <div className="listview">
                <h1 className="text-center text-secondary mt-5 mb-5">Loading...</h1>
            </div>
        </div>
    </main>
}