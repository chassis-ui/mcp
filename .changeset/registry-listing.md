---
'@chassis-ui/mcp': patch
---

Every tool carries a title and the annotations `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true` and `openWorldHint: false`: a client that shows them sees that a Chassis tool reads what the server holds and nothing else, and the connector directories ask for them. The names, descriptions and input schemas of the tools are unchanged, and an agent does nothing differently.

The server tells a client its title, a description, its website and its icon in `initialize`, so a connector list shows "Chassis UI" with the Chassis icon instead of the bare name. The page a browser sees names the three skills and links the new `PRIVACY.md`, which says what a request leaves behind (nothing kept, Vercel's function logs). The README gains one-click install links for Cursor and VS Code.

The repository gains `server.json`, the listing of the server in the MCP registry as `com.chassis-ui/mcp`, with the production URL as its remote. The version step writes its version with the plugin manifests, and CONTRIBUTING.md says how a maintainer publishes it.
