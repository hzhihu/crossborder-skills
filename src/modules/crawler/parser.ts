import { createHash } from 'node:crypto'

export type ParsedSkill = {
    description: string
    errors: string[]
    name: string
}

function readScalar(value: string) {
    const trimmed = value.trim()
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1)
    }
    return trimmed
}

export function getContentHash(content: string) {
    return createHash('sha256').update(content).digest('hex')
}

export function getSkillSlug(name: string, repositoryUrl: string, repositoryPath: string) {
    const base = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'skill'
    const suffix = createHash('sha1').update(`${repositoryUrl}/${repositoryPath}`).digest('hex').slice(0, 8)
    return `${base}-${suffix}`
}

export function parseSkillMarkdown(content: string, repositoryPath: string): ParsedSkill {
    const fallbackName = repositoryPath.split('/').at(-2) || repositoryPath.split('/').at(-1) || 'Skill'
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
    if (!match) {
        return { description: '', errors: ['缺少有效的 Frontmatter。'], name: fallbackName }
    }

    const values = new Map<string, string>()
    const errors: string[] = []
    let currentKey = ''
    let blockStyle = ''
    for (const line of match[1].split(/\r?\n/)) {
        const field = line.match(/^([A-Za-z_][\w-]*):(?:\s*(.*))$/)
        if (field) {
            currentKey = field[1]
            blockStyle = ['>', '>-', '>+', '|', '|-', '|+'].includes(field[2]) ? field[2][0] : ''
            values.set(currentKey, blockStyle ? '' : readScalar(field[2]))
        } else if (/^\s+\S/.test(line) && currentKey) {
            const currentValue = values.get(currentKey) || ''
            const separator = !currentValue || currentValue.endsWith('\n') ? '' : blockStyle === '|' ? '\n' : ' '
            values.set(currentKey, `${currentValue}${separator}${line.trim()}`)
        } else if (!line.trim() && currentKey && blockStyle && values.get(currentKey)) {
            values.set(currentKey, `${values.get(currentKey)}\n`)
        } else if (line.trim() && !line.trimStart().startsWith('#')) {
            errors.push('Frontmatter 包含无法解析的行。')
        }
    }

    const name = values.get('name')?.trim() || fallbackName
    const description = values.get('description')?.trim() || ''
    if (!values.get('name')?.trim()) errors.push('Frontmatter 缺少 name。')
    if (!description) errors.push('Frontmatter 缺少 description。')
    return { description, errors, name }
}
