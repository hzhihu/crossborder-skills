import Link from 'next/link'

import type { Skill } from '@/payload-types'
import { getSkillSeo } from '@/modules/skills/seo'
import { getSafeSourceUrl, normalizeRepositoryUrl } from '@/modules/skills/source'
import { formatStars, formatUpdatedAt, getCardRelations } from '@/modules/public/view'
import { SkillIcon } from './SkillIcon'

function RelationValues({ values, label }: { values: { id: number, name: string }[], label: string }) {
    if (!values.length) return null
    const names = values.map((item) => item.name)
    return <span className="relation-values">
        <span aria-hidden={values.length > 2}>{names.slice(0, 2).join('、')}{values.length > 2 && ` +${values.length - 2}`}</span>
        {values.length > 2 && <span className="sr-only">{label}：{names.join('、')}</span>}
    </span>
}

export function SkillCard({ skill }: { skill: Skill }) {
    const seo = getSkillSeo(skill)
    const { categories, platforms, tools } = getCardRelations(skill)
    const sourceUrl = getSafeSourceUrl(skill.source_url) || normalizeRepositoryUrl(skill.repository_url)
    const iconUrl = typeof skill.icon === 'object' && skill.icon !== null ? skill.icon.url : ''
    const updatedAt = skill.updatedAt ? formatUpdatedAt(skill.updatedAt) : ''

    return (
        <article className="card">
            <div className="card-meta"><RelationValues values={categories} label="全部分类" />{skill.is_featured && <span className="badge">管理员精选</span>}</div>
            <div className="card-title"><SkillIcon url={iconUrl} name={skill.name} /><div><h3>{skill.name}</h3>{skill.name_zh?.trim() && skill.name_zh.trim() !== skill.name && <p className="localized-name">{skill.name_zh.trim()}</p>}</div></div>
            {seo.description && <p className="card-description">{seo.description}</p>}
            <div className="card-relations"><RelationValues values={platforms} label="全部适用平台" /><RelationValues values={tools} label="全部适用工具" /></div>
            <div className="card-source-meta">
                {skill.stars !== null && skill.stars !== undefined && <span aria-label={`GitHub Stars：${skill.stars}`}>GitHub Stars {formatStars(skill.stars)}</span>}
                {updatedAt && <time dateTime={skill.updatedAt}>更新于 {updatedAt}</time>}
            </div>
            <div className="card-footer">
                <Link href={`/skills/${skill.slug}`} aria-label={`查看详情：${skill.name}`}>查看详情</Link>
                {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`GitHub 原文：${skill.name}（在新窗口打开）`}>GitHub 原文<span className="sr-only">（新窗口打开）</span></a>}
            </div>
        </article>
    )
}

export function SkillGrid({ skills, empty = '暂无公开 Skill。' }: { skills: Skill[], empty?: string }) {
    if (!skills.length) return <p className="empty">{empty}</p>
    return <div className="skill-grid">{skills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}</div>
}
