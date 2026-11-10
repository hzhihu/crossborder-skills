import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/public/Breadcrumb'
import { PageShell } from '@/components/public/PageShell'
import { SearchBox } from '@/components/public/SearchBox'
import { SkillResults } from '@/components/public/SkillResults'
import { getMetadata } from '@/modules/public/metadata'
import { parsePublicQuery, type SearchParams } from '@/modules/public/searchParams'

export const dynamic = 'force-dynamic'
export function generateMetadata(): Metadata {
    return getMetadata('搜索 - CrossBorder Skills Hub', '搜索公开 Skill 资源。', '/search', true)
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const query = parsePublicQuery(await searchParams)
    return <PageShell><Breadcrumb items={[{ label: '搜索' }]} /><h1>搜索结果</h1>{query.q ? <SkillResults query={query} basePath="/search" /> : <><SearchBox /><p className="empty">请输入关键词后搜索，不展示默认结果。</p></>}</PageShell>
}
