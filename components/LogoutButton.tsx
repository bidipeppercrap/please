'use client'

import { logout } from "@/repositories/auth"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
    const router = useRouter()

    async function logOut() {
        await logout()
        router.push('/login')
    }

    return <a onClick={logOut} role='button' className="list-group-item list-group-item-danger list-group-item-action">Log out</a>
}