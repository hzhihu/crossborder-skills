import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { getDashboardRecentStart } from '../../modules/skills/dashboard.ts'

const cardStyle = {
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    padding: '1.25rem',
} as const

function formatDate(value: null | string | undefined) {
    if (!value) return '暂无时间'
    return new Intl.DateTimeFormat('zh-CN', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Shanghai',
    }).format(new Date(value))
}

export default async function DashboardView({ initPageResult: { req } }: AdminViewServerProps) {
    if (!req.user) return <main style={{ padding: '2rem' }}><h1>运营概况</h1><p>需要管理员登录。</p></main>

    const findSkills = (status?: string, createdAfter?: string) => req.payload.find({
        collection: 'skills', limit: 0, overrideAccess: false, req,
        where: { and: [
            { resource_type: { equals: 'Skill' } },
            ...(status ? [{ status: { equals: status } }] : []),
            ...(createdAfter ? [{ createdAt: { greater_than_equal: createdAfter } }] : []),
        ] },
    })
    const [total, published, pending, failed, recent, recentTasks, recentPublished] = await Promise.all([
        findSkills(),
        findSkills('published'),
        findSkills('pending'),
        req.payload.find({ collection: 'crawlTasks', limit: 0, overrideAccess: false, req, where: { status: { equals: 'failed' } } }),
        findSkills(undefined, getDashboardRecentStart()),
        req.payload.find({ collection: 'crawlTasks', limit: 5, overrideAccess: false, req, sort: '-createdAt' }),
        req.payload.find({
            collection: 'skills', limit: 5, overrideAccess: false, req, sort: '-published_at',
            where: { and: [{ resource_type: { equals: 'Skill' } }, { status: { equals: 'published' } }] },
        }),
    ])
    const stats = [
        { href: '/admin/collections/skills', label: 'Skill 总数', value: total.totalDocs },
        { href: '/admin/collections/skills?where[status][equals]=published', label: '已发布数', value: published.totalDocs },
        { href: '/admin/collections/skills?where[status][equals]=pending', label: '待审核数', value: pending.totalDocs },
        { href: '/admin/collections/crawlTasks?where[status][equals]=failed', label: '采集失败数', value: failed.totalDocs },
        { href: '/admin/collections/skills', label: '最近 7 天新增', value: recent.totalDocs },
    ]

    return <main style={{ margin: '0 auto', maxWidth: '1100px', padding: '2rem' }}>
        <h1>运营概况</h1>
        <p>真实资源与采集任务概况。最近 7 天新增按创建时间和 Asia/Shanghai 自然日统计。</p>
        <section aria-label="运营统计" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBlock: '1.5rem' }}>
            {stats.map((stat) => <Link href={stat.href} key={stat.label} aria-label={stat.label} style={{ ...cardStyle, display: 'block', textDecoration: 'none' }}>
                <span style={{ display: 'block' }}>{stat.label}</span>
                <strong style={{ display: 'block', fontSize: '2rem', marginTop: '0.5rem' }}>{stat.value}</strong>
            </Link>)}
        </section>
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <section aria-labelledby="recent-tasks" style={cardStyle}>
                <h2 id="recent-tasks">最近采集任务</h2>
                {!recentTasks.docs.length && <p>暂无采集任务。</p>}
                {recentTasks.docs.map((task) => <article key={task.id} style={{ borderTop: '1px solid var(--theme-elevation-150)', paddingBlock: '0.75rem' }}>
                    <Link href={`/admin/collections/crawlTasks/${task.id}`}>任务 {task.id}</Link>
                    <p><strong>状态：</strong>{task.status}</p>
                    <p>{task.source_url}</p>
                    <p>{formatDate(task.createdAt)}</p>
                </article>)}
            </section>
            <section aria-labelledby="recent-published" style={cardStyle}>
                <h2 id="recent-published">最近发布资源</h2>
                {!recentPublished.docs.length && <p>暂无已发布 Skill。</p>}
                {recentPublished.docs.map((skill) => <article key={skill.id} style={{ borderTop: '1px solid var(--theme-elevation-150)', paddingBlock: '0.75rem' }}>
                    <Link href={`/admin/collections/skills/${skill.id}`}>{skill.name_zh || skill.name}</Link>
                    <p>{formatDate(skill.published_at)}</p>
                </article>)}
            </section>
        </div>
    </main>
}
