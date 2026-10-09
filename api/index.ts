// The HTTP handler Vercel deploys at https://mcp.chassis-ui.com/mcp, and server/dev.ts serves
// locally. Stateless: every request gets a new McpServer and a new transport, and there is no
// session. A browser gets a page, GET /health a JSON status, an MCP client the protocol, and
// a failure a JSON-RPC error instead of a hung function.

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { VERSION } from '../server/content.generated.js'
import { createServer } from '../server/index.js'

const ENDPOINT = 'https://mcp.chassis-ui.com/mcp'
const REPOSITORY = 'https://github.com/chassis-ui/mcp'

// The bound the SDK puts on a request body it reads itself (4 MiB), applied to the read here
const MAX_BODY_BYTES = 4 * 1024 * 1024

// What a browser sees. Nothing of Chassis, so the function carries no stylesheet
const PAGE = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chassis UI MCP server</title>
<style>
  body { max-width: 40rem; margin: 3rem auto; padding: 0 1rem; font: 1rem/1.5 system-ui, sans-serif; color: #1a1a1a; background: #fff; }
  h1 small { font-size: 0.6em; font-weight: normal; color: #666; }
  code { font-size: 0.95em; }
  @media (prefers-color-scheme: dark) { body { color: #eee; background: #111; } a { color: #8ab4f8; } h1 small { color: #999; } }
</style>
<h1>Chassis UI MCP server <small>v${VERSION}</small></h1>
<p>The <a href="https://modelcontextprotocol.io">Model Context Protocol</a> server of the <a href="https://www.chassis-ui.com">Chassis UI</a> design system. It serves the skills <code>chassis-create-design</code> and <code>chassis-implement-design</code> and their reference files to an MCP client as tools, prompts and resources. A browser has nothing to read here.</p>
<p>Endpoint: <code>${ENDPOINT}</code> (Streamable HTTP, no authentication)</p>
<p>In Claude Code: <code>/plugin marketplace add chassis-ui/mcp</code>, then <code>/plugin install chassis-ui@chassis-ui</code>. In another client, add the endpoint as an HTTP server; the <a href="${REPOSITORY}#readme">README</a> has the configuration for Cursor and for <code>.mcp.json</code>.</p>
<p><a href="${REPOSITORY}">Repository</a> · <a href="/health">Health</a></p>
`

export interface HandlerOptions {
  // The tests inject a server factory that fails
  createServer?: () => McpServer
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
): void {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
  res.end(JSON.stringify(body))
}

function sendJsonRpcError(
  res: ServerResponse,
  status: number,
  code: number,
  message: string,
  headers: Record<string, string> = {}
): void {
  sendJson(res, status, { jsonrpc: '2.0', error: { code, message }, id: null }, headers)
}

type Body = { parsed: unknown } | { invalid: true } | { tooLarge: true }

function parse(text: string): Body {
  try {
    return { parsed: JSON.parse(text) }
  } catch {
    return { invalid: true }
  }
}

// The body of a POST, as the message the transport parses.
//
// Vercel's Node runtime reads the body before the handler runs and defines `req.body` on the
// request: for `application/json` the parsed value (`{}` for an empty body; the getter throws
// for invalid JSON), for `text/plain` and for a missing Content-Type the text. It replays the
// bytes on the stream as well, which is why reading the stream worked before. The parsed value
// is used when it is there; locally (server/dev.ts, the tests) there is no `req.body` and the
// stream is read here, up to the bound the SDK applies to its own read.
function readBody(req: IncomingMessage): Promise<Body> {
  if ('body' in req) {
    try {
      const body = (req as { body?: unknown }).body
      return Promise.resolve(typeof body === 'string' ? parse(body) : { parsed: body })
    } catch {
      return Promise.resolve({ invalid: true })
    }
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0

    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size <= MAX_BODY_BYTES) chunks.push(chunk)
    })
    req.on('end', () => {
      resolve(size > MAX_BODY_BYTES ? { tooLarge: true } : parse(Buffer.concat(chunks).toString()))
    })
    req.on('error', reject)
  })
}

export function createHandler({ createServer: factory = createServer }: HandlerOptions = {}) {
  return async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // CORS is open on purpose: the server is public and read-only, takes no credentials and keeps
    // no session, so there is nothing a cross-origin page could misuse. Mcp-Protocol-Version is
    // sent by clients since protocol 2025-06-18
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version'
    )
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    try {
      if (req.method === 'GET') {
        // A rewrite of vercel.json sends / and /health here with their own path
        const { pathname } = new URL(req.url ?? '/', 'http://localhost')

        if (pathname === '/health') {
          sendJson(res, 200, { ok: true, version: VERSION })
          return
        }

        if (!req.headers.accept?.includes('text/event-stream')) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(PAGE)
          return
        }

        // An MCP client opening the standalone event stream, for the requests and notifications
        // a server sends on its own. This server sends none and has no session to attach the
        // stream to, so the stream would only hold a function until maxDuration. The protocol
        // lets a server answer 405 instead, and the SDK's client takes that as "no stream"
        sendJsonRpcError(
          res,
          405,
          -32000,
          'Method Not Allowed: this server sends no server-initiated messages and offers no event stream',
          { Allow: 'POST, DELETE, OPTIONS' }
        )
        return
      }

      const body = req.method === 'POST' ? await readBody(req) : { parsed: undefined }

      if ('tooLarge' in body) {
        sendJsonRpcError(
          res,
          413,
          -32000,
          `Payload Too Large: Request body must not exceed ${MAX_BODY_BYTES} bytes`
        )
        return
      }

      if ('invalid' in body) {
        sendJsonRpcError(res, 400, -32700, 'Parse error: Invalid JSON')
        return
      }

      // One server and one transport per request: the SDK binds a transport to one server, and a
      // stateless transport refuses a second request
      const server = factory()
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })

      await server.connect(transport)
      await transport.handleRequest(req, res, body.parsed)
    } catch (error) {
      // Vercel collects stderr. The client gets the code, not the message or the stack
      console.error(`${req.method} ${req.url} failed:`, error)

      if (!res.headersSent) {
        sendJsonRpcError(res, 500, -32603, 'Internal error')
      } else if (!res.writableEnded) {
        res.end()
      }
    }
  }
}

export default createHandler()
