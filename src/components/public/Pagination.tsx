import Link from 'next/link'

import { buildQueryString, type PublicQuery } from '@/modules/public/searchParams'

export function Pagination({ query, totalPages, basePath }: { query: PublicQuery, totalPages: number, basePath: string }) {
    if (totalPages <= 1) return null
    return (
        <nav className="pagination" aria-label="分页">
            {query.page > 1 && <Link href={buildQueryString(query, query.page - 1) || basePath}>上一页</Link>}
            <span>第 {query.page} / {totalPages} 页</span>
            {query.page < totalPages && <Link href={buildQueryString(query, query.page + 1)}>下一页</Link>}
        </nav>
    )
}
