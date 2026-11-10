import type { Category, Platform, Skill, Tool } from '@/payload-types'

const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' })
const numberFormat = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 })

export function compareByName<T extends { id: number, name: string }>(a: T, b: T) {
    return collator.compare(a.name, b.name) || a.id - b.id
}

export function getRelationDocs<T extends { id: number, name: string }>(value: unknown): T[] {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is T => typeof item === 'object' && item !== null && 'id' in item && 'name' in item)
}

export function getCardRelations(skill: Skill) {
    const categories = getRelationDocs<Category>(skill.categories).filter((category) => {
        if (!category.is_active) return false
        if (category.parent && typeof category.parent === 'object') return category.parent.is_active
        return true
    }).sort((a, b) => {
        const aLevel = a.parent ? 1 : 0
        const bLevel = b.parent ? 1 : 0
        return aLevel - bLevel || a.sort_order - b.sort_order || compareByName(a, b)
    })
    return {
        categories,
        platforms: getRelationDocs<Platform>(skill.platforms).sort(compareByName),
        tools: getRelationDocs<Tool>(skill.tools).sort(compareByName),
    }
}

export function formatStars(value: number) {
    return numberFormat.format(value)
}

export function formatUpdatedAt(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' })
}
