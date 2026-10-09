---
'@chassis-ui/mcp': minor
---

The server greets a browser, reports its health and fails as JSON-RPC.

- `https://mcp.chassis-ui.com/mcp` and `https://mcp.chassis-ui.com/` opened in a browser show a page with the version, the endpoint and the install commands; `GET /health` answers `{ "ok": true, "version": "<version>" }`
- An MCP client that opens the standalone event stream (`GET` with `Accept: text/event-stream`) gets 405: the server sends no server-initiated messages, and the stream only held a function open. The official SDKs take 405 as "no stream" and go on
- A failure inside the function answers a JSON-RPC error `-32603` with status 500, and a body over 4 MiB a 413, instead of a request that hangs; the detail goes to the logs
- The CORS headers allow `Mcp-Protocol-Version`, which clients send since protocol 2025-06-18, and expose `Mcp-Session-Id`
- The description of a resource is now the frontmatter description of the skill or the title of the reference file, taken from the file; the registry of resources is generated with the content, so a reference file cannot be left out of the server. The names and URIs of the resources are unchanged
- The skill bundles are built once per instance of the function, not on every call
