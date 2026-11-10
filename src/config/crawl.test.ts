import { afterEach, describe, expect, it } from 'vitest'

import { getCrawlConfig } from './crawl'

const names = ['CRAWL_MAX_RETRIES', 'CRAWL_TIMEOUT_MS', 'CRAWL_MAX_MARKDOWN_BYTES']
const original = Object.fromEntries(names.map((name) => [name, process.env[name]]))

afterEach(() => {
    for (const name of names) {
        if (original[name] === undefined) {
            delete process.env[name]
        } else {
            process.env[name] = original[name]
        }
    }
})

describe('getCrawlConfig', () => {
    it('uses approved defaults', () => {
        for (const name of names) {
            delete process.env[name]
        }

        expect(getCrawlConfig()).toEqual({ maxRetries: 3, timeoutMs: 30000, maxMarkdownBytes: 1000000 })
    })

    it('accepts environment overrides and rejects invalid values', () => {
        process.env.CRAWL_MAX_RETRIES = '5'
        process.env.CRAWL_TIMEOUT_MS = '10000'
        process.env.CRAWL_MAX_MARKDOWN_BYTES = '2000000'
        expect(getCrawlConfig()).toEqual({ maxRetries: 5, timeoutMs: 10000, maxMarkdownBytes: 2000000 })

        process.env.CRAWL_TIMEOUT_MS = '0'
        expect(() => getCrawlConfig()).toThrow('CRAWL_TIMEOUT_MS')
    })
})
