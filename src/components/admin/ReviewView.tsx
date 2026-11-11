import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { getContentHash, parseSkillMarkdown } from '../../modules/crawler/parser.ts'
import { getPendingUpdatePage } from '../../modules/skills/reviewQueue.ts'
import { ReviewActions } from './ReviewActions.tsx'

const pageSize = 20
const sectionStyle = {
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    padding: '1.5rem',
} as const

function getPage(value: string | string[] | undefined) {
    const page = Number(Array.isArray(value) ? value[0] : value)
    return Number.isInteger(page) && page > 0 ? page : 1
}

function getVersionSkillID(value: unknown) {
    return typeof value === 'object' && value !== null && 'id' in value ? Number(value.id) : Number(value)
}

function ReviewPagination({ label, otherPage, otherParam, page, param, totalPages }: {
    label: string
    otherPage: number
    otherParam: string
    page: number
    param: string
    totalPages: number
}) {
    if (totalPages <= 1) return null
    const getHref = (target: number) => `/admin/review?${param}=${target}&${otherParam}=${otherPage}`
    return <nav aria-label={label} style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
        {page > 1 ? <Link href={getHref(page - 1)}>上一页</Link> : <span>上一页</span>}
        <span>第 {page} / {totalPages} 页</span>
        {page < totalPages ? <Link href={getHref(page + 1)}>下一页</Link> : <span>下一页</span>}
    </nav>
}

export default async function ReviewView({ initPageResult: { req }, searchParams }: AdminViewServerProps) {
    if (!req.user) return <main style={{ padding: '2rem' }}><h1>待审核工作台</h1><p>需要管理员登录。</p></main>

    const pendingPage = getPage(searchParams?.pendingPage)
    const requestedUpdatePage = getPage(searchParams?.updatePage)
    const findPending = (page: number) => req.payload.find({
        collection: 'skills', limit: pageSize, overrideAccess: false, page, req, sort: '-updatedAt',
        where: { and: [{ resource_type: { equals: 'Skill' } }, { status: { equals: 'pending' } }] },
    })
    const [pendingResult, publishedIndex] = await Promise.all([
        findPending(pendingPage),
        req.payload.find({
            collection: 'skills', overrideAccess: false, pagination: false, req, select: { raw_content: true, updatedAt: true }, sort: '-updatedAt',
            where: { and: [{ resource_type: { equals: 'Skill' } }, { status: { equals: 'published' } }] },
        }),
    ])
    const pending = !pendingResult.docs.length && pendingPage > 1 ? await findPending(1) : pendingResult
    const publishedIDs = publishedIndex.docs.map((skill) => skill.id)
    const versionIndex = publishedIDs.length ? await req.payload.find({
        collection: 'skillVersions', overrideAccess: false, pagination: false, req,
        select: { content_hash: true, skill_id: true, version: true }, sort: '-version', where: { skill_id: { in: publishedIDs } },
    }) : { docs: [] }
    const latestHashes = new Map<number, string>()
    for (const version of versionIndex.docs) {
        const skillID = getVersionSkillID(version.skill_id)
        if (version.content_hash && !latestHashes.has(skillID)) latestHashes.set(skillID, version.content_hash)
    }
    const updateResult = getPendingUpdatePage(publishedIndex.docs, latestHashes, requestedUpdatePage, pageSize)
    const { ids: updateIDs, page: updatePage, pageIDs, totalPages: updateTotalPages } = updateResult
    const published = pageIDs.length ? await req.payload.find({
        collection: 'skills', overrideAccess: false, pagination: false, req, sort: '-updatedAt', where: { id: { in: pageIDs } },
    }) : { docs: [] }

    const getLatestVersion = (skillID: number) => req.payload.find({
        collection: 'skillVersions', limit: 1, overrideAccess: false, req, sort: '-version', where: { skill_id: { equals: skillID } },
    }).then((result) => result.docs[0])
    const [pendingEntries, publishedEntries] = await Promise.all([
        Promise.all(pending.docs.map(async (skill) => ({ hasUpdate: false, latest: await getLatestVersion(skill.id), skill }))),
        Promise.all(published.docs.map(async (skill) => ({ hasUpdate: true, latest: await getLatestVersion(skill.id), skill }))),
    ])
    const queue = [...pendingEntries, ...publishedEntries]

    return <main style={{ margin: '0 auto', maxWidth: '1100px', padding: '2rem' }}>
        <h1>待审核工作台</h1>
        <p>核对原始内容、来源和人工编辑内容后再发布。AI 建议尚未交付，不影响人工审核。</p>
        {!queue.length && <section style={sectionStyle}><p>当前页没有待审核 Skill 或待发布更新。</p></section>}
        {queue.map(({ hasUpdate, latest, skill }) => {
            const previewContent = hasUpdate ? latest?.raw_content : skill.raw_content
            const parsed = previewContent ? parseSkillMarkdown(previewContent, skill.repository_path || '') : null
            const expectedHash = hasUpdate ? latest?.content_hash : getContentHash(skill.raw_content || '')
            const publishDisabledReason = !previewContent
                ? '缺少可审核的原始内容，请重新采集或补充后再审核。'
                : parsed?.errors.length ? '原始内容 Frontmatter 存在异常，请重新采集或处理异常后再审核。' : undefined
            return <section key={skill.id} style={sectionStyle} aria-labelledby={`review-${skill.id}`}>
                <h2 id={`review-${skill.id}`}>{skill.name_zh || parsed?.name || skill.name}</h2>
                <p><strong>状态：</strong>{hasUpdate ? '已发布，存在待审核更新' : '待审核'}</p>
                {hasUpdate && <p>公开页面仍显示旧内容，只有审核发布更新后才会替换。</p>}
                {parsed && <p><strong>待审核解析名称：</strong>{parsed.name}</p>}
                <p><strong>解析简介：</strong>{parsed?.description || skill.description || '暂无解析简介，请在编辑页补充。'}</p>
                {parsed?.errors.map((error) => <p key={error} role="alert"><strong>解析异常：</strong>{error}</p>)}
                {publishDisabledReason && <p role="alert">{publishDisabledReason}</p>}
                <p><strong>人工中文简介：</strong>{skill.description_zh || '尚未填写'}</p>
                <p><strong>来源：</strong>{skill.repository_url}/{skill.repository_path}</p>
                <p><strong>AI 建议：</strong>尚未交付，可继续人工处理。</p>
                {latest && <p><strong>最新版本：</strong>v{latest.version}，Hash {latest.content_hash.slice(0, 12)}…{latest.changelog ? `，${latest.changelog}` : ''}</p>}
                <details style={{ marginBottom: '1rem' }}>
                    <summary>{hasUpdate ? '查看待审核原始内容' : '查看原始内容'}</summary>
                    <pre style={{ maxHeight: '360px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{previewContent || '没有可显示的原始内容。'}</pre>
                </details>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <Link href={`/admin/collections/skills/${skill.id}`}>编辑中文内容、分类和标签</Link>
                    <a href={skill.source_url || skill.repository_url || undefined} rel="noreferrer" target="_blank">查看原始来源</a>
                </div>
                {expectedHash && <ReviewActions expectedHash={expectedHash} hasUpdate={hasUpdate} id={skill.id} publishDisabledReason={publishDisabledReason} />}
            </section>
        })}
        <h2>待审核 Skill（{pending.totalDocs}）</h2>
        <ReviewPagination label="待审核 Skill 分页" otherPage={updatePage} otherParam="updatePage" page={pending.page || 1} param="pendingPage" totalPages={pending.totalPages} />
        <h2>待发布更新（{updateIDs.length}）</h2>
        <ReviewPagination label="待发布更新分页" otherPage={pendingPage} otherParam="pendingPage" page={updatePage} param="updatePage" totalPages={updateTotalPages} />
    </main>
}
