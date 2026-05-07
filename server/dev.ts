import { createServer } from 'node:http'
import handler from '../api/index.js'

const PORT = Number(process.env.PORT ?? 3000)

createServer(handler).listen(PORT, () => {
  console.error(`Chassis UI MCP server → http://localhost:${PORT}/mcp`)
  console.error(`Inspect: npx @modelcontextprotocol/inspector http://localhost:${PORT}/mcp`)
})
