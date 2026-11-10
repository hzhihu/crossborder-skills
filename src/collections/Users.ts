import type { CollectionConfig } from 'payload'

import { adminWriteOnly } from './access.ts'

export const Users: CollectionConfig = {
    slug: 'users',
    auth: true,
    access: adminWriteOnly,
    admin: {
        useAsTitle: 'email',
    },
    fields: [],
}
