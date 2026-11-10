import { describe, expect, it } from 'vitest'

import { getSkillSeo } from './seo'

describe('getSkillSeo', () => {
    it('prefers real Chinese fields', () => {
        expect(getSkillSeo({
            name: 'Original',
            name_zh: '中文名称',
            description: 'Original description',
            description_zh: '中文简介',
        })).toEqual({ title: '中文名称', description: '中文简介' })
    })

    it('falls back to real English fields without inventing translations', () => {
        expect(getSkillSeo({ name: 'Original', description: 'Description' })).toEqual({
            title: 'Original',
            description: 'Description',
        })
    })

    it('falls back when localized fields contain only whitespace', () => {
        expect(getSkillSeo({ name: 'Original', name_zh: '  ', description: 'Description', description_zh: '  ' })).toEqual({
            title: 'Original',
            description: 'Description',
        })
    })

    it('keeps missing fields empty', () => {
        expect(getSkillSeo({})).toEqual({ title: '', description: '' })
    })
})
