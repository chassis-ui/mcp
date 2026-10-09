import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
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

const BUNDLES = new Map<string, string>(
  RESOURCES.filter((r) => !r.name.includes('/')).map((r) => [r.name, buildSkillBundle(r.name)])
)

function bundle(skill: string): string {
  const content = BUNDLES.get(skill)
  if (content === undefined) throw new Error(`No skill ${skill} in the registry`)
  return content
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

  // Tools
  server.registerTool(
    'chassis_create_design',
    {
      description:
        'Load the chassis-create-design skill: build or update Figma screens using the Chassis UI library. Returns the full skill instructions and all reference files.'
    },
    async () => ({
      content: [{ type: 'text', text: bundle('chassis-create-design') }]
    })
  )

  server.registerTool(
    'chassis_implement_design',
    {
      description:
        'Load the chassis-implement-design skill: implement Figma designs into production code using Chassis UI CSS. Returns the full skill instructions and all reference files.'
    },
    async () => ({
      content: [{ type: 'text', text: bundle('chassis-implement-design') }]
    })
  )

  server.registerTool(
    'chassis_get_reference',
    {
      description: 'Fetch a specific Chassis UI reference file by name.',
      inputSchema: { name: z.enum(REFERENCE_NAMES).describe('Reference file to fetch') }
    },
    async ({ name }) => {
      const resource = RESOURCES.find((r) => r.name === name)
      if (!resource) {
        return {
          content: [{ type: 'text', text: `Unknown reference: ${name}` }],
          isError: true
        }
      }
      return { content: [{ type: 'text', text: stripFrontmatter(text(resource.path)) }] }
    }
  )

  return server
}
