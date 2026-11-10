import Link from 'next/link'

import { Breadcrumb } from '@/components/public/Breadcrumb'
import { PageShell } from '@/components/public/PageShell'
import { getCategoryCounts, getFilterData } from '@/modules/public/queries'
import { getMetadata } from '@/modules/public/metadata'

export const dynamic = 'force-dynamic'
export function generateMetadata() {
    return getMetadata('业务分类 - CrossBorder Skills Hub', '按跨境电商业务分类发现公开 Skill。', '/categories')
}

export default async function CategoriesPage() {
    const { categories } = await getFilterData()
    const counts = await getCategoryCounts(categories)
    return <PageShell><Breadcrumb items={[{ label: '分类' }]} /><h1>业务分类</h1><div className="category-grid">{categories.map((category) => <Link className="card" key={category.id} href={`/categories/${category.slug}`}><h2>{category.name}</h2><p>{category.description || '暂无分类说明。'}</p><p>{counts.get(category.id) || 0} 个公开 Skill</p></Link>)}</div></PageShell>
}
