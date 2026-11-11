'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, toast } from '@payloadcms/ui'

export function ReviewActions({ expectedHash, id, hasUpdate, publishDisabledReason }: { expectedHash: string, id: number, hasUpdate: boolean, publishDisabledReason?: string }) {
    const router = useRouter()
    const [pendingAction, setPendingAction] = useState<'publish' | 'reject' | null>(null)

    const run = async (action: 'publish' | 'reject') => {
        const message = action === 'publish' ? '确认审核通过并公开当前内容吗？' : '确认驳回该 Skill 吗？驳回后不会公开。'
        if (!window.confirm(message)) return
        setPendingAction(action)
        try {
            const response = await fetch(`/api/skills/${id}/${action}`, {
                body: action === 'publish' ? JSON.stringify({ expectedHash }) : undefined,
                headers: action === 'publish' ? { 'Content-Type': 'application/json' } : undefined,
                method: 'POST',
            })
            const result = await response.json() as { error?: string, errors?: { message?: string }[] }
            if (!response.ok) throw new Error(result.error || result.errors?.[0]?.message || '审核操作失败。')
            toast.success(action === 'publish' ? 'Skill 已发布。' : 'Skill 已驳回。')
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '审核操作失败。')
            setPendingAction(null)
        }
    }

    return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button disabled={pendingAction !== null || Boolean(publishDisabledReason)} onClick={() => run('publish')} type="button">
            {publishDisabledReason ? '暂不可发布' : pendingAction === 'publish' ? '正在发布…' : hasUpdate ? '审核并发布更新' : '审核并发布'}
        </Button>
        {!hasUpdate && <Button buttonStyle="secondary" disabled={pendingAction !== null} onClick={() => run('reject')} type="button">
            {pendingAction === 'reject' ? '正在驳回…' : '驳回'}
        </Button>}
    </div>
}
