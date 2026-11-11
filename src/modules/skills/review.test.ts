import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { getContentHash } from '../crawler/parser.ts'
import { publishSkillReview, rejectSkillReview } from './review.ts'

function getRequest(payload: unknown, hash = '') {
    return {
        json: vi.fn().mockResolvedValue({ expectedHash: hash }),
        payload,
        routeParams: { id: '1' },
        user: { id: 1 },
    } as unknown as PayloadRequest
}

describe('Skill 人工审核', () => {
    it('拒绝未登录的发布和驳回请求', async () => {
        const req = { routeParams: { id: '1' }, user: null } as unknown as PayloadRequest
        expect((await publishSkillReview(req)).status).toBe(401)
        expect((await rejectSkillReview(req)).status).toBe(401)
    })

    it('发布请求必须携带审核内容 Hash', async () => {
        const req = getRequest({})
        expect((await publishSkillReview(req)).status).toBe(400)
    })

    it('拒绝发布非 Skill 资源', async () => {
        const payload = { findByID: vi.fn().mockResolvedValue({ id: 1, resource_type: 'Agent', status: 'pending' }) }
        expect((await publishSkillReview(getRequest(payload, getContentHash('')))).status).toBe(409)
    })

    it('发布待审核 Skill 并复用现有发布校验', async () => {
        const raw = '---\nname: Pending\ndescription: Pending description\n---\n# Pending version\n'
        const update = vi.fn().mockResolvedValue({ id: 1, status: 'published' })
        const payload = { findByID: vi.fn().mockResolvedValue({ id: 1, raw_content: raw, resource_type: 'Skill', status: 'pending' }), update }
        const req = getRequest(payload, getContentHash(raw))
        const response = await publishSkillReview(req)
        expect(response.status).toBe(200)
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'published' }, id: 1, req }))
    })

    it('待审核 Skill 缺少原始内容时拒绝发布', async () => {
        const payload = { findByID: vi.fn().mockResolvedValue({ id: 1, raw_content: '', repository_path: 'demo/SKILL.md', resource_type: 'Skill', status: 'pending' }) }
        expect((await publishSkillReview(getRequest(payload, getContentHash('')))).status).toBe(409)
    })

    it('待审核 Skill 的 Frontmatter 异常时拒绝发布', async () => {
        const raw = '# Missing frontmatter'
        const payload = { findByID: vi.fn().mockResolvedValue({ id: 1, raw_content: raw, repository_path: 'demo/SKILL.md', resource_type: 'Skill', status: 'pending' }) }
        expect((await publishSkillReview(getRequest(payload, getContentHash(raw)))).status).toBe(409)
    })

    it('待审核内容变化后拒绝发布旧快照', async () => {
        const payload = { findByID: vi.fn().mockResolvedValue({ id: 1, raw_content: '# Changed', resource_type: 'Skill', status: 'pending' }) }
        expect((await publishSkillReview(getRequest(payload, getContentHash('# Reviewed')))).status).toBe(409)
    })

    it('已发布 Skill 只在审核后应用最新采集版本和解析字段', async () => {
        const update = vi.fn().mockResolvedValue({ id: 1, status: 'published' })
        const raw = '---\nname: New name\ndescription: New description\n---\n# New version\n'
        const payload = {
            find: vi.fn().mockResolvedValue({ docs: [{ content_hash: getContentHash(raw), raw_content: raw, version: 2 }] }),
            findByID: vi.fn().mockResolvedValue({ id: 1, raw_content: '# Public version', repository_path: 'demo/SKILL.md', resource_type: 'Skill', status: 'published' }),
            update,
        }
        expect((await publishSkillReview(getRequest(payload, getContentHash(raw)))).status).toBe(200)
        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            data: { description: 'New description', name: 'New name', raw_content: raw, status: 'published' },
        }))
    })

    it('已发布 Skill 的最新版本变化后拒绝发布旧快照', async () => {
        const raw = '---\nname: New name\ndescription: New description\n---\n# New version\n'
        const payload = {
            find: vi.fn().mockResolvedValue({ docs: [{ content_hash: getContentHash(raw), raw_content: raw, version: 3 }] }),
            findByID: vi.fn().mockResolvedValue({ id: 1, raw_content: '# Public version', resource_type: 'Skill', status: 'published' }),
        }
        expect((await publishSkillReview(getRequest(payload, getContentHash('# Reviewed version 2')))).status).toBe(409)
    })

    it('没有待审核更新时不重复发布', async () => {
        const raw = '# Public version'
        const payload = {
            find: vi.fn().mockResolvedValue({ docs: [{ content_hash: getContentHash(raw), raw_content: raw, version: 1 }] }),
            findByID: vi.fn().mockResolvedValue({ id: 1, raw_content: raw, resource_type: 'Skill', status: 'published' }),
        }
        expect((await publishSkillReview(getRequest(payload, getContentHash(raw)))).status).toBe(409)
    })

    it('新版本 Frontmatter 异常时不发布', async () => {
        const raw = '# Missing frontmatter'
        const payload = {
            find: vi.fn().mockResolvedValue({ docs: [{ content_hash: getContentHash(raw), raw_content: raw, version: 2 }] }),
            findByID: vi.fn().mockResolvedValue({ id: 1, raw_content: '# Public version', repository_path: 'demo/SKILL.md', resource_type: 'Skill', status: 'published' }),
        }
        expect((await publishSkillReview(getRequest(payload, getContentHash(raw)))).status).toBe(409)
    })

    it('只允许驳回待审核 Skill', async () => {
        const update = vi.fn().mockResolvedValue({ id: 1, status: 'rejected' })
        const payload = { findByID: vi.fn().mockResolvedValue({ id: 1, resource_type: 'Skill', status: 'pending' }), update }
        expect((await rejectSkillReview(getRequest(payload))).status).toBe(200)
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'rejected' } }))
        payload.findByID = vi.fn().mockResolvedValue({ id: 1, resource_type: 'Skill', status: 'published' })
        expect((await rejectSkillReview(getRequest(payload))).status).toBe(409)
        payload.findByID = vi.fn().mockResolvedValue({ id: 1, resource_type: 'Agent', status: 'pending' })
        expect((await rejectSkillReview(getRequest(payload))).status).toBe(409)
    })
})
