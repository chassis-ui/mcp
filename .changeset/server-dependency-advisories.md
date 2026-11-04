---
'@chassis-ui/mcp': patch
---

The server runs on `@modelcontextprotocol/sdk` 1.32.2 and `zod` 4.6.7, and on the patched releases of what the SDK pulls in (`body-parser` 2.4.0, `qs` 6.17.1, `fast-uri` 3.1.9, `ip-address` 10.7.5), which close the advisories `pnpm audit` reported: memory exhaustion in `zod` and a denial of service in `body-parser`, among others. The tools, prompts and resources are unchanged.
