// The handler of api/index.ts over real HTTP, as Vercel and server/dev.ts run it: one
// server and one transport per request, no session. The in-memory tests cannot see the
// status codes, the headers or the body parsing.

import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import handler from '../api/index.js'
import { version } from './helpers.js'

const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream'
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

let server: Server
let url: string

function post(message: unknown, headers: Record<string, string> = HEADERS): Promise<Response> {
  return fetch(url, {
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
  server = createServer(handler)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/mcp`
})

afterAll(async () => {
  // The event stream of a GET stays open until its client goes away
  server.closeAllConnections()
  await new Promise((resolve) => server.close(resolve))
})

describe('POST', () => {
  test('answers initialize with the name and the version of package.json', async () => {
    const response = await post({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'chassis-mcp-tests', version: '0.0.0' }
      }
    })

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

  test('accepts a notification with 202 and no body', async () => {
    const response = await post({ jsonrpc: '2.0', method: 'notifications/initialized' })

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('')
  })

  test.each([
    ['malformed JSON', '{"jsonrpc": "2.0", '],
    ['an empty body', '']
  ])('answers %s with 400 and a JSON-RPC parse error', async (_, text) => {
    const response = await post(text)

    expect(response.status).toBe(400)
    expect(await message(response)).toMatchObject({
      jsonrpc: '2.0',
      error: { code: -32700 },
      id: null
    })
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

describe('GET', () => {
  // Phase 6 of the plan changes this on purpose: a browser gets a page
  test('answers 406 when the client does not accept an event stream', async () => {
    const response = await fetch(url)

    expect(response.status).toBe(406)
    expect(await message(response)).toMatchObject({ error: { code: -32000 } })
  })

  test('opens an event stream for a client that accepts one', async () => {
    const response = await fetch(url, { headers: { Accept: 'text/event-stream' } })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/event-stream')
    await response.body?.cancel()
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

describe('CORS', () => {
  const CORS = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Accept, Mcp-Session-Id'
  }

  test('answers a preflight request with 204 and the headers', async () => {
    const response = await fetch(url, { method: 'OPTIONS' })

    expect(response.status).toBe(204)
    expect(Object.fromEntries(response.headers)).toMatchObject(CORS)
    expect(await response.text()).toBe('')
  })

  test('sends the headers with a result and with an error', async () => {
    const result = await post({ jsonrpc: '2.0', id: 5, method: 'ping' })
    const error = await post('{')

    expect(Object.fromEntries(result.headers)).toMatchObject(CORS)
    expect(Object.fromEntries(error.headers)).toMatchObject(CORS)
    await Promise.all([result.text(), error.text()])
  })
})
