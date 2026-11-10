import { describe, expect, it } from 'vitest'

import { getSafeSourceUrl, normalizeRepositoryUrl } from './source'

describe('source URLs', () => {
    it('only allows public HTTPS source hosts', () => {
        expect(getSafeSourceUrl('javascript:alert(1)')).toBe('')
        expect(getSafeSourceUrl('https://evil.example/repo')).toBe('')
        expect(getSafeSourceUrl('https://github.com/owner/repo')).toContain('github.com')
        expect(getSafeSourceUrl('https://skills.sh/owner/repo/skill')).toContain('skills.sh')
    })

    it('normalizes GitHub repository URLs', () => {
        expect(normalizeRepositoryUrl('https://www.github.com/owner/repo.git/?x=1')).toBe('https://github.com/owner/repo')
    })
})
