import { getPayload } from 'payload'

import config from '../../payload.config.ts'

export function getPublicPayload() {
    return getPayload({ config })
}
