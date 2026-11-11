import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, type Plugin } from 'payload'

import { Categories } from './collections/Categories.ts'
import { Collections } from './collections/Collections.ts'
import { CrawlTasks } from './collections/CrawlTasks.ts'
import { Media } from './collections/Media.ts'
import { Platforms } from './collections/Platforms.ts'
import { Skills } from './collections/Skills.ts'
import { SkillVersions } from './collections/SkillVersions.ts'
import { Tags } from './collections/Tags.ts'
import { Tools } from './collections/Tools.ts'
import { Users } from './collections/Users.ts'
import { executeCrawlTask } from './modules/crawler/execute.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const storageDriver = process.env.STORAGE_DRIVER || (process.env.NODE_ENV === 'production' ? 's3' : 'local')

if (!['local', 's3'].includes(storageDriver)) {
    throw new Error('STORAGE_DRIVER 只允许 local 或 s3。')
}

function getRequiredEnvironment(name: string) {
    const value = process.env[name]
    if (!value) {
        throw new Error(`使用 S3 存储时必须配置 ${name}。`)
    }

    return value
}

const storagePlugins: Plugin[] = storageDriver === 's3'
    ? [
        s3Storage({
            bucket: getRequiredEnvironment('S3_BUCKET'),
            collections: { media: true },
            config: {
                region: getRequiredEnvironment('S3_REGION'),
                endpoint: process.env.S3_ENDPOINT || undefined,
                forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
                credentials: {
                    accessKeyId: getRequiredEnvironment('S3_ACCESS_KEY_ID'),
                    secretAccessKey: getRequiredEnvironment('S3_SECRET_ACCESS_KEY'),
                },
            },
        }),
    ]
    : []

export default buildConfig({
    admin: {
        user: Users.slug,
        components: {
            beforeNavLinks: ['/components/admin/ReviewNavLink#ReviewNavLink'],
            views: {
                review: {
                    Component: '/components/admin/ReviewView',
                    meta: { title: '待审核工作台' },
                    path: '/review',
                },
            },
        },
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    collections: [
        Users,
        Skills,
        Categories,
        Tags,
        Platforms,
        Tools,
        Collections,
        SkillVersions,
        CrawlTasks,
        Media,
    ],
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL || '',
        },
    }),
    editor: lexicalEditor(),
    jobs: {
        tasks: [
            {
                slug: 'crawlSkill',
                inputSchema: [{ name: 'taskId', type: 'number', required: true }],
                retries: 0,
                handler: async ({ input, req }) => ({ output: await executeCrawlTask(req.payload, input.taskId) }),
            },
            {
                slug: 'systemHealthCheck',
                // Payload 至少需要一个系统任务才会启用 Jobs Collection 和 Worker。
                handler: () => ({ output: {}, state: 'succeeded' }),
            },
        ],
    },
    plugins: storagePlugins,
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    upload: {
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
    },
})
