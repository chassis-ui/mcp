// The handler of api/index.ts over real HTTP, as Vercel and server/dev.ts run it: one
// server and one transport per request, no session. The in-memory tests cannot see the
// status codes, the headers or the body parsing.

import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import handler, { createHandler } from '../api/index.js'
import { version } from './helpers.js'

const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream'
}

const INITIALIZE = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'chassis-mcp-tests', version: '0.0.0' }
  }
}

// What the tests read of a JSON-RPC response
interface Message {
  jsonrpc: string
  id: number | null
  result?: {
    serverInfo?: { name: string; version: string }
    capabilities?: Record<string, unknown>
    tools?: { name: string }[]
    content?: { type: string; text: string }[]
  }
  error?: { code: number; message: string }
}

type Listener = (req: IncomingMessage, res: ServerResponse) => void

const servers: Server[] = []

// A server on an ephemeral port; the URL of its /mcp
async function listen(listener: Listener): Promise<string> {
  const server = createServer(listener)

  servers.push(server)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}/mcp`
}

let url: string

function post(
  message: unknown,
  headers: Record<string, string> = HEADERS,
  to = url
): Promise<Response> {
  return fetch(to, {
    method: 'POST',
    headers,
    body: typeof message === 'string' ? message : JSON.stringify(message)
  })
}

// The JSON-RPC message of a response, which is JSON for an error and one server-sent event
// for a result
async function message(response: Response): Promise<Message> {
  const text = await response.text()

  if (response.headers.get('content-type')?.includes('text/event-stream')) {
    const data = text.split('\n').find((line) => line.startsWith('data: '))

    expect(data, text).toBeDefined()
    return JSON.parse(data!.slice('data: '.length))
  }

  return JSON.parse(text)
}

beforeAll(async () => {
  url = await listen(handler)
})

afterAll(async () => {
  for (const server of servers) {
    // fetch keeps its connections alive
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  }
})

describe('POST', () => {
  test('answers initialize with the name and the version of package.json', async () => {
    const response = await post(INITIALIZE)

    expect(response.status).toBe(200)
    expect(response.headers.get('mcp-session-id')).toBeNull()

    const { id, result } = await message(response)
    expect(id).toBe(1)
    expect(result?.serverInfo).toEqual({ name: 'chassis-ui', version })
    expect(Object.keys(result?.capabilities ?? {}).sort()).toEqual([
      'prompts',
      'resources',
      'tools'
    ])
  })

  // No session: a request is answered without an initialize before it
  test('answers a request that no initialize came before', async () => {
    const response = await post({ jsonrpc: '2.0', id: 2, method: 'tools/list' })

    expect(response.status).toBe(200)

    const { result } = await message(response)
    expect(result?.tools?.map((tool) => tool.name)).toEqual([
      'chassis_create_design',
      'chassis_implement_design',
      'chassis_get_reference'
    ])
  })

  test('answers a tool call', async () => {
    const response = await post({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'chassis_get_reference',
        arguments: { name: 'chassis-implement-design/references/tokens' }
      }
    })

    expect(response.status).toBe(200)

    const { result } = await message(response)
    expect(result?.content?.[0].text).toMatch(/^# /)
  })

  test('answers a tool call for one section of a reference', async () => {
    const call = async (id: number, args: Record<string, unknown>) => {
      const response = await post({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name: 'chassis_get_reference', arguments: args }
      })

      expect(response.status).toBe(200)
      return (await message(response)).result?.content?.[0].text ?? ''
    }
    const name = 'chassis-implement-design/references/tokens'
    const file = await call(32, { name })
    const section = await call(33, { name, section: 'tokens.md#typography' })

    expect(section).toMatch(/^# /)
    expect(section).toContain('\n## Typography\n')
    expect(section.match(/^## /gm)).toHaveLength(1)
    expect(file).toContain(section.slice(section.indexOf('## Typography')).trim())
    expect(section.length).toBeLessThan(file.length / 2)
  })

  // The skill tools through the handler: the index by default, the bundle with full: true
  test('answers a skill tool with the index, and with the bundle when asked', async () => {
    const call = async (id: number, args: Record<string, unknown>) => {
      const response = await post({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name: 'chassis_implement_design', arguments: args }
      })

      expect(response.status).toBe(200)
      return (await message(response)).result?.content?.[0].text ?? ''
    }
    const index = await call(30, {})
    const bundle = await call(31, { full: true })

    expect(index).toContain('`chassis-implement-design/references/tokens`')
    expect(index).not.toContain('## chassis-implement-design/references/tokens')
    expect(bundle).toContain('## chassis-implement-design/references/tokens')
    expect(bundle.length).toBeGreaterThan(index.length * 3)
  })

  test('accepts a notification with 202 and no body', async () => {
    const response = await post({ jsonrpc: '2.0', method: 'notifications/initialized' })

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('')
  })

  test.each([
    ['malformed JSON', '{"jsonrpc": "2.0", '],
    ['an empty body', ''],
    ['JSON that is not a JSON-RPC message', '{"hello": "world"}']
  ])('answers %s with 400 and a JSON-RPC parse error', async (_, text) => {
    const response = await post(text)

    expect(response.status).toBe(400)
    expect(await message(response)).toMatchObject({
      jsonrpc: '2.0',
      error: { code: -32700 },
      id: null
    })
  })

  test('answers a body over 4 MiB with 413', async () => {
    const response = await post(`"${'a'.repeat(4 * 1024 * 1024)}"`)

    expect(response.status).toBe(413)
    expect(await message(response)).toMatchObject({ error: { code: -32000 }, id: null })
  })

  test('answers 406 when the client does not accept an event stream', async () => {
    const response = await post(
      { jsonrpc: '2.0', id: 4, method: 'tools/list' },
      { 'Content-Type': 'application/json', Accept: 'application/json' }
    )

    expect(response.status).toBe(406)
    expect(await message(response)).toMatchObject({ error: { code: -32000 } })
  })
})

// Vercel's Node runtime reads the body before the handler runs and defines req.body: the parsed
// JSON for application/json, a getter that throws for invalid JSON, the text otherwise. This
// listener does the same, so the handler's use of req.body is tested; what Vercel does is not
describe('POST, with the body parsed by the runtime', () => {
  let parsedUrl: string

  beforeAll(async () => {
    parsedUrl = await listen((req, res) => {
      const chunks: Buffer[] = []
      req.on('data', (chunk: Buffer) => chunks.push(chunk))
      req.on('end', () => {
        const text = Buffer.concat(chunks).toString()
        const json = req.headers['content-type']?.startsWith('application/json')

        Object.defineProperty(req, 'body', {
          configurable: true,
          enumerable: true,
          get() {
            if (!json) return text
            if (text === '') return {}
            try {
              return JSON.parse(text)
            } catch {
              throw new Error('Invalid JSON')
            }
          }
        })
        void handler(req, res)
      })
    })
  })

  test('answers initialize from the parsed body, without reading the stream', async () => {
    const response = await post(INITIALIZE, HEADERS, parsedUrl)

    expect(response.status).toBe(200)
    expect((await message(response)).result?.serverInfo).toEqual({ name: 'chassis-ui', version })
  })

  test.each([
    ['malformed JSON', '{"jsonrpc": "2.0", '],
    ['an empty body', '']
  ])('answers %s with 400 and a JSON-RPC parse error', async (_, text) => {
    const response = await post(text, HEADERS, parsedUrl)

    expect(response.status).toBe(400)
    expect(await message(response)).toMatchObject({ error: { code: -32700 }, id: null })
  })
})

describe('GET', () => {
  test('answers a browser with a page that names the server, the version and the endpoint', async () => {
    const response = await fetch(url, { headers: { Accept: 'text/html' } })
    const page = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(page).toMatch(/^<!doctype html>/)
    expect(page).toContain('Chassis UI MCP server')
    expect(page).toContain(`v${version}`)
    expect(page).toContain('https://mcp.chassis-ui.com/mcp')
    expect(page).toContain('https://github.com/chassis-ui/mcp')
    expect(page).toContain('href="/health"')
    // No external asset: the function carries nothing of Chassis
    expect(page).not.toMatch(/<link|<script/)
  })

  test('answers a GET without an Accept header with the page', async () => {
    const response = await fetch(url)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8')
    await response.text()
  })

  test('answers /health with the status and the version', async () => {
    const response = await fetch(new URL('/health', url))

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(await response.json()).toEqual({ ok: true, version })
  })

  // The standalone stream carries the messages a server sends on its own; this one sends none.
  // 405 is what the protocol allows for a server without a stream, and the SDK's client treats
  // it as such
  test('answers an MCP client that opens the event stream with 405', async () => {
    const response = await fetch(url, { headers: { Accept: 'text/event-stream' } })

    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST, DELETE, OPTIONS')
    expect(await message(response)).toMatchObject({ error: { code: -32000 }, id: null })
  })
})

describe('DELETE', () => {
  // The SDK ends a session with DELETE. Without sessions there is none to end, and it
  // answers 200
  test('answers 200 with no body', async () => {
    const response = await fetch(url, { method: 'DELETE' })

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('')
  })
})

describe('a failure', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  let failingUrl: string

  beforeAll(async () => {
    failingUrl = await listen(
      createHandler({
        createServer: () => {
          throw new Error('the secret of the failure')
        }
      })
    )
  })

  afterEach(() => {
    error.mockClear()
  })

  afterAll(() => {
    error.mockRestore()
  })

  test('answers 500 with a JSON-RPC error that holds no detail, and logs the detail', async () => {
    const response = await post(INITIALIZE, HEADERS, failingUrl)
    const text = await response.text()

    expect(response.status).toBe(500)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(JSON.parse(text)).toEqual({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' },
      id: null
    })
    expect(text).not.toContain('secret')

    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0][0]).toBe('POST /mcp failed:')
    expect(error.mock.calls[0][1]).toMatchObject({ message: 'the secret of the failure' })
  })

  test('still answers a browser and /health, which need no server', async () => {
    const page = await fetch(failingUrl)
    const health = await fetch(new URL('/health', failingUrl))

    expect(page.status).toBe(200)
    expect(health.status).toBe(200)
    expect(error).not.toHaveBeenCalled()
    await Promise.all([page.text(), health.text()])
  })
})

describe('CORS', () => {
  const CORS = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version',
    'access-control-expose-headers': 'Mcp-Session-Id'
  }

  test('answers a preflight request with 204 and the headers', async () => {
    const response = await fetch(url, { method: 'OPTIONS' })

    expect(response.status).toBe(204)
    expect(Object.fromEntries(response.headers)).toMatchObject(CORS)
    expect(await response.text()).toBe('')
  })

  test('sends the headers with a result, an error and the page', async () => {
    const result = await post({ jsonrpc: '2.0', id: 5, method: 'ping' })
    const error = await post('{')
    const page = await fetch(url)

    for (const response of [result, error, page]) {
      expect(Object.fromEntries(response.headers)).toMatchObject(CORS)
    }
    await Promise.all([result.text(), error.text(), page.text()])
  })
})
