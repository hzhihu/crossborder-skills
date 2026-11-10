'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MobileMenu } from './MobileMenu'

export function Header() {
    const pathname = usePathname()
    return (
        <header className="site-header">
            <div className="container header-inner">
                <Link className="brand" href="/" aria-current={pathname === '/' ? 'page' : undefined}>CrossBorder Skills Hub</Link>
                <nav className="desktop-nav" aria-label="主导航">
                    <Link href="/skills" aria-current={pathname.startsWith('/skills') ? 'page' : undefined}>Skills</Link>
                    <Link href="/categories" aria-current={pathname.startsWith('/categories') ? 'page' : undefined}>分类</Link>
                    <Link href="/collections" aria-current={pathname.startsWith('/collections') ? 'page' : undefined}>专题</Link>
                </nav>
                <MobileMenu />
            </div>
        </header>
    )
}
