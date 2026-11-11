import { describe, expect, it } from 'vitest'

import { normalizeRepositoryPath, parseCrawlSource, validateSkillsShPage } from './source.ts'

describe('parseCrawlSource', () => {
    it('解析 GitHub 仓库和 Skills.sh 单资源地址', () => {
        expect(parseCrawlSource('https://github.com/anthropics/skills.git').repositoryUrl).toBe('https://github.com/anthropics/skills')
        expect(parseCrawlSource('https://skills.sh/anthropics/skills/skill-creator')).toEqual({
            repositoryUrl: 'https://github.com/anthropics/skills',
            skillSlug: 'skill-creator',
            sourceUrl: 'https://skills.sh/anthropics/skills/skill-creator',
        })
    })

    it('拒绝目录地址、额外路径和查询参数', () => {
        expect(() => parseCrawlSource('https://skills.sh/anthropics/skills')).toThrow(/单资源/)
        expect(() => parseCrawlSource('https://skills.sh/topics/react/skills')).toThrow(/目录、搜索和榜单/)
        expect(() => parseCrawlSource('https://github.com/anthropics/skills/tree/main')).toThrow(/仓库根地址/)
        expect(() => parseCrawlSource('https://github.com/anthropics/skills?tab=readme')).toThrow(/查询参数/)
        expect(() => parseCrawlSource('http://github.com/anthropics/skills')).toThrow(/只支持 HTTPS/)
        expect(() => parseCrawlSource('https://example.com/anthropics/skills')).toThrow(/只支持 HTTPS/)
    })
})

describe('validateSkillsShPage', () => {
    it('确认单资源 canonical 和对应 GitHub 链接', async () => {
        const source = parseCrawlSource('https://skills.sh/anthropics/skills/skill-creator')
        const html = '<link rel="canonical" href="https://www.skills.sh/anthropics/skills/skill-creator"><a href="https://github.com/anthropics/skills" title="anthropics/skills">repo</a>'
        await expect(validateSkillsShPage(source, async () => new Response(html))).resolves.toBeUndefined()
    })

    it('拒绝 canonical 不匹配的主题或目录页', async () => {
        const source = parseCrawlSource('https://skills.sh/anthropics/skills/skill-creator')
        const html = '<link rel="canonical" href="https://www.skills.sh/topics/react"><a href="https://github.com/anthropics/skills" title="anthropics/skills">repo</a>'
        await expect(validateSkillsShPage(source, async () => new Response(html))).rejects.toThrow(/不是单个资源/)
    })
})

describe('normalizeRepositoryPath', () => {
    it('保留安全的相对路径并拒绝上级目录', () => {
        expect(normalizeRepositoryPath('/skills/demo/')).toBe('skills/demo')
        expect(normalizeRepositoryPath('')).toBe('')
        expect(normalizeRepositoryPath(undefined)).toBe('')
        expect(() => normalizeRepositoryPath('../secret')).toThrow(/上级目录/)
        expect(() => normalizeRepositoryPath('demo\\secret')).toThrow(/相对路径/)
    })
})
