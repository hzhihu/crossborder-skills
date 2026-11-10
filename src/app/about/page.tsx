import type { Metadata } from 'next'

import { PageShell } from '@/components/public/PageShell'
import { getMetadata, JsonLd, siteUrl } from '@/modules/public/metadata'

export const dynamic = 'force-dynamic'

export function generateMetadata(): Metadata {
    return getMetadata('关于 - CrossBorder Skills Hub', '了解 CrossBorder Skills Hub 的产品定位、公开来源、人工审核和推荐边界。', '/about')
}

export default function AboutPage() {
    return <PageShell>
        <h1>关于 CrossBorder Skills Hub</h1>
        <section><h2>产品定位</h2><p>面向跨境电商业务场景的 AI Skills 资源发现、整理和推荐平台。</p></section>
        <section><h2>公开来源</h2><p>资源来自公开 GitHub 和 Skills.sh。平台保留原始来源，方便用户核对。</p></section>
        <section><h2>人工整理与审核</h2><p>平台整理业务说明，资源经管理员审核后公开。AI 只提供建议，不自动发布。</p></section>
        <section><h2>推荐边界</h2><p>推荐不代表质量、适配性或安全保证。使用前应查看原始文档并自行评估。</p></section>
        <JsonLd value={{ '@context': 'https://schema.org', '@type': 'AboutPage', name: '关于 CrossBorder Skills Hub', url: `${siteUrl}/about` }} />
    </PageShell>
}
