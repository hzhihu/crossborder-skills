import type { CollectionConfig } from 'payload'

import { adminManaged } from './access.ts'

export const Tools: CollectionConfig = {
    slug: 'tools',
    admin: { useAsTitle: 'name' },
    access: adminManaged(() => true),
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
    ],
}
