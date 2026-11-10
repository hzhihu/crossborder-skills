import { describe, expect, it } from 'vitest'

import { getMetadata } from './metadata'

describe('public metadata', () => {
    it('uses clean canonical URLs and the approved default image', () => {
        const metadata = getMetadata('Title', 'Description', '/skills')
        expect(metadata.alternates).toEqual({ canonical: 'http://localhost:3000/skills' })
        expect(metadata.openGraph?.images).toEqual([{ url: 'http://localhost:3000/og/default.png', width: 1200, height: 630, alt: 'CrossBorder Skills Hub' }])
    })

    it('marks query pages noindex but follow', () => {
        expect(getMetadata('Search', 'Search', '/search', true).robots).toEqual({ index: false, follow: true })
    })
})
