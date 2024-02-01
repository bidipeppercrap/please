'use client'

import { User } from "@/repositories/auth"
import { useState } from "react"

export default function RootForm({
    onSave
}: {
    onSave: (root: User) => Promise<void>
}) {
    const [root, setRoot] = useState<User>({
        username: '',
        password: ''
    })

    return (
        <div className="card mt-5">
            <h5 className="card-header">Create Root</h5>
            <div className="card-body">
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input value={root.username} onChange={e => setRoot({...root, username: e.target.value})} id="username" type="text" className="form-control" />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input value={root.password} onChange={e => setRoot({...root, password: e.target.value})} type="password" name="" id="password" className="form-control" />
                </div>
                <button onClick={() => onSave(root)} type="button" className="btn btn-primary">Save</button>
            </div>
        </div>
    )
}