'use client'

import { Button } from '@payloadcms/ui'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'

type Category = { id: number, name: string }

export function CrawlImportForm({ categories }: { categories: Category[] }) {
    const [error, setError] = useState('')
    const [pending, setPending] = useState(false)
    const [taskID, setTaskID] = useState<number>()

    async function submitTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setTaskID(undefined)
        setPending(true)
        const formElement = event.currentTarget
        const form = new FormData(formElement)
        try {
            const response = await fetch('/api/crawlTasks', {
                body: JSON.stringify({
                    category: form.get('category') || undefined,
                    repository_path: form.get('repository_path') || undefined,
                    resource_type: form.get('resource_type'),
                    source_url: form.get('source_url'),
                    status: 'queued',
                    task_type: 'crawl',
                }),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            })
            const result = await response.json()
            if (!response.ok) {
                const message = result.errors?.map((item: { message?: string }) => item.message).filter(Boolean).join('；')
                throw new Error(message || '任务创建失败，请检查输入后重试。')
            }
            setTaskID(result.doc.id)
            formElement.reset()
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : '任务创建失败，请稍后重试。')
        } finally {
            setPending(false)
        }
    }

    return <form onSubmit={submitTask} style={{ display: 'grid', gap: '1.25rem' }}>
        <p>支持公开 GitHub 仓库地址或单个 Skills.sh 资源详情地址。提交只创建异步任务，不代表采集或发布成功。</p>
        <div>
            <label htmlFor="source-url" style={{ display: 'block', marginBottom: '0.5rem' }}>来源地址（必填）</label>
            <input id="source-url" name="source_url" required type="url" placeholder="https://github.com/owner/repository" style={{ boxSizing: 'border-box', minHeight: '40px', padding: '0.5rem', width: '100%' }} />
        </div>
        <div>
            <label htmlFor="repository-path" style={{ display: 'block', marginBottom: '0.5rem' }}>子目录或文件路径（可选）</label>
            <input id="repository-path" name="repository_path" placeholder="skills/example/SKILL.md" style={{ boxSizing: 'border-box', minHeight: '40px', padding: '0.5rem', width: '100%' }} />
        </div>
        <div>
            <label htmlFor="resource-type" style={{ display: 'block', marginBottom: '0.5rem' }}>资源类型</label>
            <select id="resource-type" name="resource_type" defaultValue="Skill">
                {['Skill', 'MCP Server', 'Agent', 'Workflow', 'Prompt', 'Tool'].map((type) => <option key={type}>{type}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem' }}>业务分类（可选）</label>
            <select id="category" name="category" defaultValue="">
                <option value="">暂不指定</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
        </div>
        {error && <p role="alert">{error}</p>}
        {taskID && <p role="status">任务 {taskID} 已创建并等待异步执行。<Link href={`/admin/collections/crawlTasks/${taskID}`}>查看任务结果</Link></p>}
        <div>
            <Button type="submit" disabled={pending}>{pending ? '正在创建任务…' : '创建异步采集任务'}</Button>
        </div>
    </form>
}
