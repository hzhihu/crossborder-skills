import { getCrawlConfig } from '../../config/crawl.ts'

export type Repository = {
    defaultBranch: string
    forks: number
    fullName: string
    name: string
    owner: string
    pushedAt: string
    stars: number
    updatedAt: string
    url: string
}

export type RepositoryFile = {
    content: string
    path: string
}

type Fetcher = typeof fetch

async function request(fetcher: Fetcher, path: string) {
    const headers = new Headers({ Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' })
    if (process.env.GITHUB_TOKEN) headers.set('Authorization', `Bearer ${process.env.GITHUB_TOKEN}`)
    const response = await fetcher(`https://api.github.com${path}`, {
        headers,
        signal: AbortSignal.timeout(getCrawlConfig().timeoutMs),
    })
    if (!response.ok) {
        throw new Error(`GitHub API 请求失败（${response.status}）：${path.split('?')[0]}`)
    }
    return response
}

export async function getRepository(repositoryUrl: string, fetcher: Fetcher = fetch): Promise<Repository> {
    const [owner, name] = new URL(repositoryUrl).pathname.split('/').filter(Boolean)
    const data = await (await request(fetcher, `/repos/${owner}/${name}`)).json() as {
        default_branch: string
        forks_count: number
        full_name: string
        html_url: string
        name: string
        owner: { login: string }
        private: boolean
        pushed_at: string
        stargazers_count: number
        updated_at: string
    }
    if (data.private) throw new Error('只允许采集公开 GitHub 仓库。')
    return {
        defaultBranch: data.default_branch,
        forks: data.forks_count,
        fullName: data.full_name,
        name: data.name,
        owner: data.owner.login,
        pushedAt: data.pushed_at,
        stars: data.stargazers_count,
        updatedAt: data.updated_at,
        url: data.html_url,
    }
}

function getContentsPath(repository: Repository, path: string) {
    return `/repos/${repository.fullName}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(repository.defaultBranch)}`
}

async function findDirectorySkills(repository: Repository, directory: string, fetcher: Fetcher): Promise<string[]> {
    const response = await request(fetcher, getContentsPath(repository, directory))
    const data = await response.json() as { name: string, path: string, type: string } | { name: string, path: string, type: string }[]
    if (!Array.isArray(data)) return data.path.endsWith('.md') ? [data.path] : []
    const files: string[] = []
    for (const item of data) {
        if (item.type === 'file' && item.name === 'SKILL.md') files.push(item.path)
        if (item.type === 'dir') files.push(...await findDirectorySkills(repository, item.path, fetcher))
    }
    return files.sort()
}

export async function findSkillFiles(repository: Repository, repositoryPath: string, fetcher: Fetcher = fetch) {
    if (repositoryPath.endsWith('.md')) return [repositoryPath]
    if (repositoryPath) return findDirectorySkills(repository, repositoryPath, fetcher)

    const response = await request(fetcher, `/repos/${repository.fullName}/git/trees/${encodeURIComponent(repository.defaultBranch)}?recursive=1`)
    const data = await response.json() as { tree?: { path: string, type: string }[], truncated?: boolean }
    if (data.truncated) throw new Error('仓库文件列表过大，请指定子目录或文件路径后重试。')
    return (data.tree || []).filter((item) => item.type === 'blob' && item.path.split('/').at(-1) === 'SKILL.md').map((item) => item.path).sort()
}

export async function readSkillFile(repository: Repository, path: string, fetcher: Fetcher = fetch): Promise<RepositoryFile> {
    const response = await request(fetcher, getContentsPath(repository, path))
    const data = await response.json() as { content?: string, encoding?: string, size?: number }
    const maxBytes = getCrawlConfig().maxMarkdownBytes
    if (!data.content || data.encoding !== 'base64' || !data.size || data.size > maxBytes) {
        throw new Error(`文件为空、格式不支持或超过 ${maxBytes} 字节限制。`)
    }
    const buffer = Buffer.from(data.content, 'base64')
    if (buffer.byteLength > maxBytes) throw new Error(`文件超过 ${maxBytes} 字节限制。`)
    return { content: buffer.toString('utf8'), path }
}
