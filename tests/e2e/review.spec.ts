import { createHash } from 'node:crypto'

import { expect, test } from '@playwright/test'

const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL
const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD

test('admin can publish, reject, resubmit and review an update', async ({ page, request }) => {
    test.skip(!adminEmail || !adminPassword, '需要管理员验收账号')
    test.setTimeout(90000)
    const suffix = Date.now().toString()
    const ids: { category?: number, empty?: number, first?: number, second?: number, tag?: number } = {}

    try {
        const anonymous = await request.post('/api/skills/1/publish', { data: { expectedHash: 'invalid' } })
        expect(anonymous.status()).toBe(401)

        await page.goto('/admin/login')
        await page.locator('input[name="email"]').fill(adminEmail!)
        await page.locator('input[name="password"]').fill(adminPassword!)
        await Promise.all([
            page.waitForURL((url) => url.pathname === '/admin'),
            page.locator('button[type="submit"]').click(),
        ])

        const categoryResponse = await page.request.post('/api/categories', {
            data: { is_active: true, name: `E2E 审核分类 ${suffix}`, slug: `e2e-review-category-${suffix}`, sort_order: 0 },
        })
        expect(categoryResponse.ok()).toBe(true)
        ids.category = (await categoryResponse.json()).doc.id
        const tagResponse = await page.request.post('/api/tags', {
            data: { name: `E2E 审核标签 ${suffix}`, slug: `e2e-review-tag-${suffix}`, status: 'active', type: 'business' },
        })
        expect(tagResponse.ok()).toBe(true)
        ids.tag = (await tagResponse.json()).doc.id

        const createSkill = async (label: string) => {
            const raw = `---\nname: ${label}\ndescription: E2E ${suffix}\n---\n# ${label}\n`
            const response = await page.request.post('/api/skills', {
                data: {
                    categories: [ids.category], description: `E2E ${suffix}`, name: label, name_zh: `E2E 人工 ${label}`,
                    raw_content: raw, repository_path: `e2e/${suffix}/${label}/SKILL.md`, repository_url: 'https://github.com/anthropics/skills',
                    resource_type: 'Skill', slug: `e2e-review-${label}-${suffix}`, source_url: 'https://github.com/anthropics/skills', status: 'draft', tags: [ids.tag],
                },
            })
            expect(response.ok()).toBe(true)
            const skill = (await response.json()).doc
            const pending = await page.request.patch(`/api/skills/${skill.id}`, { data: { status: 'pending' } })
            expect(pending.ok()).toBe(true)
            return { raw, skill }
        }
        const first = await createSkill('publish')
        const second = await createSkill('reject')
        ids.first = first.skill.id
        ids.second = second.skill.id
        const emptyResponse = await page.request.post('/api/skills', {
            data: {
                categories: [ids.category], description: `E2E empty ${suffix}`, name: 'empty', name_zh: 'E2E 人工 empty',
                repository_path: `e2e/${suffix}/empty/SKILL.md`, repository_url: 'https://github.com/anthropics/skills',
                resource_type: 'Skill', slug: `e2e-review-empty-${suffix}`, source_url: 'https://github.com/anthropics/skills', status: 'draft', tags: [ids.tag],
            },
        })
        expect(emptyResponse.ok()).toBe(true)
        ids.empty = (await emptyResponse.json()).doc.id
        expect((await page.request.patch(`/api/skills/${ids.empty}`, { data: { status: 'pending' } })).ok()).toBe(true)

        await page.goto('/admin/review')
        const emptyReview = page.locator('section').filter({ hasText: 'E2E 人工 empty' })
        await expect(emptyReview.getByText('缺少可审核的原始内容，请重新采集或补充后再审核。', { exact: true })).toBeVisible()
        await expect(emptyReview.getByRole('button', { name: '暂不可发布', exact: true })).toBeDisabled()

        await page.goto('/admin/review?pendingPage=999')
        await expect(page.getByRole('heading', { name: /待审核 Skill（[1-9]\d*）/ })).toBeVisible()
        await expect(page.locator('section').filter({ hasText: 'E2E 人工 publish' })).toBeVisible()
        await page.goto('/admin/review')
        const firstReview = page.locator('section').filter({ hasText: `E2E 人工 publish` })
        page.once('dialog', (dialog) => dialog.accept())
        await firstReview.getByRole('button', { name: '审核并发布', exact: true }).click()
        await page.getByText('Skill 已发布。', { exact: true }).waitFor()
        expect((await page.request.get(`/skills/${first.skill.slug}`)).status()).toBe(200)

        await page.goto('/admin/review')
        const secondReview = page.locator('section').filter({ hasText: `E2E 人工 reject` })
        page.once('dialog', (dialog) => dialog.accept())
        await secondReview.getByRole('button', { name: '驳回', exact: true }).click()
        await page.getByText('Skill 已驳回。', { exact: true }).waitFor()
        expect((await page.request.get(`/skills/${second.skill.slug}`)).status()).toBe(404)
        expect((await page.request.patch(`/api/skills/${ids.second}`, { data: { status: 'draft' } })).ok()).toBe(true)
        expect((await page.request.patch(`/api/skills/${ids.second}`, { data: { status: 'pending' } })).ok()).toBe(true)
        await page.goto('/admin/review')
        const resubmitted = page.locator('section').filter({ hasText: `E2E 人工 reject` })
        page.once('dialog', (dialog) => dialog.accept())
        await resubmitted.getByRole('button', { name: '审核并发布', exact: true }).click()
        await page.getByText('Skill 已发布。', { exact: true }).waitFor()

        const updatedRaw = `---\nname: Updated E2E\ndescription: Updated E2E ${suffix}\n---\n# Updated\n`
        const versionResponse = await page.request.post('/api/skillVersions', {
            data: {
                changelog: 'E2E 待审核更新', content_hash: createHash('sha256').update(updatedRaw).digest('hex'),
                raw_content: updatedRaw, skill_id: ids.first, version: 2,
            },
        })
        expect(versionResponse.ok()).toBe(true)
        await page.goto('/admin/review')
        const updateReview = page.locator('section').filter({ hasText: 'E2E 人工 publish' })
        await expect(updateReview.getByText('待审核解析名称：Updated E2E', { exact: true })).toBeVisible()
        await expect(updateReview.getByText(`解析简介：Updated E2E ${suffix}`, { exact: true })).toBeVisible()
        page.once('dialog', (dialog) => dialog.accept())
        await updateReview.getByRole('button', { name: '审核并发布更新', exact: true }).click()
        await page.getByText('Skill 已发布。', { exact: true }).waitFor()
        const updated = await (await page.request.get(`/api/skills/${ids.first}`)).json()
        expect(updated.name).toBe('Updated E2E')
        expect(updated.description).toBe(`Updated E2E ${suffix}`)
        expect(updated.name_zh).toBe('E2E 人工 publish')
    } finally {
        for (const id of [ids.first, ids.second, ids.empty]) {
            if (!id) continue
            const response = await page.request.get(`/api/skills/${id}`)
            expect(response.ok()).toBe(true)
            const skill = await response.json()
            if (!skill.raw_content) {
                const raw = `---\nname: Cleanup\ndescription: Cleanup ${suffix}\n---\n# Cleanup\n`
                expect((await page.request.patch(`/api/skills/${id}`, { data: { raw_content: raw } })).ok()).toBe(true)
            }
            if (skill.status === 'rejected') {
                expect((await page.request.patch(`/api/skills/${id}`, { data: { status: 'draft' } })).ok()).toBe(true)
                skill.status = 'draft'
            }
            if (skill.status === 'draft') {
                expect((await page.request.patch(`/api/skills/${id}`, { data: { status: 'pending' } })).ok()).toBe(true)
                skill.status = 'pending'
            }
            if (skill.status === 'pending') {
                expect((await page.request.patch(`/api/skills/${id}`, { data: { status: 'published' } })).ok()).toBe(true)
                skill.status = 'published'
            }
            if (skill.status === 'published') {
                expect((await page.request.patch(`/api/skills/${id}`, { data: { status: 'archived' } })).ok()).toBe(true)
            }
        }
        if (ids.category) expect((await page.request.patch(`/api/categories/${ids.category}`, { data: { is_active: false } })).ok()).toBe(true)
        if (ids.tag) expect((await page.request.patch(`/api/tags/${ids.tag}`, { data: { status: 'archived' } })).ok()).toBe(true)
    }
})
