import type { Skill } from '@/payload-types'

import { getFilterData, getPublicCollections } from './queries.ts'
import { getPublicPayload } from './payload.ts'

function getIDs(value: unknown) {
    return Array.isArray(value) ? value.map((item) => typeof item === 'object' && item !== null && 'id' in item ? item.id : item) : []
}

export async function getRelatedSkills(current: Skill) {
    const payload = await getPublicPayload()
    const filters = await getFilterData()
    const validCategoryIDs = new Set(filters.categories.map((item) => item.id))
    const validTagIDs = new Set(filters.tags.map((item) => item.id))
    const categories = getIDs(current.categories).filter((id) => validCategoryIDs.has(id as number))
    const platforms = getIDs(current.platforms)
    const tags = getIDs(current.tags).filter((id) => validTagIDs.has(id as number))
    const collections = await getPublicCollections()
    const sharedCollections = collections.docs.filter((collection) => collection.skills?.some((item) => {
        const id = typeof item.skill === 'object' ? item.skill.id : item.skill
        return id === current.id
    }) || [])
    const collectionSkillIDs = sharedCollections.flatMap((collection) => collection.skills?.map((item) => typeof item.skill === 'object' ? item.skill.id : item.skill) || [])
    const result = await payload.find({
        collection: 'skills',
        where: {
            and: [
                { id: { not_equals: current.id } },
                { or: [
                    { categories: { in: categories } },
                    { platforms: { in: platforms } },
                    { tags: { in: tags } },
                    { id: { in: collectionSkillIDs } },
                ] },
            ],
        },
        limit: 1000,
        depth: 2,
        overrideAccess: false,
    })

    return result.docs.map((skill) => {
        const categoryMatch = getIDs(skill.categories).some((id) => categories.includes(id))
        const collectionMatch = collectionSkillIDs.includes(skill.id)
        const platformMatch = getIDs(skill.platforms).some((id) => platforms.includes(id))
        const tagMatch = getIDs(skill.tags).some((id) => tags.includes(id))
        const score = categoryMatch ? 4 : collectionMatch ? 3 : platformMatch ? 2 : tagMatch ? 1 : 0
        return { skill, score }
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score ||
        (b.skill.published_at || '').localeCompare(a.skill.published_at || '') || b.skill.id - a.skill.id)
        .slice(0, 3).map((item) => item.skill)
}
