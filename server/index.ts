import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { checkClasses, MODES } from './classes.js'
import { CONTENT, RESOURCES, VERSION } from './content.generated.js'

function stripFrontmatter(content: string): string {
  if (!content.startsWith('---')) return content
  const end = content.indexOf('\n---', 3)
  return end === -1 ? content : content.slice(end + 4).trimStart()
}

function text(path: string): string {
  const content = CONTENT[path]
  if (content === undefined) throw new Error(`${path} is in the registry but not in the content`)
  return content
}

// A skill bundle is SKILL.md followed by every reference of the skill, in the order of the
// registry, each without its frontmatter. Built once when the module loads, not on every call:
// the content never changes while the function runs
function buildSkillBundle(skill: string): string {
  return RESOURCES.filter((r) => r.name === skill || r.name.startsWith(`${skill}/`))
    .map((r) => `\n\n---\n## ${r.name}\n\n${stripFrontmatter(text(r.path))}`)
    .join('')
}

type Resource = (typeof RESOURCES)[number]
type Reference = Extract<Resource, { summary: string }>

// A reference carries the one-line summary its SKILL.md gives it; a skill does not
function isReference(resource: Resource): resource is Reference {
  return 'summary' in resource
}

// A section of a reference, as the generator writes it: a heading below level one, the anchor
// GitHub gives it, and the offsets of its text in the file, subsections included
interface Section {
  title: string
  anchor: string
  level: number
  start: number
  end: number
}

function sectionsOf(reference: Reference): readonly Section[] {
  return reference.sections
}

function fileOf(reference: Reference): string {
  return reference.path.slice(reference.path.lastIndexOf('/') + 1)
}

// A heading and an anchor compare equal whatever their case, dashes and punctuation
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

// A heading names its section unless another heading of the file has the same text; then only
// the anchor does, and the lists show it
function label(section: Section, all: readonly Section[]): string {
  const same = all.filter((other) => normalize(other.title) === normalize(section.title))
  return same.length > 1 ? `${section.title} (#${section.anchor})` : section.title
}

// The level-two sections of a reference, one per line with its size, each followed by the
// names of its level-three sections: what an agent chooses a section from
function sectionLines(reference: Reference): string[] {
  const all = sectionsOf(reference)

  return all
    .filter((section) => section.level === 2)
    .map((section) => {
      const size = Math.max(0.1, (section.end - section.start) / 1024).toFixed(1)
      const inner = all
        .filter((s) => s.level === 3 && s.start > section.start && s.end <= section.end)
        .map((s) => label(s, all))
      const subsections = inner.length > 0 ? `: ${inner.join('; ')}` : ''

      return `  - ${label(section, all)} (${size} KB)${subsections}`
    })
}

// The sections a value of the `section` input names: the one with that anchor, else every
// one whose heading or anchor reads the same. What is before a `#` is dropped, so a link
// `file.md#anchor` and a heading written with its hashes both work
function findSections(reference: Reference, wanted: string): Section[] {
  const all = sectionsOf(reference)
  const query = wanted.slice(wanted.lastIndexOf('#') + 1).trim()
  const exact = all.filter((section) => section.anchor === query)
  if (exact.length > 0) return exact

  const key = normalize(query)
  if (key === '') return []
  return all.filter(
    (section) => normalize(section.title) === key || normalize(section.anchor) === key
  )
}

// The sections a section is inside, from the outermost
function ancestorsOf(reference: Reference, section: Section): Section[] {
  return sectionsOf(reference).filter(
    (other) =>
      other.level < section.level && other.start < section.start && other.end >= section.end
  )
}

// The heading a section is under: of the section around it, or of the file
function parentOf(reference: Reference, section: Section): string {
  return ancestorsOf(reference, section).at(-1)?.title ?? reference.description
}

// Sections of a reference, each under the headings it is inside, after the introduction of
// their file: the level-one heading and the text before the first section, which says how the
// file is read (the placeholders of the class catalog, the rules every recipe follows). The
// introduction comes once, however many sections follow it. The sections come in the order of
// the file, each once; one that is inside another of the list comes with that one, and a
// heading two of them are under is written once
function sectionText(reference: Reference, wanted: readonly Section[]): string {
  const file = text(reference.path)
  const first = sectionsOf(reference)[0]
  const sections = [...new Set(wanted)]
    .sort((a, b) => a.start - b.start)
    .filter(
      (section, _, all) =>
        !all.some(
          (other) => other !== section && other.start <= section.start && other.end >= section.end
        )
    )
  const written = new Set<Section>()
  const parts = [stripFrontmatter(file.slice(0, first.start)).trim()]

  for (const section of sections) {
    for (const ancestor of ancestorsOf(reference, section)) {
      if (written.has(ancestor)) continue
      written.add(ancestor)
      parts.push(`${'#'.repeat(ancestor.level)} ${ancestor.title}`)
    }
    parts.push(file.slice(section.start, section.end).trim())
  }

  return `${parts.filter((part) => part !== '').join('\n\n')}\n`
}

// What the skill tools return unless asked for the bundle: SKILL.md, then an index of its
// references with what chassis_get_reference needs, the sections of each file included. The
// references are what a task may need, not what every task needs, and together they are
// several times the size of the instructions
function buildSkillIndex(skill: string): string {
  const instructions = stripFrontmatter(text(`skills/${skill}/SKILL.md`))
  const references = RESOURCES.filter(isReference).filter((r) =>
    r.name.startsWith(`${skill}/references/`)
  )
  const lines = references.map((r) => {
    const size = Math.max(1, Math.round(text(r.path).length / 1024))
    const line = `- \`${fileOf(r)}\` (${size} KB) — ${r.summary}. Title "${r.description}". Name \`${r.name}\``
    const sections = sectionLines(r)

    return sections.length > 0 ? `${line}. Sections:\n${sections.join('\n')}` : line
  })

  return [
    instructions.trimEnd(),
    '---',
    '## Fetching the references',
    'The instructions above link to the files of `./references/`. They are not included here: when the instructions send you to one, call `chassis_get_reference` with the name given below, and read what it returns before you go on.',
    'To read one part of a file, also pass `section`: a heading of the file, or the anchor of a link, so a link `file.md#anchor` in the instructions is fetched as `section: "anchor"` of that file. A section comes with its subsections, under the introduction of its file. Where the instructions link a section, fetch the section, not its file. When you need several sections of one file at the same step, pass them together as `sections`, a list of headings or anchors: one call, and the introduction comes once. The sections of each file are listed under it with their sizes; after a colon, the subsections, which can be fetched the same way.',
    lines.join('\n')
  ].join('\n\n')
}

const BUNDLES = new Map<string, string>(
  RESOURCES.filter((r) => !r.name.includes('/')).map((r) => [r.name, buildSkillBundle(r.name)])
)

const INDEXES = new Map<string, string>(
  RESOURCES.filter((r) => !r.name.includes('/')).map((r) => [r.name, buildSkillIndex(r.name)])
)

function bundle(skill: string): string {
  const content = BUNDLES.get(skill)
  if (content === undefined) throw new Error(`No skill ${skill} in the registry`)
  return content
}

function index(skill: string): string {
  const content = INDEXES.get(skill)
  if (content === undefined) throw new Error(`No skill ${skill} in the registry`)
  return content
}

// The input of the skill tools
const FULL = {
  full: z
    .boolean()
    .optional()
    .describe(
      'Also return every reference file of the skill, inline after the instructions, instead of the index of their names: several times the size. Default false'
    )
}

const PROMPT = stripFrontmatter(text('prompts/chassis-ui.prompt.md'))

// chassis_get_reference offers the reference files, not the skills
const REFERENCE_NAMES = RESOURCES.filter((r) => r.name.includes('/references/')).map(
  (r) => r.name
) as [string, ...string[]]

// A new server for every request: the SDK binds one transport to one server, and the stateless
// transport refuses a second request, so the handler cannot share either between requests.
// What the server serves is the module-level content above
export function createServer(): McpServer {
  const server = new McpServer({
    name: 'chassis-ui',
    version: VERSION
  })

  // Resources
  for (const { name, uri, description, path } of RESOURCES) {
    const content = text(path)
    server.registerResource(name, uri, { description, mimeType: 'text/markdown' }, async () => ({
      contents: [{ uri, text: content, mimeType: 'text/markdown' }]
    }))
  }

  // Prompts
  server.registerPrompt(
    'chassis-ui',
    { description: 'One-shot Chassis Figma design build or reconnect' },
    async () => ({
      messages: [{ role: 'user', content: { type: 'text', text: PROMPT } }]
    })
  )

  server.registerPrompt(
    'chassis-create-design',
    {
      description:
        'Load the chassis-create-design skill: build or update Figma screens using the Chassis UI library.'
    },
    async () => ({
      messages: [{ role: 'user', content: { type: 'text', text: bundle('chassis-create-design') } }]
    })
  )

  server.registerPrompt(
    'chassis-implement-design',
    {
      description:
        'Load the chassis-implement-design skill: implement Figma designs into code using Chassis UI CSS.'
    },
    async () => ({
      messages: [
        { role: 'user', content: { type: 'text', text: bundle('chassis-implement-design') } }
      ]
    })
  )

  // Tools. A skill tool returns the instructions and an index of the references; the
  // references come one at a time from chassis_get_reference, whole or by section, or all at
  // once with full: true
  server.registerTool(
    'chassis_create_design',
    {
      description:
        'Load the chassis-create-design skill: build or update Figma screens using the Chassis UI library. Returns the skill instructions and an index of its reference files and their sections, which are fetched on demand with chassis_get_reference.',
      inputSchema: FULL
    },
    async ({ full }) => ({
      content: [
        {
          type: 'text',
          text: full ? bundle('chassis-create-design') : index('chassis-create-design')
        }
      ]
    })
  )

  server.registerTool(
    'chassis_implement_design',
    {
      description:
        'Load the chassis-implement-design skill: implement Figma designs into production code using Chassis UI CSS. Returns the skill instructions and an index of its reference files and their sections, which are fetched on demand with chassis_get_reference.',
      inputSchema: FULL
    },
    async ({ full }) => ({
      content: [
        {
          type: 'text',
          text: full ? bundle('chassis-implement-design') : index('chassis-implement-design')
        }
      ]
    })
  )

  server.registerTool(
    'chassis_get_reference',
    {
      description:
        'Fetch one reference file of a Chassis UI skill by name, without its frontmatter, or one section of it, or several sections in one call. The skill tools list the names, what each file holds and its sections.',
      inputSchema: {
        name: z.enum(REFERENCE_NAMES).describe('Reference file to fetch'),
        section: z
          .string()
          .optional()
          .describe(
            'A heading of the file, or the anchor of a link `file.md#anchor`: returns that section, with its subsections and the introduction of the file, instead of the whole file. The skill tools list the sections of each file'
          ),
        sections: z
          .array(z.string())
          .optional()
          .describe(
            'Several sections of the file in one call, each a heading or an anchor as for `section`: returns them in the order of the file, under one introduction. Use it when a step needs more than one section of the same file'
          )
      }
    },
    async ({ name, section, sections }) => {
      const resource = RESOURCES.filter(isReference).find((r) => r.name === name)
      if (!resource) {
        return {
          content: [{ type: 'text', text: `Unknown reference: ${name}` }],
          isError: true
        }
      }

      // `section` and `sections` name sections the same way and add up; none is the whole file
      const wanted = [section, ...(sections ?? [])].filter(
        (value): value is string => value !== undefined && value.trim() !== ''
      )
      if (wanted.length === 0) {
        return { content: [{ type: 'text', text: stripFrontmatter(text(resource.path)) }] }
      }

      // No section, or a heading the file has more than once: the answer says what to ask for,
      // for every value that does not name one section, and returns none of the others
      const file = fileOf(resource)
      const found = wanted.map((value) => ({ value, matches: findSections(resource, value) }))
      const problems = found
        .filter(({ matches }) => matches.length !== 1)
        .map(({ value, matches }) =>
          matches.length === 0
            ? `\`${file}\` has no section "${value}".`
            : `\`${file}\` has ${matches.length} sections "${value}". Pass the anchor of one:\n${matches
                .map((s) => `  - \`${s.anchor}\`, in "${parentOf(resource, s)}"`)
                .join('\n')}`
        )
      if (problems.length > 0) {
        const missing = found.some(({ matches }) => matches.length === 0)
        const listing = missing ? [`Its sections:\n${sectionLines(resource).join('\n')}`] : []

        return {
          content: [{ type: 'text', text: [...problems, ...listing].join('\n') }],
          isError: true
        }
      }

      const result = sectionText(
        resource,
        found.map(({ matches }) => matches[0])
      )
      return { content: [{ type: 'text', text: result }] }
    }
  )

  // The class check of chassis-implement-design: the classes an agent wrote against the list
  // the catalog is generated from, so the agent reads the catalog by the section the answer
  // names instead of whole
  server.registerTool(
    'chassis_check_classes',
    {
      description:
        'Check class names against the Chassis CSS class catalog (css-classes.md of chassis-implement-design): returns the classes that do not exist in the given CSS mode, each with why and the catalog section to read, or one line when all exist. Pass class names, class attribute values or markup.',
      inputSchema: {
        classes: z
          .array(z.string())
          .describe(
            'Class names to check: one per item, or space-separated as in a class attribute, or markup, whose `class` attributes are read'
          ),
        mode: z
          .enum(MODES)
          .optional()
          .describe(
            'The CSS mode of the project: `native` (the compiled stylesheet, where a class takes the variant prefixes listed for its family) or `tailwind` (the Chassis Tailwind entry, where every Tailwind variant applies to a Chassis utility). Default native'
          )
      }
    },
    async ({ classes, mode }) => {
      const { text, isError } = checkClasses(classes, mode ?? 'native')
      return { content: [{ type: 'text', text }], isError }
    }
  )

  return server
}
