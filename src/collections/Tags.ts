import type { CollectionConfig } from 'payload'

import { adminManaged, allowActiveRead, preventHardDelete } from './access.ts'

export const Tags: CollectionConfig = {
    slug: 'tags',
    admin: { useAsTitle: 'name' },
    access: {
        ...adminManaged(allowActiveRead),
        delete: () => false,
    },
    hooks: { beforeDelete: [preventHardDelete] },
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        {
            name: 'type',
            type: 'select',
            required: true,
            options: [
                { label: '业务场景', value: 'business' },
                { label: '技术类型', value: 'technology' },
            ],
        },
        { name: 'description', type: 'textarea' },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'active',
            options: [
                { label: '启用', value: 'active' },
                { label: '归档', value: 'archived' },
            ],
        },
    ],
}
