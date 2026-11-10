export function getInstallCommand(rawContent: string | null | undefined, instructions: string | null | undefined) {
    const blocks = rawContent?.match(/```(?:bash|sh|shell|zsh)?\s*\n([\s\S]*?)```/gi) || []
    for (const block of blocks) {
        const command = block.replace(/```(?:bash|sh|shell|zsh)?\s*\n?/i, '').replace(/```$/, '').trim()
        if (/^(npx|npm|pnpm|yarn|bun|pip|uv|curl|git)\s/m.test(command)) return command
    }
    return instructions?.trim() || ''
}
