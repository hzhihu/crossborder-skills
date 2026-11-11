export function getDashboardRecentStart(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
        day: '2-digit', month: '2-digit', timeZone: 'Asia/Shanghai', year: 'numeric',
    }).formatToParts(now)
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
    const todayInShanghai = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), -8)
    return new Date(todayInShanghai - 6 * 24 * 60 * 60 * 1000).toISOString()
}
