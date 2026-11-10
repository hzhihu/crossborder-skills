import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/public/Breadcrumb'
import { MarkdownRenderer } from '@/components/public/MarkdownRenderer'
import { PageShell } from '@/components/public/PageShell'
import { SkillGrid } from '@/components/public/SkillCard'
import type { Skill } from '@/payload-types'
import { getPublicCollection } from '@/modules/public/queries'
import { getMetadata, JsonLd, siteUrl } from '@/modules/public/metadata'
import { pageSize } from '@/modules/public/searchParams'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const [{ slug }, query] = await Promise.all([params, searchParams])
    const collection = await getPublicCollection(slug)
    if (!collection) notFound()
    return getMetadata(collection.seo_title?.trim() || `${collection.name} - CrossBorder Skills Hub`, collection.seo_description?.trim() || collection.description?.trim() || '专题详情', `/collections/${slug}`, Object.keys(query).length > 0)
}

export default async function CollectionPage({ params, searchParams }: Props) {
    const [{ slug }, query] = await Promise.all([params, searchParams])
    const collection = await getPublicCollection(slug)
    if (!collection) notFound()
    const skills = [...(collection.skills || [])].sort((a, b) => a.sort_order - b.sort_order || (a.id || '').localeCompare(b.id || ''))
        .map((item) => item.skill).filter((skill): skill is Skill => typeof skill === 'object' && skill.status === 'published' && skill.resource_type === 'Skill')
    const parsedPage = Number(query.page || '1')
    const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
    const totalPages = Math.max(1, Math.ceil(skills.length / pageSize))
    const pageSkills = skills.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    return <PageShell>
        <Breadcrumb items={[{ href: '/collections', label: '专题' }, { label: collection.name }]} />
        <h1>{collection.name}</h1><p>{collection.description}</p>
        {collection.published_at && <time>发布时间：{new Date(collection.published_at).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}</time>}
        {collection.detailed_content && <MarkdownRenderer content={collection.detailed_content} />}
        <p>共 {skills.length} 个公开 Skill</p>
        {skills.length === 0
            ? <p className="empty">暂无公开 Skill。</p>
            : pageSkills.length ? <SkillGrid skills={pageSkills} /> : <div className="empty"><p>当前页没有结果。</p><Link href={`/collections/${slug}`}>返回第 1 页</Link></div>}
        {pageSkills.length > 0 && totalPages > 1 && <nav className="pagination" aria-label="分页">{currentPage > 1 && <Link href={`/collections/${slug}?page=${currentPage - 1}`}>上一页</Link>}<span>第 {currentPage} / {totalPages} 页</span>{currentPage < totalPages && <Link href={`/collections/${slug}?page=${currentPage + 1}`}>下一页</Link>}</nav>}
        <JsonLd value={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: collection.name, description: collection.description || undefined, datePublished: collection.published_at || undefined, url: `${siteUrl}/collections/${slug}` }} />
    </PageShell>
}
