import type { CollectionConfig } from 'payload'

import { adminWriteOnly, preventHardDelete } from './access.ts'

export const SkillVersions: CollectionConfig = {
    slug: 'skillVersions',
    admin: { useAsTitle: 'version' },
    access: {
        ...adminWriteOnly,
        update: () => false,
        delete: () => false,
    },
    hooks: { beforeDelete: [preventHardDelete] },
    indexes: [{ fields: ['skill_id', 'version'], unique: true }],
    fields: [
        { name: 'skill_id', type: 'relationship', relationTo: 'skills', required: true },
        { name: 'version', type: 'number', required: true, min: 1, validate: (value: number | null | undefined) => Number.isInteger(value) || '版本号必须是整数。' },
        { name: 'content_hash', type: 'text', required: true },
        { name: 'raw_content', type: 'textarea', required: true },
        { name: 'changelog', type: 'textarea' },
    ],
}
