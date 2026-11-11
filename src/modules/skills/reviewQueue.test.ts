import { describe, expect, it } from 'vitest'

import { getContentHash } from '../crawler/parser.ts'
import { getPendingUpdatePage } from './reviewQueue.ts'

describe('待发布更新分页', () => {
    it('先过滤更新再分页，不受已发布资源总数影响', () => {
        const skills = Array.from({ length: 21 }, (_, index) => ({ id: index + 1, raw_content: `public-${index + 1}` }))
        const latestHashes = new Map([[21, 'pending-update']])
        const result = getPendingUpdatePage(skills, latestHashes, 1, 20)
        expect(result).toEqual({ ids: [21], page: 1, pageIDs: [21], totalPages: 1 })
    })

    it('排除当前公开版本并将越界页限制到最后可用页', () => {
        const raw = 'public'
        const skills = Array.from({ length: 21 }, (_, index) => ({ id: index + 1, raw_content: raw }))
        const latestHashes = new Map(skills.map((skill) => [skill.id, skill.id === 1 ? getContentHash(raw) : `update-${skill.id}`]))
        const result = getPendingUpdatePage(skills, latestHashes, 2, 20)
        expect(result.ids).toHaveLength(20)
        expect(result.ids).not.toContain(1)
        expect(result.pageIDs).toHaveLength(20)
        expect(result.totalPages).toBe(1)
        expect(result.page).toBe(1)
    })
})
