import Link from 'next/link'

import { PageShell } from '@/components/public/PageShell'

export default function NotFound() {
    return <PageShell><h1>页面不存在</h1><p>没有找到对应的公开页面或资源。</p><div className="actions"><Link className="button" href="/">返回首页</Link><Link className="button secondary" href="/skills">浏览 Skill</Link></div></PageShell>
}
