import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export function read(path: string): string {
  return readFileSync(join(root, path), 'utf-8')
}

export const { version } = JSON.parse(read('package.json')) as { version: string }

// Every Markdown file under a directory of the repository, as paths from the root
export function markdownFiles(dir: string): string[] {
  return readdirSync(join(root, dir), { recursive: true, encoding: 'utf-8' })
    .filter((file) => file.endsWith('.md'))
    .map((file) => join(dir, file))
    .sort()
}

// A Markdown file without its frontmatter. Not the server's own function: a test that
// used it would compare the server with itself
export function body(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n+/, '')
}

// The first level-one heading of a Markdown file
export function heading(markdown: string): string {
  const match = body(markdown).match(/^# .+$/m)
  if (!match) throw new Error('The file has no level-one heading')
  return match[0]
}

// The one line a SKILL.md gives a reference in its list of references, written as
// `- [<file>.md](./references/<file>.md) — <summary>`
export function summary(skill: string, path: string): string {
  const file = path.slice(path.lastIndexOf('/') + 1).replaceAll('.', '\\.')
  const match = skill.match(new RegExp(`^- \\[${file}\\]\\(\\./references/${file}\\) — (.+)$`, 'm'))
  if (!match) throw new Error(`${path} has no line in its SKILL.md`)
  return match[1].trim()
}
