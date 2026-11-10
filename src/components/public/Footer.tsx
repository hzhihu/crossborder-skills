import Link from 'next/link'

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="container footer-inner">
                <nav aria-label="页脚导航">
                    <Link href="/skills">Skills</Link>
                    <Link href="/categories">分类</Link>
                    <Link href="/collections">专题</Link>
                    <Link href="/about">关于</Link>
                </nav>
                <p>Skill 资源来源于公开 GitHub 和 Skills.sh，公开内容经平台人工整理与审核；平台推荐不代表质量或安全保证。</p>
            </div>
        </footer>
    )
}
