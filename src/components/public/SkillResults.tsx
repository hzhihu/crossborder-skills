import Link from 'next/link'

import { FilterPanel } from './FilterPanel'
import { Pagination } from './Pagination'
import { SearchBox } from './SearchBox'
import { SkillGrid } from './SkillCard'
import { querySkills } from '@/modules/public/queries'
import { buildQueryString, type PublicQuery } from '@/modules/public/searchParams'

export async function SkillResults({ query, categorySlug = '', basePath = '/skills' }: { query: PublicQuery, categorySlug?: string, basePath?: string }) {
    const result = await querySkills(query, categorySlug)
    const hasFilters = Boolean(query.q || (!categorySlug && query.category) || query.platforms.length || query.tools.length || query.tags.length)
    const clearHref = categorySlug ? `/categories/${categorySlug}` : basePath

    return <>
        <SearchBox key={`search-${buildQueryString(query, 1)}`} initialQuery={query.q} action={clearHref} query={query} />
        <FilterPanel key={`filters-${buildQueryString(query, 1)}`} query={query} filters={result.filters} invalid={result.invalid} lockCategory={Boolean(categorySlug)} showSort={!categorySlug} />
        <p>共 {result.totalDocs} 个公开 Skill</p>
        {result.totalDocs > 0 && result.docs.length === 0
            ? <div className="empty"><p>当前页没有结果。</p><Link href={buildQueryString(query, 1) || clearHref}>返回第 1 页</Link></div>
            : <SkillGrid skills={result.docs} empty={hasFilters ? '没有找到符合当前条件的 Skill。' : '暂无公开 Skill。'} />}
        {result.docs.length > 0 && <Pagination query={query} totalPages={result.totalPages} basePath={clearHref} />}
        {hasFilters && result.totalDocs === 0 && <Link href={clearHref}>清除筛选</Link>}
    </>
}
