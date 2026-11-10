import { cache } from 'react'

import type { Category, Collection, Platform, Skill, Tag, Tool } from '@/payload-types'
import type { Where } from 'payload'

import { getPublicPayload } from './payload.ts'
import { escapeLike, pageSize, type PublicQuery } from './searchParams.ts'
import { getCardRelations } from './view.ts'

const sortMap = {
    latest: '-published_at,-id',
    updated: '-updated_at,-id',
    stars: '-stars_for_sort,-published_at,-id',
    featured: '-is_featured,-published_at,-id',
}

export function isPublicCategory(category: Category, categories: Category[]) {
    if (!category.is_active) return false
    if (!category.parent) return true
    const parentID = typeof category.parent === 'object' ? category.parent.id : category.parent
    return categories.some((item) => item.id === parentID && item.is_active)
}

export const getFilterData = cache(async () => {
    const payload = await getPublicPayload()
    const [categories, platforms, tools, tags, publicSkills] = await Promise.all([
        payload.find({ collection: 'categories', limit: 1000, sort: 'sort_order', overrideAccess: false }),
        payload.find({ collection: 'platforms', limit: 1000, sort: 'name', overrideAccess: false }),
        payload.find({ collection: 'tools', limit: 1000, sort: 'name', overrideAccess: false }),
        payload.find({ collection: 'tags', limit: 1000, sort: 'name', overrideAccess: false }),
        payload.find({ collection: 'skills', where: { resource_type: { equals: 'Skill' } }, limit: 0, depth: 0, overrideAccess: false }),
    ])
    const publicCategories = categories.docs.filter((item) => isPublicCategory(item, categories.docs))
    const usedTagIDs = new Set(publicSkills.docs.flatMap((skill) => skill.tags || []).map((tag) => typeof tag === 'object' ? tag.id : tag))
    return { categories: publicCategories, platforms: platforms.docs, tools: tools.docs, tags: tags.docs.filter((tag) => usedTagIDs.has(tag.id)) }
})

export async function querySkills(query: PublicQuery, categorySlug = '', existingFilters?: Awaited<ReturnType<typeof getFilterData>>) {
    const payload = await getPublicPayload()
    const filters = existingFilters ?? await getFilterData()
    const and: Where[] = []
    const invalid: string[] = []
    const selectedCategory = categorySlug || query.category
    if (query.q) {
        const keyword = escapeLike(query.q)
        const matchingTags = await payload.find({
            collection: 'tags',
            where: {
                and: [
                    { name: { like: keyword } },
                    { status: { equals: 'active' } },
                ],
            },
            limit: 0,
            depth: 0,
            overrideAccess: false,
        })
        and.push({ or: [
            { name: { like: keyword } },
            { name_zh: { like: keyword } },
            { description: { like: keyword } },
            { description_zh: { like: keyword } },
            ...(matchingTags.docs.length ? [{ tags: { in: matchingTags.docs.map((tag) => tag.id) } }] : []),
        ] })
    }
    if (selectedCategory) {
        const selected = filters.categories.find((item) => item.slug === selectedCategory)
        if (selected) {
            const ids = filters.categories.filter((item) => {
                if (item.id === selected.id) return true
                const parentID = item.parent && typeof item.parent === 'object' ? item.parent.id : item.parent
                return parentID === selected.id
            }).map((item) => item.id)
            and.push({ categories: { in: ids } })
        } else {
            invalid.push('category')
        }
    }
    const applyFilter = (values: string[], items: (Platform | Tool | Tag)[], field: string, key: string) => {
        if (!values.length) return
        const ids = items.filter((item) => values.includes(item.slug)).map((item) => item.id)
        if (ids.length !== values.length) invalid.push(key)
        if (ids.length) and.push({ [field]: { in: ids } })
    }
    applyFilter(query.platforms, filters.platforms, 'platforms', 'platform')
    applyFilter(query.tools, filters.tools, 'tools', 'tool')
    applyFilter(query.tags, filters.tags, 'tags', 'tag')

    const result = await payload.find({
        collection: 'skills',
        where: and.length ? { and } : undefined,
        sort: sortMap[query.sort],
        limit: pageSize,
        page: query.page,
        depth: 2,
        overrideAccess: false,
    })
    if (query.page > 1 && result.docs.length === 0) {
        const total = await payload.count({ collection: 'skills', where: and.length ? { and } : undefined, overrideAccess: false })
        return { ...result, totalDocs: total.totalDocs, totalPages: Math.max(1, Math.ceil(total.totalDocs / pageSize)), filters, invalid }
    }
    return { ...result, filters, invalid }
}

export async function getCategoryCounts(categories: Category[]) {
    const payload = await getPublicPayload()
    const skills = await payload.find({
        collection: 'skills',
        where: { resource_type: { equals: 'Skill' } },
        limit: 0,
        depth: 0,
        overrideAccess: false,
    })
    return new Map(categories.map((category) => {
        const ids = categories.filter((item) => {
            if (item.id === category.id) return true
            const parentID = item.parent && typeof item.parent === 'object' ? item.parent.id : item.parent
            return parentID === category.id
        }).map((item) => item.id)
        const count = skills.docs.filter((skill) => (skill.categories || []).some((relation) => {
            const id = typeof relation === 'object' ? relation.id : relation
            return ids.includes(id)
        })).length
        return [category.id, count]
    }))
}

export const getPublicSkill = cache(async (slug: string) => {
    const payload = await getPublicPayload()
    const result = await payload.find({
        collection: 'skills',
        where: {
            and: [
                { slug: { equals: slug } },
                { status: { equals: 'published' } },
                { resource_type: { equals: 'Skill' } },
            ],
        },
        limit: 1,
        depth: 2,
        overrideAccess: false,
    })
    const skill = result.docs[0] as Skill | undefined
    if (!skill) return undefined

    const source = await payload.findByID({
        collection: 'skills',
        id: skill.id,
        select: { raw_content: true },
        overrideAccess: true,
    })
    const filters = await getFilterData()
    const activeTagIDs = new Set(filters.tags.map((tag) => tag.id))
    // 安装命令只在服务端读取，公开关系字段按统一视图规则再次过滤。
    return {
        ...skill,
        categories: getCardRelations(skill).categories,
        tags: skill.tags?.filter((tag) => activeTagIDs.has(typeof tag === 'object' ? tag.id : tag)),
        raw_content: source.raw_content,
    }
})

export const getPublicCollections = cache(async () => {
    const payload = await getPublicPayload()
    return payload.find({ collection: 'collections', sort: 'sort_order', limit: 1000, depth: 1, overrideAccess: false })
})

export const getPublicCollection = cache(async (slug: string) => {
    const payload = await getPublicPayload()
    const result = await payload.find({
        collection: 'collections', where: { slug: { equals: slug } }, limit: 1, depth: 2, overrideAccess: false,
    })
    return result.docs[0] as Collection | undefined
})
