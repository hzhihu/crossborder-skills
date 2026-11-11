import assert from 'node:assert/strict'

import { getPayload } from 'payload'
import type { PayloadRequest } from 'payload'

import config from '../src/payload.config.ts'
import { getContentHash } from '../src/modules/crawler/parser.ts'
import { publishSkillReview, rejectSkillReview } from '../src/modules/skills/review.ts'

const payload = await getPayload({ config })
const suffix = Date.now().toString()
const ids: { category?: number, first?: number, second?: number, tag?: number } = {}

function getReviewRequest(id: number, expectedHash = '', authenticated = true) {
    return {
        json: async () => ({ expectedHash }), payload, routeParams: { id }, user: authenticated ? { id: 1 } : null,
    } as unknown as PayloadRequest
}

async function archiveVerificationSkill(id: number) {
    const skill = await payload.findByID({ collection: 'skills', id, overrideAccess: true })
    if (skill.status === 'archived') return
    if (skill.status === 'rejected') await payload.update({ collection: 'skills', data: { status: 'draft' }, id, overrideAccess: true })
    if (skill.status === 'draft' || skill.status === 'rejected') {
        await payload.update({ collection: 'skills', data: { status: 'pending' }, id, overrideAccess: true })
    }
    if (skill.status !== 'published') await payload.update({ collection: 'skills', data: { status: 'published' }, id, overrideAccess: true })
    await payload.update({ collection: 'skills', data: { status: 'archived' }, id, overrideAccess: true })
}

try {
    const category = await payload.create({
        collection: 'categories',
        data: { is_active: true, name: `Phase 5 验收分类 ${suffix}`, slug: `phase5-category-${suffix}`, sort_order: 0 },
        overrideAccess: true,
    })
    ids.category = category.id
    const tag = await payload.create({
        collection: 'tags',
        data: { name: `Phase 5 验收标签 ${suffix}`, slug: `phase5-tag-${suffix}`, status: 'active', type: 'business' },
        overrideAccess: true,
    })
    ids.tag = tag.id

    const createVerificationSkill = async (label: string) => {
        const raw = `---\nname: ${label}\ndescription: Verification ${suffix}\n---\n# ${label}\n`
        const skill = await payload.create({
            collection: 'skills',
            data: {
                categories: [category.id], description: `Verification ${suffix}`, is_featured: false, name: label,
                name_zh: `人工审核 ${label}`, raw_content: raw, repository_path: `verification/${suffix}/${label}/SKILL.md`,
                repository_url: 'https://github.com/anthropics/skills', resource_type: 'Skill', slug: `phase5-${label}-${suffix}`,
                source_url: 'https://github.com/anthropics/skills', stars_for_sort: -1, status: 'draft', tags: [tag.id],
            },
            overrideAccess: true,
        })
        await payload.update({ collection: 'skills', data: { status: 'pending' }, id: skill.id, overrideAccess: true })
        return { raw, skill }
    }

    const first = await createVerificationSkill('publish')
    const second = await createVerificationSkill('reject')
    ids.first = first.skill.id
    ids.second = second.skill.id
    assert.equal((await publishSkillReview(getReviewRequest(first.skill.id, first.raw, false))).status, 401)
    assert.equal((await publishSkillReview(getReviewRequest(first.skill.id))).status, 400)

    const publishedResponse = await publishSkillReview(getReviewRequest(first.skill.id, getContentHash(first.raw)))
    assert.equal(publishedResponse.status, 200)
    const published = await publishedResponse.json()
    assert.equal(published.status, 'published')
    assert.ok(published.published_at)
    const publicPublished = await payload.find({ collection: 'skills', overrideAccess: false, where: { id: { equals: first.skill.id } } })
    assert.equal(publicPublished.totalDocs, 1)
    assert.equal(publicPublished.docs[0].raw_content, undefined)

    const rejectedResponse = await rejectSkillReview(getReviewRequest(second.skill.id))
    assert.equal(rejectedResponse.status, 200)
    assert.equal((await rejectedResponse.json()).status, 'rejected')
    const publicRejected = await payload.find({ collection: 'skills', overrideAccess: false, where: { id: { equals: second.skill.id } } })
    assert.equal(publicRejected.totalDocs, 0)
    assert.equal((await publishSkillReview(getReviewRequest(second.skill.id, getContentHash(second.raw)))).status, 409)
    await payload.update({ collection: 'skills', data: { status: 'draft' }, id: second.skill.id, overrideAccess: true })
    await payload.update({ collection: 'skills', data: { status: 'pending' }, id: second.skill.id, overrideAccess: true })
    assert.equal((await publishSkillReview(getReviewRequest(second.skill.id, getContentHash(second.raw)))).status, 200)

    const current = await payload.findByID({ collection: 'skills', id: first.skill.id, overrideAccess: true })
    const latest = await payload.find({ collection: 'skillVersions', limit: 1, overrideAccess: true, sort: '-version', where: { skill_id: { equals: current.id } } })
    const updatedRaw = `---\nname: Updated publish\ndescription: Updated verification ${suffix}\n---\n# Updated\n`
    await payload.create({
        collection: 'skillVersions',
        data: {
            changelog: 'Phase 5 独立待审核更新验收。', content_hash: getContentHash(updatedRaw), raw_content: updatedRaw,
            skill_id: current.id, version: latest.docs[0].version + 1,
        },
        overrideAccess: true,
    })
    assert.equal((await publishSkillReview(getReviewRequest(current.id, getContentHash(first.raw)))).status, 409)
    const beforeReview = await payload.findByID({ collection: 'skills', id: current.id, overrideAccess: true })
    assert.equal(beforeReview.raw_content, current.raw_content)
    assert.equal((await rejectSkillReview(getReviewRequest(current.id))).status, 409)
    const updateResponse = await publishSkillReview(getReviewRequest(current.id, getContentHash(updatedRaw)))
    assert.equal(updateResponse.status, 200)
    const afterReview = await payload.findByID({ collection: 'skills', id: current.id, overrideAccess: true })
    assert.equal(afterReview.raw_content, updatedRaw)
    assert.equal(afterReview.name, 'Updated publish')
    assert.equal(afterReview.description, `Updated verification ${suffix}`)
    assert.equal(afterReview.name_zh, '人工审核 publish')
    const versions = await payload.find({ collection: 'skillVersions', overrideAccess: true, where: { skill_id: { equals: current.id } } })
    assert.equal(versions.totalDocs, 2)
    assert.equal((await publishSkillReview(getReviewRequest(current.id, getContentHash(updatedRaw)))).status, 409)

    console.log(JSON.stringify({
        result: 'passed', publishedSkillID: first.skill.id, rejectedAndRepublishedSkillID: second.skill.id,
        publicBoundary: true, reviewedVersion: versions.totalDocs, chineseContentPreserved: true, isolatedVerificationData: true,
    }))
} finally {
    for (const id of [ids.first, ids.second]) if (id) await archiveVerificationSkill(id)
    if (ids.category) await payload.update({ collection: 'categories', data: { is_active: false }, id: ids.category, overrideAccess: true })
    if (ids.tag) await payload.update({ collection: 'tags', data: { status: 'archived' }, id: ids.tag, overrideAccess: true })
}
process.exit(0)
