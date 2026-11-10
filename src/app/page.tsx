import Link from 'next/link'
import { connection } from 'next/server'

import { PageShell } from '@/components/public/PageShell'
import { SearchBox } from '@/components/public/SearchBox'
import { SkillGrid } from '@/components/public/SkillCard'
import { getHomeRecentCutoff, siteConfig } from '@/config/site'
import { getCategoryCounts, getFilterData, getPublicCollections, querySkills } from '@/modules/public/queries'
import { parsePublicQuery } from '@/modules/public/searchParams'
import { getPublicPayload } from '@/modules/public/payload'
import { getMetadata, JsonLd, siteUrl } from '@/modules/public/metadata'

export const dynamic = 'force-dynamic'
export function generateMetadata() {
    return getMetadata('CrossBorder Skills Hub', '面向跨境电商业务场景的 AI Skills 资源发现、整理和推荐平台。', '/')
}

export default async function HomePage() {
    await connection()
    const payload = await getPublicPayload()
    const since = getHomeRecentCutoff(siteConfig.homeRecentDays)
    const [recent, categoriesData, collections, recentCount] = await Promise.all([
        querySkills(parsePublicQuery({})),
        getFilterData(),
        getPublicCollections(),
        payload.count({ collection: 'skills', where: { published_at: { greater_than_equal: since } }, overrideAccess: false }),
    ])
    const topCategories = categoriesData.categories.filter((item) => !item.parent).slice(0, 6)
    const categoryCounts = await getCategoryCounts(categoriesData.categories)

    return <PageShell>
        <section className="hero">
            <div><h1>跨境电商 AI Skills 资源目录</h1><p>发现经人工整理与审核的 Skill 资源，按业务场景、平台、工具和专题查找，并查看使用说明与 GitHub 原始来源。</p></div>
            <SearchBox large />
        </section>
        <section aria-labelledby="stats-title"><div><h2 id="stats-title">资源概况</h2><p>以下数据仅统计当前公开可见内容。</p></div><div className="stats" aria-label="资源统计">
            <div><strong>{recent.totalDocs}</strong><span>公开 Skill</span></div>
            <div><strong>{categoriesData.categories.length}</strong><span>业务分类</span></div>
            <div><strong>{collections.totalDocs}</strong><span>精选专题</span></div>
            <div><strong>{recentCount.totalDocs}</strong><span>最近 {siteConfig.homeRecentDays} 天新增</span></div>
        </div></section>
        <section><div className="section-heading"><div><h2>热门分类</h2><p>按后台分类顺序展示，数量仅统计已发布 Skill。</p></div><Link href="/categories">查看全部分类</Link></div><div className="category-grid">{topCategories.map((category) => <Link className="card" key={category.id} href={`/categories/${category.slug}`}><h3>{category.name}</h3>{category.description && <p>{category.description}</p>}<p>{categoryCounts.get(category.id) || 0} 个公开 Skill</p></Link>)}</div></section>
        <section><div className="section-heading"><div><h2>最近新增</h2><p>按发布时间展示最新公开的 Skill。</p></div><Link href="/skills">查看全部 Skill</Link></div><SkillGrid skills={recent.docs.slice(0, 6)} empty="暂无已发布 Skill 资源。" /></section>
        <section><div className="section-heading"><div><h2>精选专题</h2><p>按业务任务浏览管理员整理的已发布专题。</p></div><Link href="/collections">查看全部专题</Link></div>{collections.docs.length ? <div className="skill-grid">{collections.docs.slice(0, 3).map((collection) => <Link className="card" key={collection.id} href={`/collections/${collection.slug}`}><h3>{collection.name}</h3>{collection.description && <p>{collection.description}</p>}</Link>)}</div> : <p className="empty">暂无已发布专题。</p>}</section>
        <JsonLd value={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'CrossBorder Skills Hub', url: siteUrl, potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }} />
    </PageShell>
}
