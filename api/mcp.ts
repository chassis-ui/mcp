import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { z } from 'zod'
import { CONTENT } from './_content.generated.js'

const RESOURCES = [
  {
    name: 'chassis-create-design',
    uri: 'chassis://skills/chassis-create-design',
    description: 'Skill: build or update Figma screens using the Chassis UI library',
    path: 'skills/chassis-create-design/SKILL.md'
  },
  {
    name: 'chassis-create-design/references/components',
    uri: 'chassis://skills/chassis-create-design/references/components',
    description: 'Chassis component catalog reference for Figma design',
    path: 'skills/chassis-create-design/references/components.md'
  },
  {
    name: 'chassis-create-design/references/patterns',
    uri: 'chassis://skills/chassis-create-design/references/patterns',
    description: 'Chassis layout and composition patterns for Figma design',
    path: 'skills/chassis-create-design/references/patterns.md'
  },
  {
    name: 'chassis-create-design/references/tokens',
    uri: 'chassis://skills/chassis-create-design/references/tokens',
    description: 'Chassis design token namespaces reference',
    path: 'skills/chassis-create-design/references/tokens.md'
  },
  {
    name: 'chassis-create-design/references/typography',
    uri: 'chassis://skills/chassis-create-design/references/typography',
    description: 'Chassis typography reference for Figma design',
    path: 'skills/chassis-create-design/references/typography.md'
  },
  {
    name: 'chassis-create-design/references/workflow',
    uri: 'chassis://skills/chassis-create-design/references/workflow',
    description: 'Chassis design workflow reference',
    path: 'skills/chassis-create-design/references/workflow.md'
  },
  {
    name: 'chassis-implement-design',
    uri: 'chassis://skills/chassis-implement-design',
    description: 'Skill: implement Figma designs into code using Chassis UI CSS',
    path: 'skills/chassis-implement-design/SKILL.md'
  },
  {
    name: 'chassis-implement-design/references/components',
    uri: 'chassis://skills/chassis-implement-design/references/components',
    description: 'Chassis component reference for code implementation',
    path: 'skills/chassis-implement-design/references/components.md'
  },
  {
    name: 'chassis-implement-design/references/css-classes',
    uri: 'chassis://skills/chassis-implement-design/references/css-classes',
    description: 'Chassis CSS class reference',
    path: 'skills/chassis-implement-design/references/css-classes.md'
  },
  {
    name: 'chassis-implement-design/references/patterns',
    uri: 'chassis://skills/chassis-implement-design/references/patterns',
    description: 'Chassis implementation patterns reference',
    path: 'skills/chassis-implement-design/references/patterns.md'
  },
  {
    name: 'chassis-implement-design/references/tokens',
    uri: 'chassis://skills/chassis-implement-design/references/tokens',
    description: 'Chassis token-to-CSS mapping reference',
    path: 'skills/chassis-implement-design/references/tokens.md'
  },
  {
    name: 'chassis-implement-design/references/workflow',
    uri: 'chassis://skills/chassis-implement-design/references/workflow',
    description: 'Chassis implementation workflow reference',
    path: 'skills/chassis-implement-design/references/workflow.md'
  }
] as const

function stripFrontmatter(content: string): string {
  if (!content.startsWith('---')) return content
  const end = content.indexOf('\n---', 3)
  return end === -1 ? content : content.slice(end + 4).trimStart()
}

function createServer(): McpServer {
  const server = new McpServer({
    name: 'chassis-ui',
    version: '0.1.5'
  })

  for (const resource of RESOURCES) {
    const content = CONTENT[resource.path] ?? ''
    const { uri, name, description } = resource
    server.resource(name, uri, { description, mimeType: 'text/markdown' }, async () => ({
      contents: [{ uri, text: content, mimeType: 'text/markdown' }]
    }))
  }

  // Top-level "one-shot" prompt
  const promptRaw = CONTENT['prompts/chassis-ui.prompt.md'] ?? ''
  const promptContent = stripFrontmatter(promptRaw)

  // Helper: build the full skill bundle (SKILL.md + all reference files)
  const buildSkillBundle = (skillPrefix: string): string =>
    RESOURCES.filter((r) => r.name === skillPrefix || r.name.startsWith(`${skillPrefix}/`))
      .map((r) => `\n\n---\n## ${r.name}\n\n${stripFrontmatter(CONTENT[r.path] ?? '')}`)
      .join('')

  // Prompts — surfaced in slash-command autocomplete.
  // Keep this list short: top-level entry + one per skill bundle.
  server.prompt('chassis-ui', 'One-shot Chassis Figma design build or reconnect', async () => ({
    messages: [{ role: 'user', content: { type: 'text', text: promptContent } }]
  }))

  server.prompt(
    'chassis-create-design',
    'Load the chassis-create-design skill: build or update Figma screens using the Chassis UI library.',
    async () => ({
      messages: [
        { role: 'user', content: { type: 'text', text: buildSkillBundle('chassis-create-design') } }
      ]
    })
  )

  server.prompt(
    'chassis-implement-design',
    'Load the chassis-implement-design skill: implement Figma designs into code using Chassis UI CSS.',
    async () => ({
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: buildSkillBundle('chassis-implement-design') }
        }
      ]
    })
  )

  // Tools — surfaced in Claude.ai connector UI and other MCP clients
  server.tool(
    'chassis_create_design',
    'Load the chassis-create-design skill: build or update Figma screens using the Chassis UI library. Returns the full skill instructions and all reference files.',
    {},
    async () => ({
      content: [{ type: 'text', text: buildSkillBundle('chassis-create-design') }]
    })
  )

  server.tool(
    'chassis_implement_design',
    'Load the chassis-implement-design skill: implement Figma designs into production code using Chassis UI CSS. Returns the full skill instructions and all reference files.',
    {},
    async () => ({
      content: [{ type: 'text', text: buildSkillBundle('chassis-implement-design') }]
    })
  )

  const referenceNames = RESOURCES.filter((r) => r.name.includes('/references/')).map(
    (r) => r.name
  ) as [string, ...string[]]

  server.tool(
    'chassis_get_reference',
    'Fetch a specific Chassis UI reference file by name.',
    { name: z.enum(referenceNames).describe('Reference file to fetch') },
    async ({ name }) => {
      const resource = RESOURCES.find((r) => r.name === name)
      if (!resource) {
        return {
          content: [{ type: 'text', text: `Unknown reference: ${name}` }],
          isError: true
        }
      }
      return { content: [{ type: 'text', text: stripFrontmatter(CONTENT[resource.path] ?? '') }] }
    }
  )

  return server
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8')
      try {
        resolve(raw.length > 0 ? JSON.parse(raw) : undefined)
      } catch {
        resolve(undefined)
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Session-Id')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  })

  const server = createServer()
  await server.connect(transport)

  const body = req.method === 'POST' ? await readBody(req) : undefined
  await transport.handleRequest(req, res, body)
}
