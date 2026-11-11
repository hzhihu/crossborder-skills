import assert from 'node:assert/strict'

import { getPayload } from 'payload'

import config from '../src/payload.config.ts'
import { getCategoryCounts, getPublicSkill, querySkills } from '../src/modules/public/queries.ts'
import { parsePublicQuery } from '../src/modules/public/searchParams.ts'

const payload = await getPayload({ config })
const suffix = Date.now().toString()

const parent = await payload.create({
        collection: 'categories',
        data: { name: `验收父分类 ${suffix}`, slug: `parent-${suffix}`, sort_order: 0, is_active: true },
    })
    const child = await payload.create({
        collection: 'categories',
        data: { name: `验收子分类 ${suffix}`, slug: `child-${suffix}`, parent: parent.id, sort_order: 0, is_active: true },
    })
    const emptyCategory = await payload.create({
        collection: 'categories',
        data: { name: `空分类 ${suffix}`, slug: `empty-${suffix}`, sort_order: 0, is_active: true },
    })

    await assert.rejects(
        payload.create({
            collection: 'categories',
            data: { name: '三级分类', slug: `third-${suffix}`, parent: child.id, sort_order: 0, is_active: true },
        }),
        /最多支持一级和二级/,
    )

    const tag = await payload.create({
        collection: 'tags',
        data: { name: `验收标签 ${suffix}`, slug: `tag-${suffix}`, type: 'business', status: 'active' },
    })

    await assert.rejects(
        payload.create({
            collection: 'skills',
            data: {
                name: 'Invalid Direct Publish',
                slug: `invalid-publish-${suffix}`,
                resource_type: 'Skill',
                stars_for_sort: -1,
                is_featured: false,
                status: 'published',
            },
        }),
        /必须从 draft 开始/,
    )

    const skill = await payload.create({
        collection: 'skills',
        data: {
            name: 'Phase 2 Verification Skill',
            slug: `verification-${suffix}`,
            description: 'Real verification data',
            source_url: 'https://github.com/anthropics/skills',
            repository_url: 'https://github.com/anthropics/skills',
            repository_path: `verification/${suffix}/SKILL.md`,
            raw_content: '# Verification\n',
            categories: [child.id],
            tags: [tag.id],
            resource_type: 'Skill',
            stars_for_sort: -1,
            is_featured: false,
            status: 'draft',
        },
    })
    const firstVersions = await payload.find({
        collection: 'skillVersions',
        where: { skill_id: { equals: skill.id } },
    })
    assert.equal(firstVersions.totalDocs, 1)
    assert.equal(firstVersions.docs[0].version, 1)

    await assert.rejects(
        payload.update({ collection: 'skills', id: skill.id, data: { status: 'published' } }),
        /状态流转/,
    )
    await payload.update({ collection: 'skills', id: skill.id, data: { status: 'pending' } })
    const published = await payload.update({
        collection: 'skills',
        id: skill.id,
        data: { status: 'published' },
    })
    assert.ok(published.published_at)

    const publicResult = await payload.find({
        collection: 'skills',
        where: { id: { equals: skill.id } },
        overrideAccess: false,
    })
    assert.equal(publicResult.totalDocs, 1)
    assert.equal(publicResult.docs[0].raw_content, undefined)
    assert.equal(publicResult.docs[0].stars_for_sort, undefined)
    const outOfRange = await querySkills({ ...parsePublicQuery({ category: child.slug, page: '999' }) })
    assert.ok(outOfRange.totalDocs > 0)
    assert.equal(outOfRange.docs.length, 0)

    const parentCounts = await getCategoryCounts([parent, child])
    assert.ok((parentCounts.get(parent.id) || 0) >= 1)
    assert.equal(parentCounts.get(emptyCategory.id) || 0, 0)

    await payload.update({ collection: 'tags', id: tag.id, data: { status: 'archived' } })
    const archivedTagSearch = await querySkills(parsePublicQuery({ q: `验收标签 ${suffix}` }))
    assert.equal(archivedTagSearch.totalDocs, 0)
    await assert.rejects(
        payload.create({
            collection: 'skills',
            data: {
                name: 'Archived Tag Verification',
                slug: `archived-tag-${suffix}`,
                resource_type: 'Skill',
                stars_for_sort: -1,
                is_featured: false,
                status: 'draft',
                tags: [tag.id],
            },
        }),
        /归档标签不能新增关联/,
    )

    await payload.update({ collection: 'categories', id: child.id, data: { is_active: false } })
    const publicDetail = await getPublicSkill(skill.slug)
    assert.equal(publicDetail?.categories?.length || 0, 0)
    await payload.update({ collection: 'categories', id: child.id, data: { is_active: true } })

    await payload.update({
        collection: 'skills',
        id: skill.id,
        data: { raw_content: '# Verification\n\nChanged.\n' },
    })
    const changedVersions = await payload.find({
        collection: 'skillVersions',
        where: { skill_id: { equals: skill.id } },
        sort: 'version',
    })
    assert.equal(changedVersions.totalDocs, 2)
    assert.equal(changedVersions.docs[1].version, 2)
    assert.notEqual(changedVersions.docs[0].content_hash, changedVersions.docs[1].content_hash)

    await payload.update({ collection: 'skills', id: skill.id, data: { status: 'archived' } })
    const hiddenResult = await payload.find({
        collection: 'skills',
        where: { id: { equals: skill.id } },
        overrideAccess: false,
    })
    assert.equal(hiddenResult.totalDocs, 0)
    await payload.update({ collection: 'skills', id: skill.id, data: { status: 'published' } })
    await assert.rejects(payload.delete({ collection: 'skills', id: skill.id }), /不允许硬删除/)

    const collection = await payload.create({
        collection: 'collections',
        data: {
            name: `验收专题 ${suffix}`,
            slug: `verification-${suffix}`,
            status: 'draft',
            sort_order: 0,
            skills: [{ skill: skill.id, sort_order: 1 }],
        },
    })
    const publishedCollection = await payload.update({
        collection: 'collections',
        id: collection.id,
        data: { status: 'published' },
    })
    assert.ok(publishedCollection.published_at)

    const rejectedSkill = await payload.create({
        collection: 'skills',
        data: {
            name: 'Rejected Flow Verification',
            slug: `rejected-${suffix}`,
            description: 'Verification',
            source_url: 'https://github.com/anthropics/skills',
            repository_url: 'https://github.com/anthropics/skills',
            repository_path: `verification/rejected-${suffix}/SKILL.md`,
            raw_content: '# Rejected flow\n',
            categories: [child.id],
            resource_type: 'Skill',
            stars_for_sort: -1,
            is_featured: false,
            status: 'draft',
        },
    })
    await payload.update({ collection: 'skills', id: rejectedSkill.id, data: { status: 'pending' } })
    await payload.update({ collection: 'skills', id: rejectedSkill.id, data: { status: 'rejected' } })
    await payload.update({ collection: 'skills', id: rejectedSkill.id, data: { status: 'draft' } })
    await payload.update({ collection: 'skills', id: rejectedSkill.id, data: { status: 'pending' } })
    const resubmittedSkill = await payload.update({
        collection: 'skills',
        id: rejectedSkill.id,
        data: { status: 'published', stars: 5 },
    })
    assert.equal(resubmittedSkill.status, 'published')
    const starsFirst = await payload.find({
        collection: 'skills',
        sort: '-stars_for_sort,-published_at,-id',
        limit: 1,
        overrideAccess: false,
    })
    assert.equal(starsFirst.docs[0].id, rejectedSkill.id)
    const otherType = await payload.create({
        collection: 'skills',
        data: {
            name: 'Non Skill Verification',
            slug: `agent-${suffix}`,
            description: 'Must stay private',
            source_url: 'https://github.com/anthropics/skills',
            repository_url: 'https://github.com/anthropics/skills',
            repository_path: `verification/agent-${suffix}/SKILL.md`,
            raw_content: '# Private other type',
            categories: [child.id],
            resource_type: 'Agent',
            stars_for_sort: -1,
            is_featured: false,
            status: 'draft',
        },
    })
    await payload.update({ collection: 'skills', id: otherType.id, data: { status: 'pending' } })
    await payload.update({ collection: 'skills', id: otherType.id, data: { status: 'published' } })
    const hiddenOtherType = await payload.find({
        collection: 'skills',
        where: { id: { equals: otherType.id } },
        overrideAccess: false,
    })
    assert.equal(hiddenOtherType.totalDocs, 0)
    await assert.rejects(
        payload.create({
            collection: 'skillVersions',
            data: {
                skill_id: skill.id,
                version: 1.5,
                content_hash: 'invalid',
                raw_content: 'invalid',
            },
        }),
        /Version|版本号必须是整数/,
    )

    const emptyCollection = await payload.create({
        collection: 'collections',
        data: { name: `空专题 ${suffix}`, slug: `empty-${suffix}`, status: 'draft', sort_order: 0 },
    })
    await payload.update({ collection: 'collections', id: emptyCollection.id, data: { status: 'published' } })

    const failedTask = await payload.create({
        collection: 'crawlTasks',
        data: {
            source_url: 'https://skills.sh/anthropics/skills/skill-creator',
            task_type: 'crawl',
            status: 'failed',
            result: { skills: [], errors: [{ code: 'SOURCE_NOT_FOUND', message: 'verification', retryable: true }] },
        },
    })
    const retryTask = await payload.create({
        collection: 'crawlTasks',
        data: {
            source_url: failedTask.source_url,
            task_type: 'crawl',
            status: 'failed',
            retry_of: failedTask.id,
        },
    })
    const retryOfID = typeof retryTask.retry_of === 'object' ? retryTask.retry_of?.id : retryTask.retry_of
    assert.equal(retryOfID, failedTask.id)

    console.log(JSON.stringify({
        result: 'passed',
        skillID: skill.id,
        versions: changedVersions.totalDocs,
        collectionID: collection.id,
        retryOf: retryOfID,
    }))
process.exit(0)
