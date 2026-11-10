import type { Metadata } from 'next'

import config from '@payload-config'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'

import { importMap } from '../importMap'

type Args = {
    params: Promise<{ segments: string[] }>
    searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
    const metadata = await generatePageMetadata({ config, params, searchParams })

    return {
        ...metadata,
        robots: { index: false, follow: false },
    }
}

export default function AdminPage({ params, searchParams }: Args) {
    return RootPage({ config, importMap, params, searchParams })
}
