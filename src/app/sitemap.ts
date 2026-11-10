import type { MetadataRoute } from 'next'

import { getFilterData, getPublicCollections } from '@/modules/public/queries'
import { getPublicPayload } from '@/modules/public/payload'
import { siteUrl } from '@/modules/public/metadata'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const payload = await getPublicPayload()
    const [skills, categories, collections] = await Promise.all([
        payload.find({ collection: 'skills', limit: 0, overrideAccess: false }),
        getFilterData(),
        getPublicCollections(),
    ])
    const paths = ['/', '/skills', '/categories', '/collections', '/about']
    return [
        ...paths.map((path) => ({ url: `${siteUrl}${path}` })),
        ...skills.docs.map((skill) => ({ url: `${siteUrl}/skills/${skill.slug}` })),
        ...categories.categories.map((category) => ({ url: `${siteUrl}/categories/${category.slug}` })),
        ...collections.docs.map((collection) => ({ url: `${siteUrl}/collections/${collection.slug}` })),
    ]
}
