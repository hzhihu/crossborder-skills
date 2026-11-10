import { APIError, type Access, type CollectionConfig, type FieldAccess, type Where } from 'payload'

export const requireAdmin: Access = ({ req }) => Boolean(req.user)

export const allowPublishedRead: Access = ({ req }) => {
    if (req.user) {
        return true
    }

    return { status: { equals: 'published' } }
}

export const requireAdminField: FieldAccess = ({ req }) => Boolean(req.user)

export const allowPublishedSkillRead: Access = ({ req }) => {
    if (req.user) {
        return true
    }

    return {
        and: [
            { status: { equals: 'published' } },
            { resource_type: { equals: 'Skill' } },
        ],
    } as Where
}

export const allowActiveRead: Access = ({ req }) => {
    if (req.user) {
        return true
    }

    return { status: { equals: 'active' } }
}

export const forbidDelete: Access = () => false

export function preventHardDelete(): never {
    throw new APIError('该数据只允许归档，不允许硬删除。', 403)
}

export const adminWriteOnly: NonNullable<CollectionConfig['access']> = {
    create: requireAdmin,
    read: requireAdmin,
    update: requireAdmin,
    delete: requireAdmin,
}

export const adminManaged = (read: Access): NonNullable<CollectionConfig['access']> => ({
    create: requireAdmin,
    read,
    update: requireAdmin,
    delete: requireAdmin,
})
