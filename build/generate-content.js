// Reads the Markdown files of skills/ and prompts/ and the version of package.json, and writes
// server/content.generated.ts: the text of every file, the registry of the resources the server
// derives its resources, prompts and tools from, and the version. The Vercel function reads
// nothing from disk at runtime, and a file of skills/ cannot be left out of the server: the
// registry is made from the same walk as the content. The registry also holds where each section
// of a reference starts and ends, so the server can return one section without parsing Markdown.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import GithubSlugger from 'github-slugger'
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

/**
 * The one line a SKILL.md gives a reference in its list of references, written as
 * `- [<file>.md](./references/<file>.md) — <summary>`. The skill tools show it in their index
 * of the references, so an agent knows what each file holds before it fetches one. A
 * reference without such a line fails the generator: an index that lists a file with nothing
 * on it is a worse tool, and nothing else would notice
 * @param {string} reference - The reference file, from the root
 * @param {string} skill - Its SKILL.md, from the root
 * @param {string | undefined} content - The text of the SKILL.md
 * @returns {string}
 */
function summarize(reference, skill, content) {
  if (content === undefined) throw new Error(`${reference} has no ${skill}`)

  const file = reference.slice(reference.lastIndexOf('/') + 1)
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const line = new RegExp(`^- \\[${escaped}\\]\\(\\./references/${escaped}\\) — (.+)$`, 'm')
  const match = content.match(line)
  if (match && match[1].trim()) return match[1].trim()

  throw new Error(
    `${skill} has no line "- [${file}](./references/${file}) — <summary>" for ${reference}`
  )
}

/**
 * The sections of a reference: every heading below level one, with the anchor GitHub gives it
 * (the one a link `file.md#anchor` of a skill carries, and build/check-links.js checks) and
 * the offsets of its text in the file, from its heading to the next heading of the same level
 * or a higher one. So a section holds its subsections. A heading inside a code block is not one
 * @param {string} content - The file
 * @returns {{ title: string, anchor: string, level: number, start: number, end: number }[]}
 */
function sections(content) {
  const slugger = new GithubSlugger()
  const headings = []
  let fence = null
  let offset = 0

  for (const line of content.split('\n')) {
    const marker = line.match(/^(```|~~~)/)?.[1]
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/)

    if (marker) {
      if (fence === null) fence = marker
      else if (fence === marker) fence = null
    } else if (fence === null && heading) {
      headings.push({
        title: heading[2],
        // The level-one heading too: a later heading of the same text gets a numbered anchor
        anchor: slugger.slug(heading[2].replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')),
        level: heading[1].length,
        start: offset
      })
    }
    offset += line.length + 1
  }

  return headings
    .map((heading, index) => {
      const next = headings.slice(index + 1).find((other) => other.level <= heading.level)
      return { ...heading, end: next ? next.start : content.length }
    })
    .filter((heading) => heading.level > 1)
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

  const resource = {
    name,
    uri: `chassis://skills/${name}`,
    description: describe(path, content[path]),
    path
  }

  // A reference also carries the line its SKILL.md gives it, and its sections
  if (name.includes('/references/')) {
    const skill = `skills/${path.split('/')[1]}/SKILL.md`
    return {
      ...resource,
      summary: summarize(path, skill, content[skill]),
      sections: sections(content[path])
    }
  }

  return resource
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
// heading of a reference; a reference also has the summary its SKILL.md gives it, and its
// sections: each heading below level one with its anchor, its level and the offsets of its text
// in the file. Typed as a tuple of literals so the enum of chassis_get_reference can be made
// from the names.
export const RESOURCES = [
${resourceEntries.join(',\n')}
] as const

export const CONTENT: Record<string, string> = {
${contentEntries.join(',\n')}
}
`

writeFileSync(OUT, output, 'utf-8')
console.log(`Generated ${OUT} with ${paths.length} files and ${resources.length} resources`)
