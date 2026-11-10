import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { APIError, type CollectionConfig } from 'payload'

import { adminManaged } from './access.ts'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp']
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp']

export const Media: CollectionConfig = {
    slug: 'media',
    access: adminManaged(() => true),
    upload: {
        staticDir: process.env.LOCAL_STORAGE_DIR || path.resolve(dirname, '../media'),
        mimeTypes: allowedMimeTypes,
    },
    hooks: {
        beforeValidate: [
            async ({ data, req }) => {
                const filename = req.file?.name || data?.filename
                const extension = filename ? path.extname(filename).toLowerCase() : ''
                if (filename && !allowedExtensions.includes(extension)) {
                    throw new APIError('只允许 PNG、JPEG、WebP 图片。', 400)
                }

                return data
            },
        ],
    },
    fields: [{ name: 'alt', type: 'text' }],
}
