import { createHash } from 'node:crypto'

import { APIError, type CollectionConfig } from 'payload'

import { adminManaged, allowPublishedSkillRead, preventHardDelete, requireAdminField } from './access.ts'
import { getSafeSourceUrl, normalizeRepositoryUrl } from '../modules/skills/source.ts'

function getRelationshipID(value: unknown) {
    return typeof value === 'object' && value !== null && 'id' in value ? value.id : value
}

export const Skills: CollectionConfig = {
    slug: 'skills',
    admin: { useAsTitle: 'name' },
    access: {
        ...adminManaged(allowPublishedSkillRead),
        delete: () => false,
    },
    indexes: [{ fields: ['repository_url', 'repository_path'], unique: true }],
    hooks: {
        beforeDelete: [preventHardDelete],
        beforeChange: [
            async ({ data, originalDoc, operation, req }) => {
                if (operation === 'create' && data.status && data.status !== 'draft') {
                    throw new APIError('新建 Skill 必须从 draft 开始。', 400)
                }
                data.stars_for_sort = data.stars === null ? -1 : data.stars ?? originalDoc?.stars ?? -1
                if (data.repository_url) {
                    data.repository_url = normalizeRepositoryUrl(data.repository_url)
                }
                if (Array.isArray(data.tags) && data.tags.length > 0) {
                    const previousTags = Array.isArray(originalDoc?.tags) ? originalDoc.tags.map(getRelationshipID) : []
                    const addedTagIDs = data.tags.map(getRelationshipID).filter((id) => !previousTags.includes(id))
                    if (addedTagIDs.length > 0) {
                        const activeTags = await req.payload.find({
                            collection: 'tags',
                            where: {
                                and: [
                                    { id: { in: addedTagIDs } },
                                    { status: { equals: 'active' } },
                                ],
                            },
                            limit: addedTagIDs.length,
                            req,
                        })
                        if (activeTags.totalDocs !== addedTagIDs.length) {
                            throw new APIError('归档标签不能新增关联。', 400)
                        }
                    }
                }

                const status = data.status ?? originalDoc?.status ?? 'draft'
                const previousStatus = originalDoc?.status
                const allowedTransitions: Record<string, string[]> = {
                    draft: ['draft', 'pending'],
                    pending: ['pending', 'published', 'rejected'],
                    published: ['published', 'archived'],
                    rejected: ['rejected', 'draft'],
                    archived: ['archived', 'published'],
                }

                if (operation === 'update' && status !== previousStatus && !allowedTransitions[previousStatus]?.includes(status)) {
                    throw new APIError('Skill 状态流转不符合审核规则。', 400)
                }

                if (status === 'published') {
                    const value = (field: string) => data[field] ?? originalDoc?.[field]
                    const categories = value('categories')
                    const hasText = (field: string) => typeof value(field) === 'string' && value(field).trim().length > 0
                    if (!hasText('name') || !hasText('slug') || !(hasText('description_zh') || hasText('description')) ||
                        !hasText('source_url') || !hasText('raw_content') || !hasText('repository_url') ||
                        !hasText('repository_path') || !Array.isArray(categories) || categories.length === 0 ||
                        !getSafeSourceUrl(value('source_url')) || !normalizeRepositoryUrl(value('repository_url'))) {
                        throw new APIError('发布前必须补齐名称、slug、简介、有效分类、来源地址、原始内容和 GitHub 来源信息。', 400)
                    }

                    const categoryIDs = categories.map(getRelationshipID)
                    const validCategories = await req.payload.find({
                        collection: 'categories',
                        where: {
                            and: [
                                { id: { in: categoryIDs } },
                                { is_active: { equals: true } },
                            ],
                        },
                        limit: categoryIDs.length,
                        req,
                    })
                    if (validCategories.totalDocs !== categoryIDs.length) {
                        throw new APIError('发布分类必须全部处于启用状态。', 400)
                    }
                    for (const category of validCategories.docs) {
                        if (category.parent) {
                            const parent = await req.payload.findByID({
                                collection: 'categories',
                                id: getRelationshipID(category.parent) as number,
                                req,
                            })
                            if (!parent.is_active) {
                                throw new APIError('二级分类的父分类也必须处于启用状态。', 400)
                            }
                        }
                    }
                    data.published_at = originalDoc?.published_at || new Date().toISOString()
                }

                return data
            },
        ],
        afterChange: [
            async ({ doc, previousDoc, operation, req }) => {
                if (!doc.raw_content || (operation === 'update' && previousDoc?.raw_content === doc.raw_content)) {
                    return doc
                }

                const contentHash = createHash('sha256').update(doc.raw_content).digest('hex')
                const latest = await req.payload.find({
                    collection: 'skillVersions',
                    where: { skill_id: { equals: doc.id } },
                    sort: '-version',
                    limit: 1,
                    req,
                })
                if (latest.docs[0]?.content_hash === contentHash) {
                    return doc
                }

                await req.payload.create({
                    collection: 'skillVersions',
                    data: {
                        skill_id: doc.id,
                        version: (latest.docs[0]?.version || 0) + 1,
                        content_hash: contentHash,
                        raw_content: doc.raw_content,
                    },
                    req,
                })

                return doc
            },
        ],
    },
    fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'name_zh', type: 'text' },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
        { name: 'description_zh', type: 'textarea' },
        { name: 'content', type: 'textarea' },
        { name: 'raw_content', type: 'textarea', access: { read: requireAdminField } },
        { name: 'installation_instructions', type: 'textarea' },
        { name: 'icon', type: 'upload', relationTo: 'media' },
        { name: 'problem_solved', type: 'textarea' },
        { name: 'applicable_scenarios', type: 'textarea' },
        { name: 'main_features', type: 'textarea' },
        { name: 'usage_prerequisites', type: 'textarea' },
        { name: 'recommendation_reason', type: 'textarea' },
        {
            name: 'resource_type',
            type: 'select',
            required: true,
            defaultValue: 'Skill',
            options: ['Skill', 'MCP Server', 'Agent', 'Workflow', 'Prompt', 'Tool'],
        },
        { name: 'source_url', type: 'text' },
        { name: 'repository_url', type: 'text' },
        { name: 'repository_path', type: 'text' },
        { name: 'repository_name', type: 'text' },
        { name: 'repository_full_name', type: 'text' },
        { name: 'owner', type: 'text' },
        { name: 'author', type: 'text' },
        { name: 'default_branch', type: 'text' },
        { name: 'stars', type: 'number', min: 0 },
        { name: 'stars_for_sort', type: 'number', required: true, defaultValue: -1, access: { read: requireAdminField }, admin: { hidden: true } },
        { name: 'forks', type: 'number', min: 0 },
        { name: 'repository_pushed_at', type: 'date' },
        { name: 'repository_updated_at', type: 'date' },
        { name: 'source_file_updated_at', type: 'date' },
        { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
        { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
        { name: 'platforms', type: 'relationship', relationTo: 'platforms', hasMany: true },
        { name: 'tools', type: 'relationship', relationTo: 'tools', hasMany: true },
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'draft',
            options: [
                { label: '草稿', value: 'draft' },
                { label: '待审核', value: 'pending' },
                { label: '已发布', value: 'published' },
                { label: '已驳回', value: 'rejected' },
                { label: '已归档', value: 'archived' },
            ],
        },
        { name: 'is_featured', type: 'checkbox', required: true, defaultValue: false },
        { name: 'published_at', type: 'date' },
        { name: 'last_verified_at', type: 'date' },
    ],
}
