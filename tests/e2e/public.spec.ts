import { expect, test } from '@playwright/test'

test('public navigation, search and responsive pages work', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('跨境电商 AI Skills 资源目录')
    await page.getByRole('button', { name: '搜索', exact: true }).click()
    await expect(page.locator('#search-error')).toContainText('请输入 Skill 名称、简介或标签关键词')
    await page.getByRole('textbox', { name: '搜索 Skill' }).fill('verification')
    await page.getByRole('button', { name: '搜索', exact: true }).click()
    await expect(page).toHaveURL(/\/search\?q=verification/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('搜索结果')

    await page.goto('/skills?platform=not-real&page=0&sort=invalid')
    await expect(page.getByText('部分筛选条件无效，已忽略。')).toBeVisible()
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('关于 CrossBorder Skills Hub')
    await page.goto('/skills/not-a-skill')
    expect((await page.request.get('/skills/not-a-skill')).status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('页面不存在')
    const apiResponse = await page.request.get('/api/skills?limit=1')
    expect(apiResponse.ok()).toBe(true)
    const apiData = await apiResponse.json()
    expect(apiData.docs[0]).not.toHaveProperty('raw_content')
    expect(apiData.docs[0]).not.toHaveProperty('stars_for_sort')
})

test('category search, collection SEO and out-of-range pagination keep valid state', async ({ page, request }) => {
    const categories = await (await request.get('/api/categories?sort=-createdAt&limit=1')).json()
    const categorySlug = categories.docs[0].slug
    await page.goto(`/categories/${categorySlug}`)
    await page.getByRole('textbox', { name: '搜索 Skill' }).fill('verification')
    await page.getByRole('button', { name: '搜索', exact: true }).click()
    await expect(page).toHaveURL(`/categories/${categorySlug}?category=${categorySlug}&q=verification`)

    await page.goto('/skills?page=999')
    await expect(page.getByRole('link', { name: '返回第 1 页' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: '分页' })).toHaveCount(0)
    await page.getByRole('link', { name: '返回第 1 页' }).click()
    await expect(page).toHaveURL('/skills')
    await expect(page.getByText('当前页没有结果。')).toHaveCount(0)
    await page.goto('/skills?page=2')
    await page.getByRole('link', { name: '上一页' }).click()
    await expect(page).toHaveURL('/skills')

    const collections = await (await request.get('/api/collections?where[slug][like]=verification-&sort=-createdAt&limit=1')).json()
    await page.goto(`/collections/${collections.docs[0].slug}?page=999`)
    await expect(page.getByRole('link', { name: '返回第 1 页' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: '分页' })).toHaveCount(0)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
})

test('empty states, clear filters and desktop controls stay consistent', async ({ page, request }) => {
    const emptyCategories = await (await request.get('/api/categories?where[slug][like]=empty-&sort=-createdAt&limit=1')).json()
    await page.goto(`/categories/${emptyCategories.docs[0].slug}`)
    await expect(page.getByText('暂无公开 Skill。')).toBeVisible()
    await expect(page.getByRole('link', { name: '清除筛选' })).toHaveCount(0)

    const categories = await (await request.get('/api/categories?where[slug][like]=child-&sort=-createdAt&limit=1')).json()
    await page.goto(`/categories/${categories.docs[0].slug}?page=999`)
    await expect(page.getByRole('link', { name: '返回第 1 页' })).toBeVisible()
    await expect(page.getByRole('link', { name: '清除筛选' })).toHaveCount(0)

    await page.goto('/skills?q=zzzznotfound')
    await page.getByRole('link', { name: '清除筛选' }).click()
    await expect(page.getByRole('textbox', { name: '搜索 Skill' })).toHaveValue('')
    await expect(page.locator('.desktop-filters').getByRole('button', { name: '关闭', exact: true })).toHaveCount(0)

    const emptyCollections = await (await request.get('/api/collections?where[slug][like]=empty-&sort=-createdAt&limit=1')).json()
    await page.goto(`/collections/${emptyCollections.docs[0].slug}`)
    await expect(page.getByText('暂无公开 Skill。')).toBeVisible()
    await expect(page.getByRole('link', { name: '返回第 1 页' })).toHaveCount(0)
})

test('mobile menu, filter drawer and layouts remain usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('button', { name: '打开导航菜单' }).click()
    await expect(page.getByRole('dialog', { name: '网站导航' })).toBeVisible()
    await page.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(page.getByRole('button', { name: '打开导航菜单' })).toBeFocused()
    await page.goto('/skills')
    await page.getByRole('button', { name: '筛选与排序', exact: true }).click()
    await expect(page.getByRole('dialog', { name: '筛选与排序' })).toBeVisible()
    await page.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(page.getByRole('button', { name: '筛选与排序', exact: true })).toBeFocused()

    for (const width of [390, 768, 1200]) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto('/')
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        await page.screenshot({ path: `design/screenshots/phase-3/home-${width}.png`, fullPage: true })
    }
})
