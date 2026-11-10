function getIntegerSetting(value: string | undefined, fallback: number, name: string, minimum: number) {
    if (!value) {
        return fallback
    }

    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < minimum) {
        throw new Error(`${name} 必须是大于或等于 ${minimum} 的整数。`)
    }

    return parsed
}

export function getCrawlConfig() {
    return {
        maxRetries: getIntegerSetting(process.env.CRAWL_MAX_RETRIES, 3, 'CRAWL_MAX_RETRIES', 0),
        timeoutMs: getIntegerSetting(process.env.CRAWL_TIMEOUT_MS, 30000, 'CRAWL_TIMEOUT_MS', 1),
        maxMarkdownBytes: getIntegerSetting(process.env.CRAWL_MAX_MARKDOWN_BYTES, 1000000, 'CRAWL_MAX_MARKDOWN_BYTES', 1),
    }
}
