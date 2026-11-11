import { DefaultTemplate } from '@payloadcms/next/templates'
import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { CrawlImportForm } from './CrawlImportForm.tsx'

export default async function CrawlImportView(props: AdminViewServerProps) {
    const { initPageResult: { req, visibleEntities } } = props
    if (!req.user) return <main style={{ padding: '2rem' }}><h1>资源导入</h1><p>需要管理员登录。</p></main>

    const categories = await req.payload.find({
        collection: 'categories', overrideAccess: false, pagination: false, req, sort: 'sort_order',
        where: { is_active: { equals: true } },
    })

    return <DefaultTemplate {...props} visibleEntities={visibleEntities} viewType="import">
        <main style={{ margin: '0 auto', maxWidth: '800px', padding: '2rem' }}>
            <h1>资源导入</h1>
            <CrawlImportForm categories={categories.docs.map((category) => ({ id: category.id, name: category.name }))} />
            <p style={{ marginTop: '2rem' }}><Link href="/admin/collections/crawlTasks">查看全部采集任务</Link></p>
        </main>
    </DefaultTemplate>
}
