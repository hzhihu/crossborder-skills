import type { CollectionConfig } from 'payload'

import { queueCreatedCrawlTask, retryCrawlTask, validateCrawlTask } from '../modules/crawler/tasks.ts'
import { adminWriteOnly, preventHardDelete } from './access.ts'

export const CrawlTasks: CollectionConfig = {
    slug: 'crawlTasks',
    admin: {
        components: { edit: { beforeDocumentControls: ['/components/admin/CrawlActions#RetryCrawlTaskButton'] } },
        defaultColumns: ['id', 'source_url', 'task_type', 'status', 'createdAt', 'completed_at'],
        useAsTitle: 'source_url',
    },
    access: {
        ...adminWriteOnly,
        delete: () => false,
    },
    endpoints: [{ handler: retryCrawlTask, method: 'post', path: '/:id/retry' }],
    indexes: [{ fields: ['retry_of'], unique: true }],
    hooks: {
        afterChange: [queueCreatedCrawlTask],
        beforeDelete: [preventHardDelete],
        beforeValidate: [validateCrawlTask],
    },
    fields: [
        { name: 'source_url', type: 'text', required: true },
        { name: 'repository_path', type: 'text' },
        {
            name: 'resource_type',
            type: 'select',
            defaultValue: 'Skill',
            options: ['Skill', 'MCP Server', 'Agent', 'Workflow', 'Prompt', 'Tool'],
        },
        { name: 'category', type: 'relationship', relationTo: 'categories' },
        { name: 'skill', type: 'relationship', relationTo: 'skills' },
        {
            name: 'task_type',
            type: 'select',
            required: true,
            defaultValue: 'crawl',
            options: [
                { label: '采集', value: 'crawl' },
                { label: '解析', value: 'parse' },
                { label: 'AI', value: 'ai' },
                { label: '同步', value: 'sync' },
            ],
        },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'queued',
            options: [
                { label: '等待执行', value: 'queued' },
                { label: '执行中', value: 'running' },
                { label: '执行成功', value: 'succeeded' },
                { label: '需要异常审核', value: 'needs_review' },
                { label: '执行失败', value: 'failed' },
            ],
        },
        { name: 'retry_of', type: 'relationship', relationTo: 'crawlTasks', index: false },
        { name: 'result', type: 'json' },
        { name: 'error_message', type: 'textarea' },
        { name: 'started_at', type: 'date' },
        { name: 'completed_at', type: 'date' },
    ],
}
