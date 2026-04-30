import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

const ROOT = process.cwd()

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
    version: '1.0.0'
  })

  for (const resource of RESOURCES) {
    const content = readFileSync(join(ROOT, resource.path), 'utf-8')
    const { uri, name, description } = resource
    server.resource(name, uri, { description, mimeType: 'text/markdown' }, async () => ({
      contents: [{ uri, text: content, mimeType: 'text/markdown' }]
    }))
  }

  const promptRaw = readFileSync(join(ROOT, 'prompts/chassis-ui.prompt.md'), 'utf-8')
  const promptContent = stripFrontmatter(promptRaw)

  server.prompt(
    'chassis-ui',
    'One-shot Chassis Figma design build or reconnect',

    async () => ({
      messages: [{ role: 'user', content: { type: 'text', text: promptContent } }]
    })
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
