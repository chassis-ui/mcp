// Reads the Markdown files of skills/ and prompts/ and the version of package.json, and writes
// server/content.generated.ts: the text of every file, the registry of the resources the server
// derives its resources, prompts and tools from, and the version. The Vercel function reads
// nothing from disk at runtime, and a file of skills/ cannot be left out of the server: the
// registry is made from the same walk as the content.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'server/content.generated.ts')
const PROMPT = 'prompts/chassis-ui.prompt.md'

const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'))

/**
 * Every Markdown file under a directory, as paths from the root with forward slashes on every
 * platform: the registry and the keys of CONTENT are compared as strings
 * @param {string} dir - The directory, from the root
 * @returns {string[]} The paths, sorted
 */
function collectMd(dir) {
  const abs = join(ROOT, dir)
  const results = []
  for (const entry of readdirSync(abs).sort()) {
    const full = join(abs, entry)
    if (statSync(full).isDirectory()) {
      results.push(...collectMd(join(dir, entry)))
    } else if (entry.endsWith('.md')) {
      results.push(relative(ROOT, full).split(sep).join('/'))
    }
  }
  return results
}

/**
 * The order of the registry, which is the order of a skill bundle: the skills by name, and
 * within a skill SKILL.md before its references
 * @param {string} a - A path of skills/
 * @param {string} b - Another
 * @returns {number} Negative when a comes first
 */
function registryOrder(a, b) {
  const [skillA, skillB] = [a, b].map((path) => path.split('/')[1])
  if (skillA !== skillB) return skillA < skillB ? -1 : 1

  const [isSkillA, isSkillB] = [a, b].map((path) => path.endsWith('/SKILL.md'))
  if (isSkillA !== isSkillB) return isSkillA ? -1 : 1

  return a < b ? -1 : 1
}

/**
 * The frontmatter of a Markdown file, parsed, or an empty object when it has none
 * @param {string} content - The file
 * @returns {Record<string, unknown>}
 */
function frontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/)
  const parsed = match ? parseYaml(match[1]) : undefined
  return typeof parsed === 'object' && parsed !== null ? parsed : {}
}

/**
 * What a client is shown for a resource: the description of the frontmatter (a skill), or the
 * text of the level-one heading (a reference)
 * @param {string} path - The file, from the root
 * @param {string} content - The file
 * @returns {string}
 */
function describe(path, content) {
  const { description } = frontmatter(content)
  if (typeof description === 'string' && description.trim()) return description.trim()

  const heading = content.match(/^# (.+)$/m)
  if (heading) return heading[1].trim()

  throw new Error(`${path} has no frontmatter description and no level-one heading`)
}

const skillPaths = collectMd('skills').sort(registryOrder)
const paths = [PROMPT, ...skillPaths]
const content = Object.fromEntries(paths.map((p) => [p, readFileSync(join(ROOT, p), 'utf-8')]))

// skills/<skill>/SKILL.md is the resource <skill>, skills/<skill>/references/<file>.md is
// <skill>/references/<file>
const resources = skillPaths.map((path) => {
  const name = path
    .replace(/^skills\//, '')
    .replace(/\/SKILL\.md$/, '')
    .replace(/\.md$/, '')

  return {
    name,
    uri: `chassis://skills/${name}`,
    description: describe(path, content[path]),
    path
  }
})

const resourceEntries = resources.map(
  (resource) =>
    `  {\n${Object.entries(resource)
      .map(([key, value]) => `    ${key}: ${JSON.stringify(value)}`)
      .join(',\n')}\n  }`
)

const contentEntries = paths.map((p) => {
  const escaped = content[p].replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
  return `  '${p}': \`${escaped}\``
})

const output = `// AUTO-GENERATED — do not edit. Run \`pnpm generate\` to regenerate.
export const VERSION = '${version}'

// Every Markdown file of skills/, in the order of the skill bundles: a SKILL.md, then its
// references. The description is the frontmatter description of a skill and the level-one
// heading of a reference. Typed as a tuple of literals so the enum of chassis_get_reference
// can be made from the names.
export const RESOURCES = [
${resourceEntries.join(',\n')}
] as const

export const CONTENT: Record<string, string> = {
${contentEntries.join(',\n')}
}
`

writeFileSync(OUT, output, 'utf-8')
console.log(`Generated ${OUT} with ${paths.length} files and ${resources.length} resources`)
