// Checks the skills and the prompts as the lint checks code: nothing but an agent reads
// them otherwise, and an agent does not report what it could not follow.
//
// For every skills/<name>/:
//   - SKILL.md opens with YAML frontmatter that parses; `name` is the directory name and
//     `description` a string within the limits below; no key a client does not know
//   - SKILL.md and each file of references/ have one level-one heading; a reference has no
//     frontmatter
//   - every Markdown file a file of the skill names is a file of the skill, and SKILL.md
//     names every file of references/, so an agent is sent to each and to none that is gone
//   - every row of a table has the cells of its header
// For every prompts/*.md: frontmatter with a `description`, the same table check, and every
// Markdown file it names is a file of a skill.
// For the generated class catalog: its banner names the installed @chassis-ui/css, which
// package.json pins to one version.
//
// Exits 1 and lists every problem when one is found. Run it from the root of the repository.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

// The Agent Skills specification (https://agentskills.io/specification, read 2026-10-09):
// `name` is 1 to 64 characters, lowercase letters, numbers and single hyphens, and matches
// the directory; `description` is 1 to 1024 characters.
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const NAME_MAX = 64
const DESCRIPTION_MAX = 1024

// Claude Code (https://code.claude.com/docs/en/skills, read 2026-10-09) cuts `description`
// and `when_to_use` together at 1,536 characters in its skill listing, and ignores a key it
// does not know. The keys it reads:
const LISTING_MAX = 1536
const SKILL_KEYS = new Set([
  'name',
  'description',
  'when_to_use',
  'argument-hint',
  'arguments',
  'disable-model-invocation',
  'user-invocable',
  'allowed-tools',
  'disallowed-tools',
  'model',
  'effort',
  'context',
  'agent',
  'background',
  'hooks',
  'paths',
  'shell',
  'metadata',
  'license',
  'compatibility'
])

const CATALOG = 'skills/chassis-implement-design/references/css-classes.md'
const BANNER_RE = /AUTO-GENERATED from @chassis-ui\/css (\S+) by /

const problems = []

function report(file, problem) {
  problems.push(`${file}: ${problem}`)
}

function read(file) {
  return readFileSync(file, 'utf8')
}

function markdownIn(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .sort()
}

function stripCodeBlocks(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '')
}

/**
 * Splits a Markdown file into its frontmatter and its body
 * @param {string} file - The file, for the report
 * @param {string} markdown - Its text
 * @returns {{ data: Record<string, unknown> | null, body: string }} The parsed frontmatter,
 *   null when the file has none or it does not parse
 */
function frontmatter(file, markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return { data: null, body: markdown }

  const body = markdown.slice(match[0].length)
  try {
    const data = parse(match[1])
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      report(file, 'the frontmatter is not a map of keys')
      return { data: null, body }
    }

    return { data, body }
  } catch (error) {
    report(file, `the frontmatter does not parse: ${error.message.split('\n')[0]}`)
    return { data: null, body }
  }
}

function checkHeading(file, body) {
  const headings = stripCodeBlocks(body).match(/^# .+$/gm) ?? []
  if (headings.length !== 1) {
    report(file, `has ${headings.length} level-one headings, not one`)
  }
}

// A pipe that is not escaped ends a cell, inside a code span too
function cells(row) {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/).length
}

function checkTables(file, body) {
  const lines = stripCodeBlocks(body).split('\n')

  for (let index = 1; index < lines.length; index++) {
    // The delimiter row, under the header
    if (!/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(lines[index])) continue
    if (!lines[index - 1].includes('|')) continue

    const expected = cells(lines[index])
    for (let row = index - 1; row < lines.length && lines[row].includes('|'); row++) {
      if (cells(lines[row]) !== expected) {
        report(
          file,
          `a table row has ${cells(lines[row])} cells where its header has ${expected}; write a pipe inside a cell as \\|: ${lines[row].trim().slice(0, 60)}…`
        )
      }
    }
  }
}

// The names of the Markdown files a text names: `references/tokens.md`, `tokens.md`
function namedFiles(markdown) {
  return [...new Set(markdown.match(/[A-Za-z0-9_-]+\.md\b/g) ?? [])]
}

function checkSkill(name) {
  const directory = path.join('skills', name)
  const skillFile = path.join(directory, 'SKILL.md')

  if (!existsSync(skillFile)) {
    report(directory, 'has no SKILL.md')
    return []
  }

  const references = markdownIn(path.join(directory, 'references'))
  const own = new Set(['SKILL.md', ...references])
  const skill = read(skillFile)
  const { data, body } = frontmatter(skillFile, skill)

  if (!data && !skill.startsWith('---\n')) {
    report(skillFile, 'does not open with frontmatter')
  }

  if (data) {
    for (const key of Object.keys(data)) {
      if (!SKILL_KEYS.has(key)) report(skillFile, `unknown frontmatter key "${key}"`)
    }

    if (data.name !== name) {
      report(skillFile, `\`name\` is "${data.name}", not the directory name "${name}"`)
    }

    if (!NAME_RE.test(name) || name.length > NAME_MAX) {
      report(
        skillFile,
        `the name must be 1 to ${NAME_MAX} lowercase letters, numbers and single hyphens`
      )
    }

    if (typeof data.description !== 'string' || data.description.trim() === '') {
      report(skillFile, '`description` is missing or not a string')
    } else {
      const listing = data.description.length + String(data.when_to_use ?? '').length
      if (data.description.length > DESCRIPTION_MAX) {
        report(
          skillFile,
          `\`description\` has ${data.description.length} characters, more than ${DESCRIPTION_MAX}`
        )
      }

      if (listing > LISTING_MAX) {
        report(
          skillFile,
          `\`description\` and \`when_to_use\` have ${listing} characters, more than ${LISTING_MAX}`
        )
      }
    }
  }

  checkHeading(skillFile, body)
  checkTables(skillFile, body)

  for (const file of namedFiles(skill)) {
    if (!own.has(file)) report(skillFile, `names ${file}, which is not a file of the skill`)
  }

  for (const reference of references) {
    const file = path.join(directory, 'references', reference)
    const text = read(file)

    if (text.startsWith('---\n')) report(file, 'a reference file has no frontmatter')
    if (!namedFiles(skill).includes(reference)) report(skillFile, `does not name ${reference}`)

    checkHeading(file, text)
    // The catalog is written by its generator, whose tests check its tables
    if (file !== CATALOG) checkTables(file, text)

    for (const named of namedFiles(text)) {
      if (!own.has(named)) report(file, `names ${named}, which is not a file of the skill`)
    }
  }

  return [...own]
}

function checkPrompt(name, skillFiles) {
  const file = path.join('prompts', name)
  const text = read(file)
  const { data, body } = frontmatter(file, text)

  if (!data) {
    if (!text.startsWith('---\n')) report(file, 'does not open with frontmatter')
  } else if (typeof data.description !== 'string' || data.description.trim() === '') {
    report(file, '`description` is missing or not a string')
  }

  checkHeading(file, body)
  checkTables(file, body)

  for (const named of namedFiles(body)) {
    if (!skillFiles.has(named)) report(file, `names ${named}, which is not a file of a skill`)
  }
}

function checkCatalog() {
  if (!existsSync(CATALOG)) return

  const banner = BANNER_RE.exec(read(CATALOG))
  const pinned = JSON.parse(read('package.json')).devDependencies?.['@chassis-ui/css']
  const installed = JSON.parse(read('node_modules/@chassis-ui/css/package.json')).version

  if (!banner) {
    report(CATALOG, 'has no AUTO-GENERATED banner: it was not written by its generator')
    return
  }

  if (!/^\d+\.\d+\.\d+/.test(pinned ?? '')) {
    report(
      'package.json',
      `@chassis-ui/css is "${pinned}", not one version: the catalog is that of one stylesheet`
    )
  }

  if (banner[1] !== installed) {
    report(
      CATALOG,
      `is generated from @chassis-ui/css ${banner[1]}, and ${installed} is installed; run \`pnpm generate\``
    )
  }
}

const skills = readdirSync('skills', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const skillFiles = new Set(skills.flatMap((name) => checkSkill(name)))
const prompts = markdownIn('prompts')

for (const prompt of prompts) checkPrompt(prompt, skillFiles)
checkCatalog()

if (problems.length > 0) {
  console.error(`${problems.length} problem${problems.length === 1 ? '' : 's'}:`)
  for (const line of problems) {
    console.error(`  ${line}`)
  }

  process.exit(1)
}

console.log(`${skills.length} skills and ${prompts.length} prompts are valid.`)
