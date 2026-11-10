import { APIError, type CollectionConfig, type Where } from 'payload'

import { adminManaged } from './access.ts'

export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: { useAsTitle: 'name' },
    access: adminManaged(async ({ req }): Promise<true | Where> => {
        if (req.user) {
            return true
        }

        const inactive = await req.payload.find({
            collection: 'categories',
            where: { is_active: { equals: false } },
            limit: 0,
            overrideAccess: true,
            req,
        })
        const inactiveIDs = inactive.docs.map((item) => item.id)
        if (!inactiveIDs.length) {
            return { is_active: { equals: true } }
        }
        const children = await req.payload.find({
            collection: 'categories',
            where: { parent: { in: inactiveIDs } },
            limit: 0,
            overrideAccess: true,
            req,
        })
        return {
            and: [
                { is_active: { equals: true } },
                { id: { not_in: children.docs.map((item) => item.id) } },
            ],
        }
    }),
    hooks: {
        beforeValidate: [
            async ({ data, originalDoc, req }) => {
                const parentID = data?.parent ?? originalDoc?.parent
                if (!parentID) {
                    return data
                }

                const parent = await req.payload.findByID({
                    collection: 'categories',
                    id: parentID,
                    req,
                })
                if (parent.parent) {
                    throw new APIError('分类最多支持一级和二级，二级分类不能再包含子分类。', 400)
                }

                return data
            },
        ],
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        {
            name: 'parent',
            type: 'relationship',
            relationTo: 'categories',
            filterOptions: ({ id }) => id ? { id: { not_equals: id } } : true,
        },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'upload', relationTo: 'media' },
        { name: 'sort_order', type: 'number', required: true, defaultValue: 0 },
        { name: 'is_active', type: 'checkbox', required: true, defaultValue: true },
        { name: 'seo_title', type: 'text' },
        { name: 'seo_description', type: 'textarea' },
    ],
}
