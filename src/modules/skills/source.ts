const allowedHosts = new Set(['github.com', 'www.github.com', 'skills.sh', 'www.skills.sh'])

export function getSafeSourceUrl(value: string | null | undefined) {
    if (!value) return ''
    try {
        const url = new URL(value)
        if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname) || url.username || url.password) return ''
        return url.toString()
    } catch {
        return ''
    }
}

export function normalizeRepositoryUrl(value: string | null | undefined) {
    const safeUrl = getSafeSourceUrl(value)
    if (!safeUrl) return ''
    const url = new URL(safeUrl)
    if (!['github.com', 'www.github.com'].includes(url.hostname)) return ''
    url.hostname = 'github.com'
    url.hash = ''
    url.search = ''
    url.pathname = url.pathname.replace(/\.git\/?$/, '').replace(/\/$/, '')
    return url.toString()
}
