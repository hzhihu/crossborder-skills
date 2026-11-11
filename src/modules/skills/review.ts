import type { PayloadRequest } from 'payload'

import { getContentHash, parseSkillMarkdown } from '../crawler/parser.ts'

function getReviewRequest(req: PayloadRequest) {
    if (!req.user) return { response: Response.json({ error: '需要管理员登录。' }, { status: 401 }) }
    const id = Number(req.routeParams?.id)
    if (!Number.isInteger(id)) return { response: Response.json({ error: 'Skill 编号无效。' }, { status: 400 }) }
    return { id }
}

async function getExpectedHash(req: PayloadRequest) {
    try {
        const body = await req.json?.() as { expectedHash?: unknown } | undefined
        return typeof body?.expectedHash === 'string' ? body.expectedHash : ''
    } catch {
        return ''
    }
}

export async function publishSkillReview(req: PayloadRequest) {
    const request = getReviewRequest(req)
    if (request.response) return request.response
    const expectedHash = await getExpectedHash(req)
    if (!expectedHash) return Response.json({ error: '缺少审核内容 Hash，请刷新审核页后重试。' }, { status: 400 })

    const skill = await req.payload.findByID({ collection: 'skills', id: request.id, req })
    if (skill.resource_type !== 'Skill') return Response.json({ error: '只有 Skill 可以进入公开审核。' }, { status: 409 })

    let data: { description?: string, name?: string, raw_content?: string, status: 'published' } = { status: 'published' }
    if (skill.status === 'published') {
        const latest = await req.payload.find({
            collection: 'skillVersions',
            limit: 1,
            req,
            sort: '-version',
            where: { skill_id: { equals: skill.id } },
        })
        const latestVersion = latest.docs[0]
        if (!latestVersion || latestVersion.content_hash === getContentHash(skill.raw_content || '')) {
            return Response.json({ error: '该 Skill 没有待审核更新。' }, { status: 409 })
        }
        if (latestVersion.content_hash !== expectedHash) {
            return Response.json({ error: '待审核内容已变化，请刷新并重新审核。' }, { status: 409 })
        }
        const parsed = parseSkillMarkdown(latestVersion.raw_content, skill.repository_path || '')
        if (parsed.errors.length) {
            return Response.json({ error: '新版本 Frontmatter 存在异常，请先处理后再发布。' }, { status: 409 })
        }
        data = {
            description: parsed.description,
            name: parsed.name,
            raw_content: latestVersion.raw_content,
            status: 'published',
        }
    } else if (skill.status === 'pending') {
        if (getContentHash(skill.raw_content || '') !== expectedHash) {
            return Response.json({ error: '待审核内容已变化，请刷新并重新审核。' }, { status: 409 })
        }
        if (parseSkillMarkdown(skill.raw_content || '', skill.repository_path || '').errors.length) {
            return Response.json({ error: '原始内容 Frontmatter 存在异常，请先处理后再发布。' }, { status: 409 })
        }
    } else {
        return Response.json({ error: '只有待审核 Skill 可以发布。' }, { status: 409 })
    }

    const updated = await req.payload.update({ collection: 'skills', data, id: skill.id, req })
    return Response.json(updated)
}

export async function rejectSkillReview(req: PayloadRequest) {
    const request = getReviewRequest(req)
    if (request.response) return request.response
    const skill = await req.payload.findByID({ collection: 'skills', id: request.id, req })
    if (skill.resource_type !== 'Skill') return Response.json({ error: '只有 Skill 可以进入公开审核。' }, { status: 409 })
    if (skill.status !== 'pending') {
        return Response.json({ error: '只有待审核 Skill 可以驳回；已发布资源的旧公开版本不会因新采集更新而下架。' }, { status: 409 })
    }
    const updated = await req.payload.update({ collection: 'skills', data: { status: 'rejected' }, id: skill.id, req })
    return Response.json(updated)
}
