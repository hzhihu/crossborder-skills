'use client'

import { useState } from 'react'

export function CopyButton({ command }: { command: string }) {
    const [message, setMessage] = useState('')

    async function copyCommand() {
        try {
            await navigator.clipboard.writeText(command)
            setMessage('已复制')
        } catch {
            setMessage('复制失败，请手动复制')
        }
    }

    return <><button className="button secondary" type="button" onClick={copyCommand}>复制安装命令</button><span className="copy-feedback" aria-live="polite">{message}</span></>
}
