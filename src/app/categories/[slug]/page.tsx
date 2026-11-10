import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/public/Breadcrumb'
import { PageShell } from '@/components/public/PageShell'
import { SkillResults } from '@/components/public/SkillResults'
import { getFilterData } from '@/modules/public/queries'
import { getMetadata, JsonLd, siteUrl } from '@/modules/public/metadata'
import { parsePublicQuery, type SearchParams } from '@/modules/public/searchParams'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }>, searchParams: Promise<SearchParams> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const [{ slug }, queryParams, { categories }] = await Promise.all([params, searchParams, getFilterData()])
    const category = categories.find((item) => item.slug === slug)
    if (!category) notFound()
    return getMetadata(category.seo_title?.trim() || `${category.name} - CrossBorder Skills Hub`, category.seo_description?.trim() || category.description?.trim() || `浏览${category.name}分类的公开 Skill。`, `/categories/${slug}`, Object.keys(queryParams).length > 0)
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const [{ slug }, queryParams, { categories }] = await Promise.all([params, searchParams, getFilterData()])
    const category = categories.find((item) => item.slug === slug)
    if (!category) notFound()
    const query = { ...parsePublicQuery(queryParams), sort: 'latest' as const }
    const children = categories.filter((item) => {
        const parentID = item.parent && typeof item.parent === 'object' ? item.parent.id : item.parent
        return parentID === category.id
    })

    return <PageShell>
        <Breadcrumb items={[{ href: '/categories', label: '分类' }, { label: category.name }]} />
        <h1>{category.name}</h1><p>{category.description}</p>
        {children.length > 0 && <nav className="inline-links" aria-label="子分类">{children.map((item) => <a key={item.id} href={`/categories/${item.slug}`}>{item.name}</a>)}</nav>}
        <SkillResults query={{ ...query, category: slug }} categorySlug={slug} />
        <JsonLd value={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: category.name, description: category.description || undefined, url: `${siteUrl}/categories/${slug}` }} />
    </PageShell>
}
