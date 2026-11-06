// server.json lists the server in the MCP registry. The registry validates it against its
// schema when it is published, long after a change is merged; these tests catch what the schema
// would, and tie the listing to the rest of the repository
import { describe, expect, test } from 'vitest'
import { read, version } from './helpers.js'

interface ServerJson {
  $schema: string
  name: string
  title: string
  description: string
  version: string
  repository: { url: string; source: string }
  icons: { src: string; mimeType?: string }[]
  remotes: { type: string; url: string }[]
}

const listing = JSON.parse(read('server.json')) as ServerJson
const mcp = JSON.parse(read('.mcp.json')) as { mcpServers: Record<string, { url: string }> }
const pkg = JSON.parse(read('package.json')) as { repository: { url: string } }

describe('server.json', () => {
  test('carries the version of package.json', () => {
    expect(listing.version).toBe(version)
  })

  test('is named in the domain of the server, as the registry wants a name', () => {
    expect(listing.name).toBe('com.chassis-ui/mcp')
    expect(listing.name).toMatch(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/)
  })

  test('keeps its description and title within the limits of the registry', () => {
    expect(listing.description.length).toBeGreaterThan(0)
    expect(listing.description.length).toBeLessThanOrEqual(100)
    expect(listing.title.length).toBeLessThanOrEqual(100)
  })

  test('points at the server the plugin installs', () => {
    expect(listing.remotes).toEqual([
      { type: 'streamable-http', url: mcp.mcpServers['chassis-ui'].url }
    ])
  })

  test('points at the repository of package.json', () => {
    expect(`${listing.repository.url}.git`).toBe(pkg.repository.url)
    expect(listing.repository.source).toBe('github')
  })

  test('serves its icon over HTTPS', () => {
    for (const icon of listing.icons) {
      expect(icon.src).toMatch(/^https:\/\//)
      expect(icon.src.length).toBeLessThanOrEqual(255)
    }
  })
})
