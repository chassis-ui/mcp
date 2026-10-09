// The contract of the MCP server: what it lists and what each tool, prompt and resource
// returns, through the SDK's client on an in-memory transport. The snapshot holds the
// names, descriptions and input schemas a client is shown; a change to it is a change for
// every agent that uses the server.

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createServer } from '../server/index.js'
import { RESOURCES } from '../server/content.generated.js'
import {
  body,
  heading,
  introduction,
  read,
  sectionLinks,
  sections,
  summary,
  version
} from './helpers.js'

const SKILLS = ['chassis-create-design', 'chassis-implement-design']
const REFERENCES = RESOURCES.filter((resource) => resource.name.includes('/references/'))

// The reference whose file has that name in the skill of a path
function referenceOf(path: string, file: string) {
  const [, skill] = path.split('/')
  return REFERENCES.find((reference) => reference.path === `skills/${skill}/references/${file}`)
}

// A heading that another section of the file has too is told apart by its anchor
function repeated(title: string, all: { title: string }[]): boolean {
  return all.filter((other) => other.title === title).length > 1
}

const client = new Client({ name: 'chassis-mcp-tests', version: '0.0.0' })

function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// The text of a result that holds one text block
function text(result: Awaited<ReturnType<Client['callTool']>>): string {
  const content = result.content as { type: string; text: string }[]

  expect(content).toHaveLength(1)
  expect(content[0].type).toBe('text')
  return content[0].text
}

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

  await createServer().connect(serverTransport)
  await client.connect(clientTransport)
})

afterAll(async () => {
  await client.close()
})

describe('server', () => {
  test('reports its name and the version of package.json', () => {
    expect(client.getServerVersion()).toMatchObject({ name: 'chassis-ui', version })
  })

  test('lists its tools', async () => {
    const { tools } = await client.listTools()

    expect(
      tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }))
    ).toMatchSnapshot()
  })

  test('lists its prompts', async () => {
    const { prompts } = await client.listPrompts()

    expect(
      prompts.map((prompt) => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments
      }))
    ).toMatchSnapshot()
  })

  test('lists its resources', async () => {
    const { resources } = await client.listResources()

    expect(
      resources.map(({ name, uri, description, mimeType }) => ({
        name,
        uri,
        description,
        mimeType
      }))
    ).toMatchSnapshot()
  })
})

describe.each(SKILLS)('%s', (skill) => {
  const tool = skill.replaceAll('-', '_')
  const own = RESOURCES.filter(
    (resource) => resource.name === skill || resource.name.startsWith(`${skill}/`)
  )
  const files = own.map((resource) => read(resource.path))
  const references = own.filter((resource) => resource.name.includes('/references/'))
  const instructions = read(`skills/${skill}/SKILL.md`)

  // The instructions, then an index of the references: for each its file, its size, the line
  // the SKILL.md gives it, its title and its name for chassis_get_reference
  test('the tool returns SKILL.md without frontmatter and an index of its references', async () => {
    const result = text(await client.callTool({ name: tool, arguments: {} }))

    expect(references.length).toBeGreaterThan(1)
    expect(result.startsWith(body(instructions).trimEnd())).toBe(true)
    expect(result).not.toMatch(/^name: /m)
    expect(result).toContain('`chassis_get_reference`')
    for (const { name, path } of references) {
      const file = read(path)

      expect(result).toContain(`\`${path.slice(path.lastIndexOf('/') + 1)}\``)
      expect(result).toContain(`(${Math.round(file.length / 1024)} KB)`)
      expect(result).toContain(summary(instructions, path))
      expect(result).toContain(heading(file).slice('# '.length))
      expect(result).toContain(`\`${name}\``)
      expect(result).not.toContain(body(file))
    }
  })

  // Under each reference its level-two sections with their sizes, and after a colon the
  // level-three sections of each: what an agent chooses a section from
  test('the index lists the sections of each reference', async () => {
    const result = text(await client.callTool({ name: tool, arguments: {} }))

    expect(result).toContain('`section`')
    for (const { path } of references) {
      const all = sections(read(path))

      expect(all.length).toBeGreaterThan(0)
      for (const { title, anchor, level, text: own } of all) {
        const label = repeated(title, all) ? `${title} (#${anchor})` : title
        const size = (own.length / 1024).toFixed(1)

        if (level === 2) expect(result).toMatch(new RegExp(`^  - ${escape(label)} \\(`, 'm'))
        if (level === 2 && size !== '0.0') expect(result).toContain(`  - ${label} (${size} KB)`)
        if (level === 3) expect(result).toMatch(new RegExp(`[:;] ${escape(label)}(;|$)`, 'm'))
      }
    }
  })

  // SKILL.md of chassis-create-design is 14 KB by itself; the index adds about 3 KB
  test('the index response is under 40 KB', async () => {
    const result = text(await client.callTool({ name: tool, arguments: {} }))

    expect(result.length).toBeLessThan(40 * 1024)
  })

  test('full: false returns the same as no input', async () => {
    const withInput = text(await client.callTool({ name: tool, arguments: { full: false } }))
    const without = text(await client.callTool({ name: tool, arguments: {} }))

    expect(withInput).toBe(without)
  })

  test('full: true returns SKILL.md and every reference, without frontmatter', async () => {
    const bundle = text(await client.callTool({ name: tool, arguments: { full: true } }))

    expect(files.length).toBeGreaterThan(1)
    for (const file of files) expect(bundle).toContain(body(file))
    expect(bundle).not.toMatch(/^name: /m)

    // SKILL.md first, then the references in the order of the registry
    const positions = files.map((file) => bundle.indexOf(heading(file)))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(positions[0]).toBeGreaterThanOrEqual(0)
  })

  // A prompt is the user's explicit choice: it keeps the whole skill
  test('the prompt returns the full bundle as one user message', async () => {
    const bundle = text(await client.callTool({ name: tool, arguments: { full: true } }))
    const { messages } = await client.getPrompt({ name: skill })

    expect(messages).toEqual([{ role: 'user', content: { type: 'text', text: bundle } }])
  })
})

describe('chassis-ui prompt', () => {
  test('returns the prompt file without its frontmatter as one user message', async () => {
    const { messages } = await client.getPrompt({ name: 'chassis-ui' })

    expect(messages).toEqual([
      {
        role: 'user',
        content: { type: 'text', text: body(read('prompts/chassis-ui.prompt.md')) }
      }
    ])
  })
})

describe('chassis_get_reference', () => {
  test.each(REFERENCES)('returns $name without frontmatter', async ({ name, path }) => {
    const result = await client.callTool({ name: 'chassis_get_reference', arguments: { name } })

    expect(result.isError).toBeFalsy()
    expect(text(result)).toBe(body(read(path)))
  })

  test('answers a name it does not know with an error that lists the names', async () => {
    const result = await client.callTool({
      name: 'chassis_get_reference',
      arguments: { name: 'chassis-create-design/references/missing' }
    })

    expect(result.isError).toBe(true)
    expect(text(result)).toContain('Invalid arguments for tool chassis_get_reference')
    expect(text(result)).toContain(REFERENCES[0].name)
  })

  // The introduction of the file, the headings the section is inside, then the section with
  // its subsections
  test.each(REFERENCES)('returns each section of $name by its anchor', async ({ name, path }) => {
    const file = read(path)

    for (const { anchor, ancestors, text: own } of sections(file)) {
      const result = await client.callTool({
        name: 'chassis_get_reference',
        arguments: { name, section: anchor }
      })

      expect(result.isError, anchor).toBeFalsy()
      expect(text(result), anchor).toBe(
        `${[introduction(file).trim(), ...ancestors, own.trim()].join('\n\n')}\n`
      )
    }
  })

  // By the heading as it is written, in another case, with its hashes, without its
  // punctuation, and by the anchor as a link carries it
  test.each(REFERENCES)('returns a section of $name by its heading', async ({ name, path }) => {
    const all = sections(read(path))
    const file = path.slice(path.lastIndexOf('/') + 1)
    const call = async (section: string) =>
      client.callTool({ name: 'chassis_get_reference', arguments: { name, section } })

    for (const { title, anchor, level } of all.filter(({ title }) => !repeated(title, all))) {
      const byAnchor = text(await call(anchor))

      for (const section of [
        title,
        title.toUpperCase(),
        `${'#'.repeat(level)} ${title}`,
        title.replace(/[^\p{L}\p{N} ]+/gu, ' '),
        `#${anchor}`,
        `${file}#${anchor}`
      ]) {
        const result = await call(section)

        expect(result.isError, section).toBeFalsy()
        expect(text(result), section).toBe(byAnchor)
      }
    }
  })

  // An agent passes the anchor of a link it reads in a skill
  test('returns a section for every link of the skills that names one', async () => {
    const links = RESOURCES.flatMap(({ path }) =>
      sectionLinks(read(path)).map((link) => ({ ...link, from: path }))
    )

    expect(links.length).toBeGreaterThan(10)
    for (const { file, anchor, from } of links) {
      const reference = referenceOf(from, file)
      const result = await client.callTool({
        name: 'chassis_get_reference',
        arguments: { name: reference?.name, section: `${file}#${anchor}` }
      })
      const section = sections(read(reference?.path ?? '')).find((s) => s.anchor === anchor)

      expect(result.isError, `${from}: ${file}#${anchor}`).toBeFalsy()
      expect(text(result)).toContain(section?.text.trim())
    }
  })

  test('a section is smaller than its file', async () => {
    for (const { name, path } of REFERENCES) {
      const [{ anchor }] = sections(read(path))
      const result = await client.callTool({
        name: 'chassis_get_reference',
        arguments: { name, section: anchor }
      })

      expect(text(result).length, name).toBeLessThan(body(read(path)).length)
    }
  })

  test.each(['', '  '])('returns the whole file for the section "%s"', async (section) => {
    const { name, path } = REFERENCES[0]
    const result = await client.callTool({
      name: 'chassis_get_reference',
      arguments: { name, section }
    })

    expect(result.isError).toBeFalsy()
    expect(text(result)).toBe(body(read(path)))
  })

  test('answers a section the file does not have with an error that lists its sections', async () => {
    for (const { name, path } of REFERENCES) {
      const result = await client.callTool({
        name: 'chassis_get_reference',
        arguments: { name, section: 'No such section' }
      })

      expect(result.isError, name).toBe(true)
      expect(text(result)).toContain(`\`${path.slice(path.lastIndexOf('/') + 1)}\``)
      expect(text(result)).toContain('"No such section"')
      for (const { title, level } of sections(read(path))) {
        if (level === 2) expect(text(result), name).toContain(`  - ${title}`)
      }
    }
  })

  // "Forms" is a list of components and a way to compose them in the same file. The anchor
  // of a link is never ambiguous; a heading can be, and the first is not a safe guess
  test('answers a heading the file has twice with an error that lists the anchors', async () => {
    const twice = REFERENCES.flatMap(({ name, path }) => {
      const all = sections(read(path))
      return all.filter(({ title }) => repeated(title, all)).map((section) => ({ name, section }))
    })

    // The files of today have such headings; without one this test says nothing
    expect(twice.length).toBeGreaterThan(0)
    for (const { name, section } of twice) {
      const result = await client.callTool({
        name: 'chassis_get_reference',
        arguments: { name, section: section.title }
      })

      expect(result.isError, section.title).toBe(true)
      expect(text(result)).toContain(`\`${section.anchor}\``)
      expect(text(result)).not.toContain(section.text.trim())
    }
  })

  // A skill is not a reference: the skill tools return it
  test('does not offer the skills themselves', async () => {
    const result = await client.callTool({
      name: 'chassis_get_reference',
      arguments: { name: SKILLS[0] }
    })

    expect(result.isError).toBe(true)
  })
})

describe('resources', () => {
  test.each([...RESOURCES])('$uri returns the file as it is on disk', async ({ uri, path }) => {
    const { contents } = await client.readResource({ uri })

    expect(contents).toEqual([{ uri, mimeType: 'text/markdown', text: read(path) }])
  })
})
