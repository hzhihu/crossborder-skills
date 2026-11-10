import Link from 'next/link'

import { Breadcrumb } from '@/components/public/Breadcrumb'
import { PageShell } from '@/components/public/PageShell'
import { getPublicCollections } from '@/modules/public/queries'
import { getMetadata } from '@/modules/public/metadata'

export const dynamic = 'force-dynamic'
export function generateMetadata() {
    return getMetadata('专题 - CrossBorder Skills Hub', '按连续业务任务浏览人工整理的 Skill 专题。', '/collections')
}

export default async function CollectionsPage() {
    const collections = await getPublicCollections()
    return <PageShell><Breadcrumb items={[{ label: '专题' }]} /><h1>精选专题</h1>{collections.docs.length ? <div className="skill-grid">{collections.docs.map((collection) => <article className="card" key={collection.id}><h2><Link href={`/collections/${collection.slug}`}>{collection.name}</Link></h2><p>{collection.description || '暂无专题简介。'}</p></article>)}</div> : <p className="empty">暂无已发布专题。</p>}</PageShell>
}
