'use client'

import { useRef, useState } from 'react'

import type { PublicQuery } from '@/modules/public/searchParams'

export function SearchBox({ initialQuery = '', large = false, action = '/search', query }: { initialQuery?: string, large?: boolean, action?: string, query?: PublicQuery }) {
    const [keyword, setKeyword] = useState(initialQuery)
    const [error, setError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <form action={action} method="get" className={large ? 'search-form large' : 'search-form'} onSubmit={(event) => {
            if (!keyword.trim()) {
                event.preventDefault()
                setError('请输入 Skill 名称、简介或标签关键词。')
                inputRef.current?.focus()
            }
        }}>
            {query?.category && <input type="hidden" name="category" value={query.category} />}
            {query?.platforms.map((value) => <input key={`platform-${value}`} type="hidden" name="platform" value={value} />)}
            {query?.tools.map((value) => <input key={`tool-${value}`} type="hidden" name="tool" value={value} />)}
            {query?.tags.map((value) => <input key={`tag-${value}`} type="hidden" name="tag" value={value} />)}
            {query && query.sort !== 'latest' && <input type="hidden" name="sort" value={query.sort} />}
            <label htmlFor={large ? 'hero-search' : 'page-search'}>搜索 Skill</label>
            <div className="search-row">
                <input id={large ? 'hero-search' : 'page-search'} name="q" value={keyword} onChange={(event) => {
                    setKeyword(event.target.value)
                    setError('')
                }} ref={inputRef} placeholder="搜索 Skill 名称、简介或标签" aria-invalid={error ? true : undefined} aria-describedby={error ? 'search-error' : undefined} />
                <button className="button" type="submit">搜索</button>
            </div>
            {error && <p id="search-error" role="alert" className="error-text">{error}</p>}
            {large && <div className="search-tags"><h2>热门搜索标签</h2><p>以下入口按业务场景预设，不基于搜索量或算法排名。</p><div>{['选品调研', 'Listing 优化', '广告分析', '客服反馈'].map((tag) => <a key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>{tag}</a>)}</div></div>}
        </form>
    )
}
