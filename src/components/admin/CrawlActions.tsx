'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, toast, useDocumentInfo } from '@payloadcms/ui'

function useCrawlAction(endpoint: string) {
    const router = useRouter()
    const [pending, setPending] = useState(false)
    const run = async () => {
        setPending(true)
        try {
            const response = await fetch(endpoint, { method: 'POST' })
            const result = await response.json() as { error?: string, id?: number }
            if (!response.ok || !result.id) throw new Error(result.error || '任务创建失败。')
            toast.success('采集任务已创建。')
            router.push(`/admin/collections/crawlTasks/${result.id}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '任务创建失败。')
            setPending(false)
        }
    }
    return { pending, run }
}

export function RetryCrawlTaskButton() {
    const { id, initialData } = useDocumentInfo()
    const { pending, run } = useCrawlAction(`/api/crawlTasks/${id}/retry`)
    if (!id || !['failed', 'needs_review'].includes(String(initialData?.status))) return null
    return <Button disabled={pending} onClick={run} type="button">{pending ? '正在创建…' : '创建重试任务'}</Button>
}

export function RecrawlSkillButton() {
    const { id, initialData } = useDocumentInfo()
    const { pending, run } = useCrawlAction(`/api/skills/${id}/recrawl`)
    if (!id || initialData?.resource_type !== 'Skill' || !initialData?.source_url || !initialData?.repository_url || !initialData?.repository_path) return null
    return <Button disabled={pending} onClick={run} type="button">{pending ? '正在创建…' : '重新采集'}</Button>
}
