import { describe, expect, it } from 'vitest'

import { getHomeRecentDays } from './site'

describe('getHomeRecentDays', () => {
    it('uses 7 days by default', () => {
        expect(getHomeRecentDays(undefined)).toBe(7)
        expect(getHomeRecentDays('')).toBe(7)
    })

    it('accepts a positive integer from configuration', () => {
        expect(getHomeRecentDays('30')).toBe(30)
    })

    it('rejects invalid periods', () => {
        expect(() => getHomeRecentDays('0')).toThrow('正整数')
        expect(() => getHomeRecentDays('1.5')).toThrow('正整数')
        expect(() => getHomeRecentDays('invalid')).toThrow('正整数')
    })
})
