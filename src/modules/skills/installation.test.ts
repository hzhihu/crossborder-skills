import { describe, expect, it } from 'vitest'

import { getInstallCommand } from './installation'

describe('getInstallCommand', () => {
    it('prefers the original command and uses reviewed instructions as fallback', () => {
        expect(getInstallCommand('```bash\nnpx original\n```', 'npx reviewed')).toBe('npx original')
        expect(getInstallCommand('No standard command', 'npx reviewed')).toBe('npx reviewed')
    })

    it('extracts a real command without executing it', () => {
        expect(getInstallCommand('```bash\nnpx skills add owner/repo\n```', '')).toBe('npx skills add owner/repo')
    })

    it('does not invent commands from prose or unknown code', () => {
        expect(getInstallCommand('Run the installer.\n```js\nconsole.log(1)\n```', '')).toBe('')
    })
})
