'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

interface navItem {
    title: string;
    url: string;
}

const navList: navItem[] = [
    {
        title: 'categories',
        url: '/categories'
    },
    {
        title: 'products',
        url: '/products'
    },
    {
        title: 'vendors',
        url: '/vendors'
    },
    {
        title: 'requests',
        url: '/requests'
    },
    {
        title: 'waitlist',
        url: '/waitlist'
    },
    {
        title: '⚙️',
        url: '/config'
    }
]

export default function Navbar() {
    const pathname = usePathname()

    const listView = navList.map((item, index) =>
        <li key={index} className="nav-item">
            <Link className={`nav-link text-secondary ${pathname.startsWith(item.url) ? 'active' : ''}`} href={item.url}>{item.title}</Link>
        </li>
    )

    return (
        <nav className="navbar sticky-top bg-body-tertiary border-bottom">
            <div className="container-fluid">
                <div className="navbar-brand">
                    Please
                </div>
                <ul className="nav nav-underline">
                    {listView}
                </ul>
            </div>
        </nav>
    )
}