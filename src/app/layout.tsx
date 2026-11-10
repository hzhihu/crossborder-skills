import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
    title: 'CrossBorder Skills Hub',
    description: '跨境电商 AI Skills 资源发现与运营平台',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="zh-CN">
            <body>{children}</body>
        </html>
    )
}
