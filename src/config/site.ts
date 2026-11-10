const defaultHomeRecentDays = 7

export function getHomeRecentDays(value = process.env.HOME_RECENT_DAYS) {
    if (!value) {
        return defaultHomeRecentDays
    }

    const days = Number(value)
    if (!Number.isInteger(days) || days <= 0) {
        throw new Error('HOME_RECENT_DAYS 必须是正整数。')
    }

    return days
}

export function getHomeRecentCutoff(days: number) {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export const siteConfig = {
    homeRecentDays: getHomeRecentDays(),
}
