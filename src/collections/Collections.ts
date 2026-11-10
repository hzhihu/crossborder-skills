import { APIError, type CollectionConfig } from 'payload'

import { adminManaged, allowPublishedRead, preventHardDelete } from './access.ts'

export const Collections: CollectionConfig = {
    slug: 'collections',
    admin: { useAsTitle: 'name' },
    access: {
        ...adminManaged(allowPublishedRead),
        delete: () => false,
    },
    hooks: {
        beforeDelete: [preventHardDelete],
        beforeChange: [
            async ({ data, originalDoc, operation }) => {
                if (operation === 'create' && data.status && data.status !== 'draft') {
                    throw new APIError('新建专题必须从 draft 开始。', 400)
                }
                const status = data.status ?? originalDoc?.status ?? 'draft'
                const previousStatus = originalDoc?.status
                const allowedTransitions: Record<string, string[]> = {
                    draft: ['draft', 'published'],
                    published: ['published', 'archived'],
                    archived: ['archived', 'published'],
                }

                if (operation === 'update' && status !== previousStatus && !allowedTransitions[previousStatus]?.includes(status)) {
                    throw new APIError('专题状态只允许 draft → published 和 published ⇄ archived。', 400)
                }
                if (status === 'published' && previousStatus !== 'published') {
                    data.published_at = originalDoc?.published_at || new Date().toISOString()
                }

                return data
            },
        ],
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
        { name: 'detailed_content', type: 'textarea' },
        { name: 'cover_image', type: 'upload', relationTo: 'media' },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'draft',
            options: [
                { label: '草稿', value: 'draft' },
                { label: '已发布', value: 'published' },
                { label: '已归档', value: 'archived' },
            ],
        },
        { name: 'sort_order', type: 'number', required: true, defaultValue: 0 },
        { name: 'published_at', type: 'date' },
        { name: 'seo_title', type: 'text' },
        { name: 'seo_description', type: 'textarea' },
        {
            name: 'skills',
            type: 'array',
            fields: [
                { name: 'skill', type: 'relationship', relationTo: 'skills', required: true },
                { name: 'sort_order', type: 'number', required: true, defaultValue: 0 },
            ],
        },
    ],
}
