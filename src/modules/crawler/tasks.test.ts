import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { queueCreatedCrawlTask, recrawlSkill, retryCrawlTask, validateCrawlTask } from './tasks.ts'

describe('crawl task validation and queueing', () => {
    it('只给新建的 queued Skill 采集任务入队', async () => {
        const queue = vi.fn()
        const req = { payload: { jobs: { queue } } } as unknown as PayloadRequest
        await queueCreatedCrawlTask({ doc: { id: 1, status: 'queued', task_type: 'crawl' }, operation: 'create', req })
        expect(queue).toHaveBeenCalledWith(expect.objectContaining({ input: { taskId: 1 }, task: 'crawlSkill' }))
        await queueCreatedCrawlTask({ doc: { id: 2, status: 'failed', task_type: 'crawl' }, operation: 'create', req })
        expect(queue).toHaveBeenCalledTimes(1)
    })

    it('规范化来源并拒绝非 Skill', () => {
        const data = { resource_type: 'Skill', source_url: 'https://www.github.com/acme/demo.git', task_type: 'crawl' }
        validateCrawlTask({ data, operation: 'create' })
        expect(data.source_url).toBe('https://github.com/acme/demo')
        expect(() => validateCrawlTask({ data: { ...data, resource_type: 'Agent' }, operation: 'create' })).toThrow(/只支持 Skill/)
    })
})

describe('retryCrawlTask', () => {
    it('禁止从已有直接重试记录的旧任务再次重试', async () => {
        const req = {
            payload: {
                find: vi.fn().mockResolvedValue({ totalDocs: 1 }),
                findByID: vi.fn().mockResolvedValue({ id: 1, resource_type: 'Skill', status: 'failed', task_type: 'crawl' }),
            },
            routeParams: { id: '1' },
            user: { id: 1 },
        } as unknown as PayloadRequest
        const response = await retryCrawlTask(req)
        expect(response.status).toBe(409)
        expect(await response.json()).toMatchObject({ error: expect.stringContaining('最新重试任务') })
    })

    it('创建带 retry_of 的新任务', async () => {
        const original = { id: 1, repository_path: 'demo/SKILL.md', resource_type: 'Skill', source_url: 'https://github.com/acme/demo', status: 'failed', task_type: 'crawl' }
        const req = {
            payload: {
                create: vi.fn().mockResolvedValue({ id: 2, retry_of: 1, status: 'queued' }),
                find: vi.fn().mockResolvedValue({ totalDocs: 0 }),
                findByID: vi.fn().mockResolvedValue(original),
            },
            routeParams: { id: '1' }, user: { id: 1 },
        } as unknown as PayloadRequest
        const response = await retryCrawlTask(req)
        expect(response.status).toBe(201)
        expect(req.payload.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ retry_of: 1, status: 'queued', task_type: 'crawl' }),
        }))
    })

    it('创建发生唯一冲突后返回 409', async () => {
        const original = { id: 1, resource_type: 'Skill', source_url: 'https://github.com/acme/demo', status: 'failed', task_type: 'crawl' }
        const find = vi.fn()
            .mockResolvedValueOnce({ totalDocs: 0 })
            .mockResolvedValueOnce({ totalDocs: 1 })
        const req = {
            payload: {
                create: vi.fn().mockRejectedValue(new Error('The following field is invalid: retry_of_id')),
                find,
                findByID: vi.fn().mockResolvedValue(original),
            },
            routeParams: { id: '1' }, user: { id: 1 },
        } as unknown as PayloadRequest
        expect((await retryCrawlTask(req)).status).toBe(409)
    })

    it('拒绝非 Skill 和未登录请求', async () => {
        const anonymous = await retryCrawlTask({ routeParams: { id: '1' }, user: null } as unknown as PayloadRequest)
        expect(anonymous.status).toBe(401)
        const req = {
            payload: { findByID: vi.fn().mockResolvedValue({ resource_type: 'Agent', task_type: 'crawl' }) },
            routeParams: { id: '1' }, user: { id: 1 },
        } as unknown as PayloadRequest
        expect((await retryCrawlTask(req)).status).toBe(409)
    })
})

describe('recrawlSkill', () => {
    it('使用规范化来源创建重新采集任务', async () => {
        const skill = { categories: [], id: 1, repository_path: '/demo/SKILL.md/', repository_url: 'https://github.com/acme/demo', resource_type: 'Skill', source_url: 'https://www.github.com/acme/demo.git' }
        const create = vi.fn().mockResolvedValue({ id: 2, status: 'queued' })
        const req = { payload: { create, findByID: vi.fn().mockResolvedValue(skill) }, routeParams: { id: '1' }, user: { id: 1 } } as unknown as PayloadRequest
        expect((await recrawlSkill(req)).status).toBe(201)
        expect(create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ repository_path: 'demo/SKILL.md', source_url: 'https://github.com/acme/demo' }),
        }))
    })

    it('拒绝非 Skill 和无效来源', async () => {
        const findByID = vi.fn()
            .mockResolvedValueOnce({ id: 1, resource_type: 'MCP Server' })
            .mockResolvedValueOnce({ id: 1, repository_path: '../bad', repository_url: 'https://github.com/acme/demo', resource_type: 'Skill', source_url: 'https://github.com/acme/demo' })
        const req = { payload: { findByID }, routeParams: { id: '1' }, user: { id: 1 } } as unknown as PayloadRequest
        expect((await recrawlSkill(req)).status).toBe(409)
        expect((await recrawlSkill(req)).status).toBe(409)
    })
})
