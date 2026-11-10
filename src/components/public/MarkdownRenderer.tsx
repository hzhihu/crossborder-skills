import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={(url) => {
                if (/^(https?:|mailto:)/i.test(url)) return url
                if (url.startsWith('/') || url.startsWith('#')) return url
                return ''
            }} components={{
                a: ({ children, ...props }) => <a {...props} target="_blank" rel="nofollow noopener noreferrer">{children}</a>,
                img: ({ alt }) => <span>[图片：{alt || '未提供说明'}]</span>,
            }}>{content}</ReactMarkdown>
        </div>
    )
}
