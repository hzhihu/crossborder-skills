import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/public/Breadcrumb'
import { CopyButton } from '@/components/public/CopyButton'
import { MarkdownRenderer } from '@/components/public/MarkdownRenderer'
import { PageShell } from '@/components/public/PageShell'
import { SkillGrid } from '@/components/public/SkillCard'
import { SkillIcon } from '@/components/public/SkillIcon'
import { getPublicSkill } from '@/modules/public/queries'
import { getRelatedSkills } from '@/modules/public/related'
import { getSkillSeo } from '@/modules/skills/seo'
import { getInstallCommand } from '@/modules/skills/installation'
import { getCardRelations } from '@/modules/public/view'
import { getSafeSourceUrl, normalizeRepositoryUrl } from '@/modules/skills/source'
import { getMetadata, JsonLd, siteUrl } from '@/modules/public/metadata'



export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const skill = await getPublicSkill(slug)
    if (!skill) notFound()
    const seo = getSkillSeo(skill)
    return getMetadata(`${seo.title} - CrossBorder Skills Hub`, seo.description, `/skills/${slug}`)
}

export default async function SkillPage({ params }: Props) {
    const { slug } = await params
    const skill = await getPublicSkill(slug)
    if (!skill) notFound()
    const seo = getSkillSeo(skill)
    const [related, command] = [await getRelatedSkills(skill), getInstallCommand(skill.raw_content, skill.installation_instructions)]
    const repositoryUrl = normalizeRepositoryUrl(skill.repository_url)
    const { categories, platforms, tools } = getCardRelations(skill)
    const sourceUrl = repositoryUrl && skill.repository_path && skill.default_branch
        ? `${repositoryUrl}/blob/${skill.default_branch}/${skill.repository_path}`
        : getSafeSourceUrl(skill.source_url)
    const sections = [
        ['解决的问题', skill.problem_solved], ['适用场景', skill.applicable_scenarios],
        ['主要功能', skill.main_features], ['使用前提', skill.usage_prerequisites],
        ['推荐理由', skill.recommendation_reason],
    ] as const

    return <PageShell>
        <Breadcrumb items={[{ href: '/skills', label: 'Skills' }, { label: skill.name }]} />
        <article>
            <div className="card-title"><SkillIcon url={typeof skill.icon === 'object' && skill.icon !== null ? skill.icon.url : ''} name={skill.name} /><div><h1>{skill.name}</h1>{skill.name_zh?.trim() && skill.name_zh.trim() !== skill.name && <p className="localized-name">{skill.name_zh.trim()}</p>}</div></div><p className="lead">{seo.description}</p>
            {sourceUrl && <p><a href={sourceUrl} target="_blank" rel="nofollow noopener noreferrer">查看原始来源</a></p>}
            <div className="card-relations">{[...new Set([...categories, ...platforms, ...tools].map((item) => item.name))].join(' · ')}</div>
            <dl className="facts">
                {skill.author && <><dt>作者</dt><dd>{skill.author}</dd></>}
                {skill.stars !== null && skill.stars !== undefined && <><dt>Stars</dt><dd>{skill.stars}</dd></>}
                {skill.forks !== null && skill.forks !== undefined && <><dt>Forks</dt><dd>{skill.forks}</dd></>}
                {skill.repository_updated_at && <><dt>仓库更新时间</dt><dd>{new Date(skill.repository_updated_at).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}</dd></>}
                <dt>本站收录时间</dt><dd>{new Date(skill.createdAt).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}</dd>
                {skill.last_verified_at && <><dt>最近验证时间</dt><dd>{new Date(skill.last_verified_at).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}</dd></>}
            </dl>
            {sections.filter(([, content]) => content).map(([title, content]) => <section key={title}><h2>{title}</h2><p>{content}</p></section>)}
            <section><h2>安装说明</h2>{command ? <><pre><code>{command}</code></pre><CopyButton command={command} /></> : <p>请查看原始来源中的安装说明。</p>}</section>
            {skill.content && <section><h2>Skill 说明</h2><MarkdownRenderer content={skill.content} /></section>}
            <JsonLd value={{ '@context': 'https://schema.org', '@type': 'TechArticle', headline: seo.title, description: seo.description, datePublished: skill.published_at || undefined, dateModified: skill.updatedAt, author: skill.author ? { '@type': 'Person', name: skill.author } : undefined, isBasedOn: skill.source_url, mainEntityOfPage: `${siteUrl}/skills/${slug}` }} />
        </article>
        <section><h2>相关推荐</h2>{related.length ? <SkillGrid skills={related} /> : <p className="empty">暂无相关推荐。</p>}</section>
    </PageShell>
}
