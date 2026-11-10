'use client'

import { useState } from 'react'

function DefaultIcon() {
    return <span className="default-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></span>
}

export function SkillIcon({ url, name }: { url?: null | string, name: string }) {
    const [failed, setFailed] = useState(false)
    if (!url || failed) return <DefaultIcon />
    // 外部 S3 域名由环境配置，无法写死 Next Image 域名白名单。
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="skill-icon" src={url} alt={`${name} 图标`} onError={() => setFailed(true)} />
}
