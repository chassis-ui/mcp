import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import GithubSlugger from 'github-slugger'

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

export interface Section {
  title: string
  anchor: string
  level: number
  // From its heading to the next heading of the same level or a higher one
  text: string
  // The headings it is inside, from the outermost, as they are written
  ancestors: string[]
}

// The sections of a Markdown file: every heading below level one that is not in a code block,
// with the anchor GitHub gives it. Not the generator's own function, and by lines where the
// generator counts characters
export function sections(markdown: string): Section[] {
  const slugger = new GithubSlugger()
  const lines = markdown.split('\n')
  const headings: { title: string; anchor: string; level: number; line: number }[] = []
  let fenced = false

  lines.forEach((line, index) => {
    if (/^(```|~~~)/.test(line)) fenced = !fenced
    const match = fenced ? null : line.match(/^(#{1,6}) +(.+?) *$/)
    if (match) {
      headings.push({
        title: match[2],
        anchor: slugger.slug(match[2]),
        level: match[1].length,
        line: index
      })
    }
  })

  return headings
    .map((heading, index) => {
      const next = headings.slice(index + 1).find((other) => other.level <= heading.level)
      const ancestors: string[] = []
      for (const other of headings.slice(0, index)) {
        ancestors.splice(Math.max(0, other.level - 2))
        if (other.level > 1 && other.level < heading.level) ancestors.push(lines[other.line])
      }

      return {
        title: heading.title,
        anchor: heading.anchor,
        level: heading.level,
        text: lines.slice(heading.line, next?.line).join('\n') + (next ? '\n' : ''),
        ancestors
      }
    })
    .filter((section) => section.level > 1)
}

// What comes before the first section of a reference: its level-one heading and what the file
// says about itself
export function introduction(markdown: string): string {
  const lines = body(markdown).split('\n')
  const first = lines.findIndex((line) => /^#{2,6} /.test(line))
  return lines.slice(0, first === -1 ? undefined : first).join('\n')
}

// The links of a Markdown file that name a section of a reference: `file.md#anchor`
export function sectionLinks(markdown: string): { file: string; anchor: string }[] {
  return [...markdown.matchAll(/\]\(\.\/(?:references\/)?([a-z-]+\.md)#([^)\s]+)\)/g)].map(
    ([, file, anchor]) => ({ file, anchor })
  )
}
