import Link from 'next/link'

export function Breadcrumb({ items }: { items: { href?: string, label: string }[] }) {
    return <nav className="breadcrumb" aria-label="面包屑"><Link href="/">首页</Link>{items.map((item) => <span key={item.label}><span aria-hidden="true"> / </span>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>
}
