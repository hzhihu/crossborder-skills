import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
    ...nextVitals,
    ...nextTypeScript,
    globalIgnores([
        '.next/**',
        '.cache/**',
        'coverage/**',
        'node_modules/**',
        'design/prototypes/**',
        'next-env.d.ts',
        'src/payload-types.ts',
    ]),
])
