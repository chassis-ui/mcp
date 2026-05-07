import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { CONTENT } from './content.generated.js'
import { RESOURCES } from './resources.js'

function stripFrontmatter(content: string): string {
  if (!content.startsWith('---')) return content
  const end = content.indexOf('\n---', 3)
  return end === -1 ? content : content.slice(end + 4).trimStart()
}

function buildSkillBundle(skillPrefix: string): string {
  return RESOURCES.filter((r) => r.name === skillPrefix || r.name.startsWith(`${skillPrefix}/`))
    .map((r) => `\n\n---\n## ${r.name}\n\n${stripFrontmatter(CONTENT[r.path] ?? '')}`)
    .join('')
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'chassis-ui',
    version: '0.1.5'
  })

  // Resources
  for (const { name, uri, description, path } of RESOURCES) {
    const content = CONTENT[path] ?? ''
    server.registerResource(name, uri, { description, mimeType: 'text/markdown' }, async () => ({
      contents: [{ uri, text: content, mimeType: 'text/markdown' }]
    }))
  }

  // Prompts
  const promptContent = stripFrontmatter(CONTENT['prompts/chassis-ui.prompt.md'] ?? '')

  server.registerPrompt(
    'chassis-ui',
    { description: 'One-shot Chassis Figma design build or reconnect' },
    async () => ({
      messages: [{ role: 'user', content: { type: 'text', text: promptContent } }]
    })
  )

  server.registerPrompt(
    'chassis-create-design',
    {
      description:
        'Load the chassis-create-design skill: build or update Figma screens using the Chassis UI library.'
    },
    async () => ({
      messages: [
        { role: 'user', content: { type: 'text', text: buildSkillBundle('chassis-create-design') } }
      ]
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
        {
          role: 'user',
          content: { type: 'text', text: buildSkillBundle('chassis-implement-design') }
        }
      ]
    })
  )

  // Tools
  server.registerTool(
    'chassis_create_design',
    {
      description:
        'Load the chassis-create-design skill: build or update Figma screens using the Chassis UI library. Returns the full skill instructions and all reference files.'
    },
    async () => ({
      content: [{ type: 'text', text: buildSkillBundle('chassis-create-design') }]
    })
  )

  server.registerTool(
    'chassis_implement_design',
    {
      description:
        'Load the chassis-implement-design skill: implement Figma designs into production code using Chassis UI CSS. Returns the full skill instructions and all reference files.'
    },
    async () => ({
      content: [{ type: 'text', text: buildSkillBundle('chassis-implement-design') }]
    })
  )

  const referenceNames = RESOURCES.filter((r) => r.name.includes('/references/')).map(
    (r) => r.name
  ) as [string, ...string[]]

  server.registerTool(
    'chassis_get_reference',
    {
      description: 'Fetch a specific Chassis UI reference file by name.',
      inputSchema: { name: z.enum(referenceNames).describe('Reference file to fetch') }
    },
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
