import { describe, expect, it, vi } from 'vitest'

import { findSkillFiles, getRepository, readSkillFile, type Repository } from './github.ts'

const repository: Repository = {
    defaultBranch: 'main', forks: 0, fullName: 'acme/demo', name: 'demo', owner: 'acme',
    pushedAt: '', stars: 0, updatedAt: '', url: 'https://github.com/acme/demo',
}

function json(data: unknown) {
    return new Response(JSON.stringify(data), { status: 200 })
}

describe('findSkillFiles', () => {
    it('指定文件路径时不请求完整仓库树', async () => {
        const fetcher = vi.fn()
        expect(await findSkillFiles(repository, 'demo/SKILL.md', fetcher)).toEqual(['demo/SKILL.md'])
        expect(fetcher).not.toHaveBeenCalled()
    })

    it('指定目录时通过 contents API 递归查找', async () => {
        const fetcher = vi.fn(async (input: string | URL | Request) => {
            const url = String(input)
            if (url.includes('/contents/skills?')) return json([{ name: 'nested', path: 'skills/nested', type: 'dir' }])
            return json([{ name: 'SKILL.md', path: 'skills/nested/SKILL.md', type: 'file' }])
        })
        expect(await findSkillFiles(repository, 'skills', fetcher)).toEqual(['skills/nested/SKILL.md'])
        expect(String(fetcher.mock.calls[0][0])).not.toContain('/git/trees/')
    })

    it('完整树只接受 basename 严格等于 SKILL.md 的文件', async () => {
        const tree = [{ path: 'docs/NOTSKILL.md', type: 'blob' }, { path: 'docs/SKILL.md', type: 'blob' }]
        expect(await findSkillFiles(repository, '', async () => json({ tree }))).toEqual(['docs/SKILL.md'])
    })

    it('完整树被截断时给出明确异常', async () => {
        await expect(findSkillFiles(repository, '', async () => json({ truncated: true }))).rejects.toThrow(/指定子目录/)
    })
})

describe('repository safety', () => {
    it('拒绝私有仓库', async () => {
        await expect(getRepository('https://github.com/acme/demo', async () => json({ private: true }))).rejects.toThrow(/公开/)
    })

    it('拒绝超过大小限制的文件', async () => {
        const fetcher = async () => json({ content: 'YQ==', encoding: 'base64', size: 1000001 })
        await expect(readSkillFile(repository, 'demo/SKILL.md', fetcher)).rejects.toThrow(/限制/)
    })
})
