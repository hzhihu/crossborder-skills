import type { PayloadRequest } from 'payload'

import { getCrawlConfig } from '../../config/crawl.ts'
import { normalizeRepositoryPath, parseCrawlSource } from './source.ts'

export async function queueCreatedCrawlTask({ doc, operation, req }: {
    doc: { id: number, status: string, task_type: string }
    operation: string
    req: PayloadRequest
}) {
    if (operation === 'create' && doc.task_type === 'crawl' && doc.status === 'queued') {
        await req.payload.jobs.queue({ input: { taskId: doc.id }, overrideAccess: true, req, task: 'crawlSkill' })
    }
    return doc
}

export function validateCrawlTask({ data, operation }: {
    data?: { repository_path?: string, resource_type?: string, source_url?: string, task_type?: string }
    operation: string
}) {
    if (operation === 'create' && data?.task_type === 'crawl' && data.source_url) {
        if (data.resource_type !== 'Skill') throw new Error('自动采集只支持 Skill。')
        data.source_url = parseCrawlSource(data.source_url).sourceUrl
        data.repository_path = normalizeRepositoryPath(data.repository_path)
    }
    return data
}

function getID(value: unknown) {
    return typeof value === 'object' && value !== null && 'id' in value ? Number(value.id) : Number(value)
}

export async function retryCrawlTask(req: PayloadRequest) {
    if (!req.user) return Response.json({ error: '需要管理员登录。' }, { status: 401 })
    const id = Number(req.routeParams?.id)
    if (!Number.isInteger(id)) return Response.json({ error: '任务编号无效。' }, { status: 400 })
    const original = await req.payload.findByID({ collection: 'crawlTasks', id, req })
    if (original.task_type !== 'crawl' || original.resource_type !== 'Skill') {
        return Response.json({ error: '只有 Skill 采集任务可以重试。' }, { status: 409 })
    }
    if (!['failed', 'needs_review'].includes(original.status)) {
        return Response.json({ error: '只有失败或需要异常审核的任务可以重试。' }, { status: 409 })
    }

    const children = await req.payload.find({
        collection: 'crawlTasks',
        limit: 1,
        req,
        where: { retry_of: { equals: original.id } },
    })
    if (children.totalDocs > 0) {
        return Response.json({ error: '该任务已有重试记录，请从最新重试任务继续。' }, { status: 409 })
    }

    let parent = original
    for (let count = 0; count < getCrawlConfig().maxRetries; count++) {
        if (!parent.retry_of) {
            try {
                const retry = await req.payload.create({
                    collection: 'crawlTasks',
                    data: {
                        category: original.category ? getID(original.category) : undefined,
                        repository_path: original.repository_path,
                        resource_type: original.resource_type,
                        retry_of: original.id,
                        skill: original.skill ? getID(original.skill) : undefined,
                        source_url: original.source_url,
                        status: 'queued',
                        task_type: 'crawl',
                    },
                    req,
                })
                return Response.json(retry, { status: 201 })
            } catch (error) {
                const concurrentChildren = await req.payload.find({
                    collection: 'crawlTasks',
                    limit: 1,
                    req,
                    where: { retry_of: { equals: original.id } },
                })
                if (concurrentChildren.totalDocs > 0) {
                    return Response.json({ error: '该任务已有重试记录，请从最新重试任务继续。' }, { status: 409 })
                }
                throw error
            }
        }
        parent = await req.payload.findByID({ collection: 'crawlTasks', id: getID(parent.retry_of), req })
    }
    return Response.json({ error: '该任务已达到最大人工重试次数。' }, { status: 409 })
}

export async function recrawlSkill(req: PayloadRequest) {
    if (!req.user) return Response.json({ error: '需要管理员登录。' }, { status: 401 })
    const id = Number(req.routeParams?.id)
    if (!Number.isInteger(id)) return Response.json({ error: 'Skill 编号无效。' }, { status: 400 })
    const skill = await req.payload.findByID({ collection: 'skills', id, req })
    if (skill.resource_type !== 'Skill') {
        return Response.json({ error: '只有 Skill 可以自动重新采集。' }, { status: 409 })
    }
    if (!skill.source_url || !skill.repository_url || !skill.repository_path) {
        return Response.json({ error: '该 Skill 缺少可重新采集的来源信息。' }, { status: 409 })
    }
    let sourceUrl: string
    let repositoryPath: string
    try {
        sourceUrl = parseCrawlSource(skill.source_url).sourceUrl
        repositoryPath = normalizeRepositoryPath(skill.repository_path)
    } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : '来源信息无效。' }, { status: 409 })
    }
    const task = await req.payload.create({
        collection: 'crawlTasks',
        data: {
            category: skill.categories?.[0] ? getID(skill.categories[0]) : undefined,
            repository_path: repositoryPath,
            resource_type: 'Skill',
            skill: skill.id,
            source_url: sourceUrl,
            status: 'queued',
            task_type: 'crawl',
        },
        req,
    })
    return Response.json(task, { status: 201 })
}
