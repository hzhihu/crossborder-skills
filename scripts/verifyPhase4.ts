import assert from 'node:assert/strict'

import { getPayload } from 'payload'
import type { PayloadRequest } from 'payload'

import config from '../src/payload.config.ts'
import { executeCrawlTask } from '../src/modules/crawler/execute.ts'
import { recrawlSkill, retryCrawlTask } from '../src/modules/crawler/tasks.ts'

const payload = await getPayload({ config })
const suffix = Date.now().toString()
const repositoryPath = `verification/${suffix}/SKILL.md`
let markdown = `---\nname: Verification ${suffix}\ndescription: Local Payload integration\n---\n# Verification\n`

const category = await payload.create({
    collection: 'categories',
    data: { is_active: true, name: `采集验收 ${suffix}`, slug: `crawl-${suffix}`, sort_order: 0 },
})
const task = await payload.create({
    collection: 'crawlTasks',
    data: {
        category: category.id,
        repository_path: repositoryPath,
        resource_type: 'Skill',
        source_url: 'https://github.com/acme/demo',
        status: 'failed',
        task_type: 'crawl',
    },
    overrideAccess: true,
})

const fetcher = async (input: string | URL | Request) => {
    const url = String(input)
    if (url.includes('/contents/')) {
        return Response.json({ content: Buffer.from(markdown).toString('base64'), encoding: 'base64', size: Buffer.byteLength(markdown) })
    }
    return Response.json({
        default_branch: 'main', forks_count: 0, full_name: 'acme/demo', html_url: 'https://github.com/acme/demo',
        name: 'demo', owner: { login: 'acme' }, private: false, pushed_at: '2026-01-01', stargazers_count: 0, updated_at: '2026-01-01',
    })
}

await executeCrawlTask(payload, task.id, fetcher)
const created = (await payload.find({
    collection: 'skills',
    limit: 1,
    overrideAccess: true,
    where: { repository_path: { equals: repositoryPath } },
})).docs[0]
assert.equal(created.status, 'pending')
assert.equal((await payload.find({ collection: 'skillVersions', where: { skill_id: { equals: created.id } }, overrideAccess: true })).totalDocs, 1)

await executeCrawlTask(payload, task.id, fetcher)
assert.equal((await payload.find({ collection: 'skillVersions', where: { skill_id: { equals: created.id } }, overrideAccess: true })).totalDocs, 1)

await payload.update({ collection: 'skills', id: created.id, data: { status: 'published' }, overrideAccess: true })
markdown += '\nChanged.'
await executeCrawlTask(payload, task.id, fetcher)
const current = await payload.findByID({ collection: 'skills', id: created.id, overrideAccess: true })
assert.equal(current.status, 'published')
assert.equal(current.raw_content?.includes('Changed.'), false)
assert.equal((await payload.find({ collection: 'skillVersions', where: { skill_id: { equals: created.id } }, overrideAccess: true })).totalDocs, 2)
const publicDocs = await payload.find({ collection: 'skills', where: { id: { equals: created.id } }, overrideAccess: false })
assert.equal(publicDocs.totalDocs, 1)
assert.equal(publicDocs.docs[0].raw_content, undefined)

async function runQueuedJob(taskId: number) {
    const jobs = await payload.find({
        collection: 'payload-jobs',
        limit: 1,
        overrideAccess: true,
        sort: '-createdAt',
        where: { taskSlug: { equals: 'crawlSkill' } },
    })
    const job = jobs.docs[0]
    assert.ok(job)
    assert.equal((job.input as { taskId: number }).taskId, taskId)
    globalThis.fetch = fetcher as typeof fetch
    await payload.jobs.runByID({ id: job.id, overrideAccess: true })
    return job.id
}

const queuedTask = await payload.create({
    collection: 'crawlTasks',
    data: {
        category: category.id,
        repository_path: repositoryPath,
        resource_type: 'Skill',
        source_url: 'https://github.com/acme/demo',
        status: 'queued',
        task_type: 'crawl',
    },
    overrideAccess: true,
})
await runQueuedJob(queuedTask.id)
assert.equal((await payload.findByID({ collection: 'crawlTasks', id: queuedTask.id, overrideAccess: true })).status, 'succeeded')

const retryResponse = await retryCrawlTask({ payload, routeParams: { id: task.id }, user: { id: 1 } } as unknown as PayloadRequest)
assert.equal(retryResponse.status, 201)
const retryTask = await retryResponse.json() as { id: number, retry_of: number | { id: number } }
await runQueuedJob(retryTask.id)

const recrawlResponse = await recrawlSkill({ payload, routeParams: { id: created.id }, user: { id: 1 } } as unknown as PayloadRequest)
assert.equal(recrawlResponse.status, 201)
const recrawlTask = await recrawlResponse.json() as { id: number }
await runQueuedJob(recrawlTask.id)
assert.equal((await payload.findByID({ collection: 'crawlTasks', id: recrawlTask.id, overrideAccess: true })).status, 'succeeded')

const raceOriginal = await payload.create({
    collection: 'crawlTasks',
    data: { resource_type: 'Skill', source_url: 'https://github.com/acme/demo', status: 'failed', task_type: 'crawl' },
    overrideAccess: true,
})
const raceResponses = await Promise.all([
    retryCrawlTask({ payload, routeParams: { id: raceOriginal.id }, user: { id: 1 } } as unknown as PayloadRequest),
    retryCrawlTask({ payload, routeParams: { id: raceOriginal.id }, user: { id: 1 } } as unknown as PayloadRequest),
])
assert.deepEqual(raceResponses.map((response) => response.status).sort(), [201, 409])

console.log(JSON.stringify({ result: 'passed', skillID: created.id, taskID: task.id, versions: 2, queueRetryRecrawl: true, concurrentRetry: true }))
process.exit(0)
