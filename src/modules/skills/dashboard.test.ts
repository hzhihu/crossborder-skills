import { describe, expect, it } from 'vitest'

import { getDashboardRecentStart } from './dashboard'

describe('Dashboard recent statistics', () => {
    it('starts seven Shanghai calendar days at midnight', () => {
        expect(getDashboardRecentStart(new Date('2026-11-11T08:00:00.000Z'))).toBe('2026-11-04T16:00:00.000Z')
    })

    it('uses the Shanghai date near UTC midnight', () => {
        expect(getDashboardRecentStart(new Date('2026-11-10T16:30:00.000Z'))).toBe('2026-11-04T16:00:00.000Z')
        expect(getDashboardRecentStart(new Date('2026-11-10T15:30:00.000Z'))).toBe('2026-11-03T16:00:00.000Z')
    })
})
