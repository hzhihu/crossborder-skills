import { expect, test, type APIRequestContext } from '@playwright/test'

async function getFirstSlug(request: APIRequestContext, collection: string) {
    const response = await request.get(`/api/${collection}?limit=1&sort=-createdAt`)
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.docs.length).toBeGreaterThan(0)
    return data.docs[0].slug as string
}

test('public routes expose valid SEO metadata and structured data', async ({ page, request }) => {
    const skillSlug = await getFirstSlug(request, 'skills')
    const categorySlug = await getFirstSlug(request, 'categories')
    const collectionSlug = await getFirstSlug(request, 'collections')
    const routes = [
        { path: '/', type: 'WebSite' },
        { path: '/skills', type: '' },
        { path: `/skills/${skillSlug}`, type: 'TechArticle' },
        { path: '/categories', type: '' },
        { path: `/categories/${categorySlug}`, type: 'CollectionPage' },
        { path: '/collections', type: '' },
        { path: `/collections/${collectionSlug}`, type: 'CollectionPage' },
        { path: '/search', type: '' },
        { path: '/about', type: 'AboutPage' },
    ]

    for (const route of routes) {
        const response = await page.goto(route.path)
        expect(response?.ok()).toBe(true)
        await expect(page).toHaveTitle(/\S/)
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new URL(route.path, process.env.SITE_URL || 'http://localhost:3000').toString())
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/default\.png$/)

        const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
        const parsedData = structuredData.flatMap((value) => {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed : [parsed]
        })
        if (route.type) {
            expect(parsedData.some((value) => value['@type'] === route.type)).toBe(true)
        }
    }

    const robots = await request.get('/robots.txt')
    expect(robots.ok()).toBe(true)
    expect(await robots.text()).toContain('Disallow: /admin')
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBe(true)
    const sitemapText = await sitemap.text()
    expect(sitemapText).toContain(`/skills/${skillSlug}`)
    expect(sitemapText).not.toContain('/admin')
})

test('key public pages pass basic responsive and accessibility checks', async ({ page, request }) => {
    const skillSlug = await getFirstSlug(request, 'skills')
    const categorySlug = await getFirstSlug(request, 'categories')
    const collectionSlug = await getFirstSlug(request, 'collections')
    const routes = ['/', '/skills', `/skills/${skillSlug}`, '/categories', `/categories/${categorySlug}`, '/collections', `/collections/${collectionSlug}`, '/search', '/about']

    for (const width of [390, 1200]) {
        await page.setViewportSize({ width, height: 900 })
        for (const route of routes) {
            await page.goto(route)
            await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

            const missingAlt = await page.locator('img:not([alt])').count()
            expect(missingAlt).toBe(0)
            const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
                const ids = elements.map((element) => element.id)
                return ids.filter((id, index) => ids.indexOf(id) !== index)
            })
            expect(duplicateIds).toEqual([])

            const unnamedControls = await page.locator('button, a, input, select, textarea').evaluateAll((elements) => elements.filter((element) => {
                if (!(element instanceof HTMLElement) || element.hidden || element.closest('[hidden], [aria-hidden="true"]') || element.getClientRects().length === 0) return false
                const labelledBy = element.getAttribute('aria-labelledby')
                const hasExternalLabel = (element as HTMLInputElement).labels?.length || (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`))
                const hasName = element.getAttribute('aria-label') || labelledBy || hasExternalLabel || element.textContent?.trim() || element.getAttribute('title')
                return !hasName
            }).length)
            expect(unnamedControls).toBe(0)
        }
    }
})
