'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function MobileMenu() {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [open, setOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        const close = () => {
            dialog.close()
            buttonRef.current?.focus()
        }
        dialog.addEventListener('close', close)
        return () => dialog.removeEventListener('close', close)
    }, [])

    return (
        <>
            <button ref={buttonRef} className="button secondary mobile-only" onClick={() => { dialogRef.current?.showModal(); setOpen(true) }} aria-label="打开导航菜单" aria-expanded={open} aria-controls="mobile-navigation">菜单</button>
            <dialog ref={dialogRef} id="mobile-navigation" className="mobile-dialog" aria-label="网站导航" onClose={() => setOpen(false)}>
                <button className="button secondary" onClick={() => dialogRef.current?.close()}>关闭</button>
                <nav className="mobile-nav" aria-label="移动导航">
                    <Link href="/">首页</Link>
                    <Link href="/skills">Skills</Link>
                    <Link href="/categories">分类</Link>
                    <Link href="/collections">专题</Link>
                </nav>
            </dialog>
        </>
    )
}
