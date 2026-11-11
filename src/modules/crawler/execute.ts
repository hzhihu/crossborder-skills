import type { Payload } from 'payload'

import type { Skill } from '../../payload-types.ts'
import { findSkillFiles, getRepository, readSkillFile } from './github.ts'
import { getContentHash, getSkillSlug, parseSkillMarkdown } from './parser.ts'
import { normalizeRepositoryPath, parseCrawlSource, validateSkillsShPage } from './source.ts'

type ResultEntry = {
    action: 'created' | 'unchanged' | 'updated'
    id: number
    name: string
    repository_path: string
    version?: number
}

type ResultError = {
    code: string
    message: string
    repository_path?: string
    retryable: boolean
}

function getRelationshipID(value: unknown) {
    return typeof value === 'object' && value !== null && 'id' in value ? Number(value.id) : Number(value)
}

function getMetadata(repository: Awaited<ReturnType<typeof getRepository>>, now: string) {
    return {
        author: repository.owner,
        default_branch: repository.defaultBranch,
        forks: repository.forks,
        last_verified_at: now,
        owner: repository.owner,
        repository_full_name: repository.fullName,
        repository_name: repository.name,
        repository_pushed_at: repository.pushedAt,
        repository_updated_at: repository.updatedAt,
        repository_url: repository.url,
        stars: repository.stars,
    }
}

export async function executeCrawlTask(payload: Payload, taskId: number, fetcher: typeof fetch = fetch) {
    const task = await payload.findByID({ collection: 'crawlTasks', id: taskId, overrideAccess: true })
    if (task.task_type !== 'crawl' || task.resource_type !== 'Skill') throw new Error('自动采集只支持 Skill。')
    const startedAt = new Date().toISOString()
    await payload.update({ collection: 'crawlTasks', id: taskId, data: { started_at: startedAt, status: 'running' }, overrideAccess: true })
    const skills: ResultEntry[] = []
    const errors: ResultError[] = []

    try {
        const source = parseCrawlSource(task.source_url)
        await validateSkillsShPage(source, fetcher)
        const repositoryPath = normalizeRepositoryPath(task.repository_path)
        const repository = await getRepository(source.repositoryUrl, fetcher)
        let paths = await findSkillFiles(repository, repositoryPath, fetcher)
        if (source.skillSlug) {
            const directoryMatches = paths.filter((path) => path !== 'SKILL.md' && path.split('/').at(-2) === source.skillSlug)
            paths = directoryMatches.length ? directoryMatches : paths.length === 1 && paths[0] === 'SKILL.md' ? paths : []
            if (paths.length > 1) {
                errors.push({ code: 'SKILL_SOURCE_AMBIGUOUS', message: '来源匹配到多个同名 Skill，请指定唯一文件路径。', retryable: true })
                paths = []
            }
        }
        if (!paths.length && !errors.length) {
            errors.push({
                code: 'SKILL_FILE_NOT_FOUND',
                message: '未找到匹配的 SKILL.md，请指定正确的子目录或文件路径。',
                repository_path: repositoryPath || undefined,
                retryable: true,
            })
        }

        let hasPendingUpdate = false
        for (const path of paths) {
            try {
                const file = await readSkillFile(repository, path, fetcher)
                const parsed = parseSkillMarkdown(file.content, path)
                const contentHash = getContentHash(file.content)
                const existing = await payload.find({
                    collection: 'skills',
                    limit: 1,
                    overrideAccess: true,
                    where: { and: [{ repository_url: { equals: repository.url } }, { repository_path: { equals: path } }] },
                })
                const current = existing.docs[0]
                const latest = current ? await payload.find({
                    collection: 'skillVersions',
                    limit: 1,
                    overrideAccess: true,
                    sort: '-version',
                    where: { skill_id: { equals: current.id } },
                }) : null
                const latestVersion = latest?.docs[0]

                if (current && latestVersion?.content_hash === contentHash) {
                    await payload.update({
                        collection: 'skills',
                        data: { ...getMetadata(repository, new Date().toISOString()), source_url: source.sourceUrl },
                        id: current.id,
                        overrideAccess: true,
                    })
                    skills.push({ action: 'unchanged', id: current.id, name: current.name, repository_path: path })
                    continue
                }

                if (current && ['archived', 'published'].includes(current.status)) {
                    const version = await payload.create({
                        collection: 'skillVersions',
                        data: {
                            changelog: '采集发现内容变化，等待管理员审核。',
                            content_hash: contentHash,
                            raw_content: file.content,
                            skill_id: current.id,
                            version: (latestVersion?.version || 0) + 1,
                        },
                        overrideAccess: true,
                    })
                    hasPendingUpdate = true
                    skills.push({ action: 'updated', id: current.id, name: current.name, repository_path: path, version: version.version })
                } else {
                    const baseData = {
                        ...getMetadata(repository, new Date().toISOString()),
                        description: parsed.description,
                        name: parsed.name,
                        raw_content: file.content,
                        repository_path: path,
                        resource_type: 'Skill' as const,
                        source_url: source.sourceUrl,
                    }
                    let saved: Skill
                    let version: number | undefined
                    if (current) {
                        saved = await payload.update({
                            collection: 'skills',
                            data: { ...baseData, status: current.status === 'rejected' ? 'draft' : current.status },
                            id: current.id,
                            overrideAccess: true,
                        })
                        version = (latestVersion?.version || 0) + 1
                    } else {
                        saved = await payload.create({
                            collection: 'skills',
                            data: {
                                ...baseData,
                                categories: task.category ? [getRelationshipID(task.category)] : [],
                                is_featured: false,
                                slug: getSkillSlug(parsed.name, repository.url, path),
                                stars_for_sort: repository.stars,
                                status: 'draft',
                            },
                            overrideAccess: true,
                        })
                        version = 1
                    }
                    if (!parsed.errors.length && saved.status === 'draft' && path.split('/').at(-1) === 'SKILL.md') {
                        saved = await payload.update({ collection: 'skills', data: { status: 'pending' }, id: saved.id, overrideAccess: true })
                    }
                    skills.push({ action: current ? 'updated' : 'created', id: saved.id, name: saved.name, repository_path: path, version })
                }

                if (path.split('/').at(-1) !== 'SKILL.md') {
                    errors.push({ code: 'NONSTANDARD_SKILL_FILE', message: '人工指定了非标准 SKILL.md 文件，请审核名称、内容和来源。', repository_path: path, retryable: false })
                }
                for (const message of parsed.errors) {
                    errors.push({ code: 'FRONTMATTER_INVALID', message, repository_path: path, retryable: false })
                }
            } catch (error) {
                errors.push({
                    code: 'FILE_READ_FAILED',
                    message: error instanceof Error ? error.message : '文件读取失败。',
                    repository_path: path,
                    retryable: true,
                })
            }
        }

        const status = errors.length || hasPendingUpdate ? 'needs_review' : 'succeeded'
        const result = { errors, skills }
        await payload.update({
            collection: 'crawlTasks',
            data: { completed_at: new Date().toISOString(), result, skill: skills[0]?.id, status },
            id: taskId,
            overrideAccess: true,
        })
        return result
    } catch (error) {
        const message = error instanceof Error ? error.message : '采集任务执行失败。'
        errors.push({ code: 'CRAWL_FAILED', message, retryable: true })
        await payload.update({
            collection: 'crawlTasks',
            data: { completed_at: new Date().toISOString(), error_message: message, result: { errors, skills }, status: 'failed' },
            id: taskId,
            overrideAccess: true,
        })
        throw error
    }
}
