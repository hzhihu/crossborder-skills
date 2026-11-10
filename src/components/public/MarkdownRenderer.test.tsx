import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MarkdownRenderer } from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
    it('does not inject raw HTML or unsafe links', () => {
        const html = renderToStaticMarkup(<MarkdownRenderer content={'<script>alert(1)</script>\n[bad](javascript:alert(1))\n[good](https://github.com)'} />)
        expect(html).not.toContain('<script>')
        expect(html).not.toContain('javascript:')
        expect(html).toContain('https://github.com')
        expect(html).toContain('rel="nofollow noopener noreferrer"')
    })

    it('does not load external Markdown images', () => {
        const html = renderToStaticMarkup(<MarkdownRenderer content={'![alt](https://example.com/a.png)'} />)
        expect(html).not.toContain('<img')
        expect(html).toContain('[图片：alt]')
    })
})
