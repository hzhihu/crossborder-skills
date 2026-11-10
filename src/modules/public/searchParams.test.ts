import { describe, expect, it } from 'vitest'

import { buildQueryString, escapeLike, parsePublicQuery } from './searchParams'

describe('public query parameters', () => {
    it('deduplicates multi-select values and falls back safely', () => {
        expect(parsePublicQuery({
            q: '  ads  ', platform: ['amazon', 'amazon'], sort: 'invalid', page: '0',
        })).toEqual({ q: 'ads', category: '', platforms: ['amazon'], tools: [], tags: [], sort: 'latest', page: 1 })
    })

    it('preserves confirmed state in shareable URLs', () => {
        const query = parsePublicQuery({ q: 'ads', category: 'marketing', platform: ['amazon', 'shopify'], sort: 'stars', page: '2' })
        expect(buildQueryString(query)).toBe('?q=ads&category=marketing&platform=amazon&platform=shopify&sort=stars&page=2')
        expect(buildQueryString(query, 1)).toBe('?q=ads&category=marketing&platform=amazon&platform=shopify&sort=stars')
    })
})

describe('escapeLike', () => {
    it('treats SQL wildcard characters as literal keyword input', () => {
        expect(escapeLike('100%_test\\')).toBe('100\\%\\_test\\\\')
    })
})
