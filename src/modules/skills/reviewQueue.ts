import { getContentHash } from '../crawler/parser.ts'

export function getPendingUpdatePage(skills: { id: number, raw_content?: string | null }[], latestHashes: Map<number, string>, requestedPage: number, pageSize: number) {
    const ids = skills.filter((skill) => {
        const latestHash = latestHashes.get(skill.id)
        return latestHash && latestHash !== getContentHash(skill.raw_content || '')
    }).map((skill) => skill.id)
    const totalPages = Math.ceil(ids.length / pageSize)
    const page = Math.min(requestedPage, Math.max(totalPages, 1))
    return {
        ids,
        page,
        pageIDs: ids.slice((page - 1) * pageSize, page * pageSize),
        totalPages,
    }
}
