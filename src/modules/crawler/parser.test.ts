import { describe, expect, it } from 'vitest'

import { getContentHash, getSkillSlug, parseSkillMarkdown } from './parser.ts'

describe('parseSkillMarkdown', () => {
    it('读取名称和多行简介', () => {
        expect(parseSkillMarkdown('---\nname: demo\ndescription: >\n  第一行\n  第二行\n---\n# Demo', 'demo/SKILL.md')).toEqual({
            description: '第一行 第二行',
            errors: [],
            name: 'demo',
        })
    })

    it('支持带 chomping 标记的块标量', () => {
        expect(parseSkillMarkdown('---\nname: demo\ndescription: >-\n  第一行\n  第二行\n---\n', 'demo/SKILL.md').description).toBe('第一行 第二行')
        expect(parseSkillMarkdown('---\nname: demo\ndescription: |-\n  第一行\n---\n', 'demo/SKILL.md').description).toBe('第一行')
        expect(parseSkillMarkdown('---\nname: demo\ndescription: |\n  第一行\n  第二行\n---\n', 'demo/SKILL.md').description).toBe('第一行\n第二行')
        expect(parseSkillMarkdown('---\n# comment\nname: demo\ndescription: >\n  第一段\n\n  第二段\n---\n', 'demo/SKILL.md')).toMatchObject({ description: '第一段\n第二段', errors: [] })
    })

    it('Frontmatter 异常时保留可用名称并返回审核错误', () => {
        expect(parseSkillMarkdown('# Demo', 'demo/SKILL.md').errors).toContain('缺少有效的 Frontmatter。')
        expect(parseSkillMarkdown('---\ndescription: Demo\n---\n', 'demo/SKILL.md')).toMatchObject({ name: 'demo' })
        expect(parseSkillMarkdown('---\nname: "demo"\ndescription: \'Demo\'\n---\n', 'SKILL.md')).toMatchObject({ name: 'demo', description: 'Demo' })
        expect(parseSkillMarkdown('---\nname: demo\ndescription: Demo\ninvalid\n---\n', 'demo/SKILL.md').errors).toContain('Frontmatter 包含无法解析的行。')
    })
})

describe('content identity', () => {
    it('Hash 和 slug 对相同来源保持稳定', () => {
        expect(getContentHash('demo')).toBe(getContentHash('demo'))
        expect(getSkillSlug('Demo Skill', 'https://github.com/a/b', 'demo/SKILL.md')).toBe(getSkillSlug('Demo Skill', 'https://github.com/a/b', 'demo/SKILL.md'))
    })
})
