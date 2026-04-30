// Reads all skill/prompt markdown files and generates api/_content.generated.ts
// so the Vercel function has zero runtime filesystem dependencies.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'api/_content.generated.ts')

const PATHS = ['prompts/chassis-ui.prompt.md', ...collectMd('skills')]

function collectMd(dir) {
  const abs = join(ROOT, dir)
  const results = []
  for (const entry of readdirSync(abs)) {
    const full = join(abs, entry)
    if (statSync(full).isDirectory()) {
      results.push(...collectMd(join(dir, entry)))
    } else if (entry.endsWith('.md')) {
      results.push(relative(ROOT, full))
    }
  }
  return results
}

const entries = PATHS.map((p) => {
  const content = readFileSync(join(ROOT, p), 'utf-8')
  const escaped = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
  return `  '${p}': \`${escaped}\``
})

const output = `// AUTO-GENERATED — do not edit. Run \`pnpm run generate\` to regenerate.
export const CONTENT: Record<string, string> = {
${entries.join(',\n')}
}
`

writeFileSync(OUT, output, 'utf-8')
console.log(`Generated ${OUT} with ${PATHS.length} files`)
