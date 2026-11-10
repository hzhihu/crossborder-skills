import type { Metadata } from 'next'

export const siteUrl = process.env.SITE_URL || 'http://localhost:3000'

export function getMetadata(title: string, description: string, path: string, noindex = false): Metadata {
    return {
        title,
        description,
        alternates: { canonical: `${siteUrl}${path}` },
        robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
        openGraph: {
            title,
            description,
            url: `${siteUrl}${path}`,
            images: [{ url: `${siteUrl}/og/default.png`, width: 1200, height: 630, alt: 'CrossBorder Skills Hub' }],
        },
    }
}

export function JsonLd({ value }: { value: Record<string, unknown> }) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, '\\u003c') }} />
}
