'use client'

import { useRef } from 'react'

import type { Category, Platform, Tag, Tool } from '@/payload-types'
import type { PublicQuery } from '@/modules/public/searchParams'

const sortLabels = { latest: '最新发布', updated: '最近更新', stars: 'GitHub Stars', featured: '管理员推荐' }

type FilterData = { categories: Category[], platforms: Platform[], tools: Tool[], tags: Tag[] }

export function FilterPanel({ query, filters, invalid, lockCategory = false, showSort = true }: { query: PublicQuery, filters: FilterData, invalid: string[], lockCategory?: boolean, showSort?: boolean }) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const renderForm = (showClose: boolean) => (
        <form method="get" className="filter-form">
            {query.q && <input type="hidden" name="q" value={query.q} />}
            {lockCategory && <input type="hidden" name="category" value={query.category} />}
            {!lockCategory && <label>分类
                <select name="category" defaultValue={query.category}>
                    <option value="">全部分类</option>
                    {filters.categories.map((item) => <option key={item.id} value={item.slug}>{item.parent ? '— ' : ''}{item.name}</option>)}
                </select>
            </label>}
            <fieldset><legend>平台</legend>{filters.platforms.map((item) => <label key={item.id}><input type="checkbox" name="platform" value={item.slug} defaultChecked={query.platforms.includes(item.slug)} />{item.name}</label>)}</fieldset>
            <fieldset><legend>工具</legend>{filters.tools.map((item) => <label key={item.id}><input type="checkbox" name="tool" value={item.slug} defaultChecked={query.tools.includes(item.slug)} />{item.name}</label>)}</fieldset>
            <fieldset><legend>标签</legend>{filters.tags.map((item) => <label key={item.id}><input type="checkbox" name="tag" value={item.slug} defaultChecked={query.tags.includes(item.slug)} />{item.name}</label>)}</fieldset>
            {showSort && <label>排序
                <select name="sort" defaultValue={query.sort}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            </label>}
            <button className="button" type="submit">应用筛选</button>
            {showClose && <button className="button secondary" type="button" onClick={() => dialogRef.current?.close()}>关闭</button>}
        </form>
    )

    return (
        <>
            {invalid.length > 0 && <p role="status" className="notice">部分筛选条件无效，已忽略。</p>}
            <div className="desktop-filters">{renderForm(false)}</div>
            <button ref={buttonRef} className="button secondary mobile-only" type="button" onClick={() => dialogRef.current?.showModal()}>筛选与排序</button>
            <dialog ref={dialogRef} className="filter-dialog" aria-label="筛选与排序" onClose={() => buttonRef.current?.focus()}>
                <h2>筛选与排序</h2>{renderForm(true)}
            </dialog>
        </>
    )
}
