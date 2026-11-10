import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/public/Breadcrumb'
import { PageShell } from '@/components/public/PageShell'
import { SkillResults } from '@/components/public/SkillResults'
import { getMetadata } from '@/modules/public/metadata'
import { parsePublicQuery, type SearchParams } from '@/modules/public/searchParams'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
    const params = await searchParams
    return getMetadata('Skills - CrossBorder Skills Hub', '搜索、筛选和浏览公开 Skill 资源。', '/skills', Object.keys(params).length > 0)
}

export default async function SkillsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const query = parsePublicQuery(await searchParams)
    return <PageShell><Breadcrumb items={[{ label: 'Skills' }]} /><h1>Skill 资源</h1><p>按业务分类、平台、工具和标签查找公开资源。</p><SkillResults query={query} /></PageShell>
}
