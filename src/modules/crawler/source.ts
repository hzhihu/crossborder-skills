import { getCrawlConfig } from '../../config/crawl.ts'
import { getSafeSourceUrl, normalizeRepositoryUrl } from '../skills/source.ts'

export type CrawlSource = {
    repositoryUrl: string
    skillSlug?: string
    sourceUrl: string
}

export function parseCrawlSource(value: string): CrawlSource {
    const sourceUrl = getSafeSourceUrl(value)
    if (!sourceUrl) {
        throw new Error('只支持 HTTPS 的公开 GitHub 仓库地址或 Skills.sh 单资源详情地址。')
    }

    const url = new URL(sourceUrl)
    if (url.search || url.hash) {
        throw new Error('采集地址不能包含查询参数或片段。')
    }

    const segments = url.pathname.split('/').filter(Boolean)
    if (['github.com', 'www.github.com'].includes(url.hostname)) {
        if (segments.length !== 2) {
            throw new Error('GitHub 采集地址必须是仓库根地址，文件路径请单独填写。')
        }
        const repositoryUrl = normalizeRepositoryUrl(sourceUrl)
        if (!repositoryUrl) throw new Error('GitHub 仓库地址无效。')
        return { repositoryUrl, sourceUrl: repositoryUrl }
    }

    if (segments.length !== 3) {
        throw new Error('Skills.sh 只支持 /owner/repository/skill 单资源详情地址。')
    }
    if (['agent', 'hot', 'official', 'packs', 'search', 'topics'].includes(segments[0])) {
        throw new Error('Skills.sh 目录、搜索和榜单地址不能用于采集。')
    }

    return {
        repositoryUrl: `https://github.com/${segments[0]}/${segments[1]}`,
        skillSlug: segments[2],
        sourceUrl,
    }
}

export async function validateSkillsShPage(source: CrawlSource, fetcher: typeof fetch = fetch) {
    if (!source.skillSlug) return
    const response = await fetcher(source.sourceUrl, { signal: AbortSignal.timeout(getCrawlConfig().timeoutMs) })
    if (!response.ok) throw new Error(`Skills.sh 页面读取失败（${response.status}）。`)
    const html = await response.text()
    if (Buffer.byteLength(html) > getCrawlConfig().maxMarkdownBytes) throw new Error('Skills.sh 页面超过允许的大小限制。')

    const expectedPath = new URL(source.sourceUrl).pathname.replace(/\/$/, '')
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1]
    if (!canonical || new URL(canonical).pathname.replace(/\/$/, '') !== expectedPath) {
        throw new Error('Skills.sh 地址不是单个资源详情页。')
    }

    const expectedRepository = new URL(source.repositoryUrl).pathname.slice(1)
    const repositoryLink = html.match(/<a\b[^>]*href="https:\/\/github\.com\/[^"]+"[^>]*>/g)?.find((anchor) => {
        const href = anchor.match(/href="([^"]+)"/)?.[1]
        const title = anchor.match(/title="([^"]+)"/)?.[1]
        return href === source.repositoryUrl && title === expectedRepository
    })
    if (!repositoryLink) throw new Error('Skills.sh 页面未确认对应的公开 GitHub 仓库。')
}

export function normalizeRepositoryPath(value: string | null | undefined) {
    if (!value?.trim()) return ''
    const path = value.trim().replace(/^\/+|\/+$/g, '')
    if (path.includes('\\') || path.split('/').some((segment) => !segment || segment === '.' || segment === '..')) {
        throw new Error('文件路径必须是仓库内的相对路径，且不能包含上级目录。')
    }
    return path
}
