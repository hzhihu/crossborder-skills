import type { Payload } from 'payload'
import { describe, expect, it } from 'vitest'

import { executeCrawlTask } from './execute.ts'
import { getContentHash } from './parser.ts'

const markdown = '---\nname: demo\ndescription: Demo\n---\n# Demo\n'

function json(data: unknown) {
    return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } })
}

function createFetcher(content = markdown, paths = ['demo/SKILL.md']) {
    return async (input: string | URL | Request) => {
        const url = String(input)
        if (url.startsWith('https://skills.sh/')) {
            const canonical = `https://www.skills.sh${new URL(url).pathname}`
            return new Response(`<link rel="canonical" href="${canonical}"><a href="https://github.com/acme/demo" title="acme/demo">acme/demo</a>`, { status: 200 })
        }
        if (url.includes('/git/trees/')) return json({ tree: paths.map((path) => ({ path, type: 'blob' })) })
        if (url.includes('/contents/')) return json({ content: Buffer.from(content).toString('base64'), encoding: 'base64', size: Buffer.byteLength(content) })
        return json({
            default_branch: 'main', forks_count: 1, full_name: 'acme/demo', html_url: 'https://github.com/acme/demo',
            name: 'demo', owner: { login: 'acme' }, private: false, pushed_at: '2026-01-01', stargazers_count: 2, updated_at: '2026-01-02',
        })
    }
}

const fetcher = createFetcher()

function createPayload(published = false) {
    const task = { id: 1, repository_path: undefined as string | undefined, resource_type: 'Skill', source_url: 'https://github.com/acme/demo', task_type: 'crawl', status: 'queued' }
    const skills = new Map<number, Record<string, unknown>>()
    const versions: Record<string, unknown>[] = []
    let nextID = 1
    const addVersion = (skill: Record<string, unknown>) => {
        versions.push({ id: versions.length + 1, skill_id: skill.id, version: versions.filter((item) => item.skill_id === skill.id).length + 1, content_hash: getContentHash(String(skill.raw_content)), raw_content: skill.raw_content })
    }
    if (published) {
        const raw = 'old public content'
        skills.set(1, { id: 1, name: 'Public demo', repository_url: 'https://github.com/acme/demo', repository_path: 'demo/SKILL.md', raw_content: raw, status: 'published' })
        versions.push({ id: 1, skill_id: 1, version: 1, content_hash: getContentHash(raw), raw_content: raw })
        nextID = 2
    }
    const payload = {
        create: async ({ collection, data }: { collection: string, data: Record<string, unknown> }) => {
            if (collection === 'skillVersions') {
                const version = { id: versions.length + 1, ...data }
                versions.push(version)
                return version
            }
            const skill = { id: nextID++, ...data }
            skills.set(Number(skill.id), skill)
            addVersion(skill)
            return skill
        },
        find: async ({ collection, where }: { collection: string, where?: Record<string, unknown> }) => {
            if (collection === 'skillVersions') {
                const skillID = Number((where?.skill_id as { equals: number }).equals)
                const docs = versions.filter((item) => item.skill_id === skillID).sort((a, b) => Number(b.version) - Number(a.version))
                return { docs }
            }
            const docs = [...skills.values()]
            return { docs }
        },
        findByID: async () => task,
        update: async ({ collection, data, id }: { collection: string, data: Record<string, unknown>, id: number }) => {
            if (collection === 'crawlTasks') return Object.assign(task, data)
            const current = skills.get(id)!
            const oldContent = current.raw_content
            Object.assign(current, data)
            if (data.raw_content && data.raw_content !== oldContent) addVersion(current)
            return current
        },
    }
    return { payload: payload as unknown as Payload, skills, task, versions }
}

describe('executeCrawlTask', () => {
    it('创建待审核 Skill，重复采集不产生新版本', async () => {
        const { payload, skills, task, versions } = createPayload()
        expect(await executeCrawlTask(payload, 1, fetcher)).toMatchObject({ skills: [{ action: 'created', version: 1 }] })
        expect(skills.get(1)?.status).toBe('pending')
        expect(await executeCrawlTask(payload, 1, fetcher)).toMatchObject({ skills: [{ action: 'unchanged' }] })
        expect(versions).toHaveLength(1)
        expect(task.status).toBe('succeeded')
    }, 20000)

    it('已发布资源的新内容只保存待审核版本', async () => {
        const { payload, skills, task, versions } = createPayload(true)
        expect(await executeCrawlTask(payload, 1, fetcher)).toMatchObject({ skills: [{ action: 'updated', version: 2 }] })
        expect(skills.get(1)?.raw_content).toBe('old public content')
        expect(skills.get(1)?.status).toBe('published')
        expect(versions).toHaveLength(2)
        expect(task.status).toBe('needs_review')
    })

    it('已驳回资源更新后重新进入待审核', async () => {
        const { payload, skills, task, versions } = createPayload()
        await executeCrawlTask(payload, 1, fetcher)
        skills.get(1)!.status = 'rejected'
        const result = await executeCrawlTask(payload, 1, createFetcher(`${markdown}\nChanged`))
        expect(result.skills[0]).toMatchObject({ action: 'updated', version: 2 })
        expect(skills.get(1)?.status).toBe('pending')
        expect(versions).toHaveLength(2)
        expect(task.status).toBe('succeeded')
    })

    it('Skills.sh 地址只导入匹配的资源目录', async () => {
        const { payload, skills, task } = createPayload()
        task.source_url = 'https://skills.sh/acme/demo/demo'
        const result = await executeCrawlTask(payload, 1, createFetcher(markdown, ['demo/SKILL.md', 'other/SKILL.md']))
        expect(result.skills).toHaveLength(1)
        expect(skills.get(1)?.source_url).toBe('https://skills.sh/acme/demo/demo')
        expect(task.status).toBe('succeeded')
    })

    it('Skills.sh 匹配多个同名目录时进入异常审核而不导入', async () => {
        const { payload, skills, task } = createPayload()
        task.source_url = 'https://skills.sh/acme/demo/demo'
        const result = await executeCrawlTask(payload, 1, createFetcher(markdown, ['demo/SKILL.md', 'examples/demo/SKILL.md']))
        expect(result.errors[0].code).toBe('SKILL_SOURCE_AMBIGUOUS')
        expect(skills.size).toBe(0)
        expect(task.status).toBe('needs_review')
    })

    it('Skills.sh 支持唯一的根级 SKILL.md', async () => {
        const { payload, skills, task } = createPayload()
        task.source_url = 'https://skills.sh/acme/demo/demo'
        const result = await executeCrawlTask(payload, 1, createFetcher(markdown, ['SKILL.md']))
        expect(result.skills).toHaveLength(1)
        expect(skills.get(1)?.status).toBe('pending')
    })

    it('Skills.sh 优先使用匹配子目录而不把根文件计为歧义', async () => {
        const { payload, skills, task } = createPayload()
        task.source_url = 'https://skills.sh/acme/demo/demo'
        const result = await executeCrawlTask(payload, 1, createFetcher(markdown, ['SKILL.md', 'demo/SKILL.md']))
        expect(result.skills[0].repository_path).toBe('demo/SKILL.md')
        expect(result.errors).toHaveLength(0)
        expect(skills.size).toBe(1)
    })

    it('Skills.sh 目标子目录不存在时不回退到根文件', async () => {
        const { payload, skills, task } = createPayload()
        task.source_url = 'https://skills.sh/acme/demo/missing'
        const result = await executeCrawlTask(payload, 1, createFetcher(markdown, ['SKILL.md', 'other/SKILL.md']))
        expect(result.errors[0].code).toBe('SKILL_FILE_NOT_FOUND')
        expect(skills.size).toBe(0)
        expect(task.status).toBe('needs_review')
    })

    it('人工指定非标准文件时保留草稿并进入异常审核', async () => {
        const { payload, skills, task } = createPayload()
        task.repository_path = 'README.md'
        const result = await executeCrawlTask(payload, 1, fetcher)
        expect(result.errors[0].code).toBe('NONSTANDARD_SKILL_FILE')
        expect(skills.get(1)?.status).toBe('draft')
        expect(task.status).toBe('needs_review')
    })

    it('Frontmatter 异常保留原始内容并进入异常审核', async () => {
        const { payload, skills, task } = createPayload()
        const result = await executeCrawlTask(payload, 1, createFetcher('# No frontmatter'))
        expect(result.skills[0].action).toBe('created')
        expect(result.errors[0].code).toBe('FRONTMATTER_INVALID')
        expect(skills.get(1)?.status).toBe('draft')
        expect(skills.get(1)?.raw_content).toBe('# No frontmatter')
        expect(task.status).toBe('needs_review')
    })

    it('未找到标准文件时记录可重试异常', async () => {
        const { payload, task } = createPayload()
        const result = await executeCrawlTask(payload, 1, createFetcher(markdown, []))
        expect(result.errors[0]).toMatchObject({ code: 'SKILL_FILE_NOT_FOUND', retryable: true })
        expect(task.status).toBe('needs_review')
    })

    it('GitHub 请求失败时保留失败任务', async () => {
        const { payload, task } = createPayload()
        const failingFetcher = async () => new Response('rate limited', { status: 403 })
        await expect(executeCrawlTask(payload, 1, failingFetcher)).rejects.toThrow(/403/)
        expect(task.status).toBe('failed')
        expect(task).toHaveProperty('error_message')
    })
})
