// The contract of the MCP server: what it lists and what each tool, prompt and resource
// returns, through the SDK's client on an in-memory transport. The snapshot holds the
// names, descriptions and input schemas a client is shown; a change to it is a change for
// every agent that uses the server.

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createServer } from '../server/index.js'
import { RESOURCES } from '../server/content.generated.js'
import { body, heading, read, version } from './helpers.js'

const SKILLS = ['chassis-create-design', 'chassis-implement-design']
const REFERENCES = RESOURCES.filter((resource) => resource.name.includes('/references/'))

const client = new Client({ name: 'chassis-mcp-tests', version: '0.0.0' })

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
  const files = RESOURCES.filter(
    (resource) => resource.name === skill || resource.name.startsWith(`${skill}/`)
  ).map((resource) => read(resource.path))

  // Phase 7 of the plan changes this on purpose: the tool returns SKILL.md and an index
  test('the tool returns SKILL.md and every reference, without frontmatter', async () => {
    const bundle = text(await client.callTool({ name: tool, arguments: {} }))

    expect(files.length).toBeGreaterThan(1)
    for (const file of files) expect(bundle).toContain(body(file))
    expect(bundle).not.toMatch(/^name: /m)

    // SKILL.md first, then the references in the order of the registry
    const positions = files.map((file) => bundle.indexOf(heading(file)))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(positions[0]).toBeGreaterThanOrEqual(0)
  })

  test('the prompt returns the same text as one user message', async () => {
    const bundle = text(await client.callTool({ name: tool, arguments: {} }))
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
