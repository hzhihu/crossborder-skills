'use client'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
    return <main className="container page-content"><h1>内容暂时无法加载</h1><p>请稍后重试，当前搜索和浏览地址已保留。</p><button className="button" type="button" onClick={reset}>重新加载</button></main>
}
