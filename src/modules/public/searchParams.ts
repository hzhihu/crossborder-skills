export const pageSize = 12
export const sortOptions = ['latest', 'updated', 'stars', 'featured'] as const

export type SortOption = typeof sortOptions[number]
export type SearchParams = Record<string, string | string[] | undefined>

export type PublicQuery = {
    q: string
    category: string
    platforms: string[]
    tools: string[]
    tags: string[]
    sort: SortOption
    page: number
}

function getValues(value: string | string[] | undefined) {
    const values = Array.isArray(value) ? value : value ? [value] : []
    return [...new Set(values.filter(Boolean))]
}

export function parsePublicQuery(params: SearchParams): PublicQuery {
    const sortValue = getValues(params.sort)[0]
    const pageValue = Number(getValues(params.page)[0] || '1')

    return {
        q: getValues(params.q)[0]?.trim() || '',
        category: getValues(params.category)[0] || '',
        platforms: getValues(params.platform),
        tools: getValues(params.tool),
        tags: getValues(params.tag),
        sort: sortOptions.includes(sortValue as SortOption) ? sortValue as SortOption : 'latest',
        page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
    }
}

export function escapeLike(value: string) {
    return value.replace(/[\\%_]/g, '\\$&')
}

export function buildQueryString(query: PublicQuery, page = query.page) {
    const params = new URLSearchParams()
    if (query.q) params.set('q', query.q)
    if (query.category) params.set('category', query.category)
    for (const value of query.platforms) params.append('platform', value)
    for (const value of query.tools) params.append('tool', value)
    for (const value of query.tags) params.append('tag', value)
    if (query.sort !== 'latest') params.set('sort', query.sort)
    if (page > 1) params.set('page', String(page))
    const value = params.toString()
    return value ? `?${value}` : ''
}
