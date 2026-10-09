---
name: Bug report
about: The server answers wrongly, a client cannot connect, or the plugin does not install
title: ''
labels: bug
assignees: ''
---

## What happened

<!-- The wrong answer or the error. Include the exact error message if there was one. -->

## What you expected

## Where

|                |                                                                                        |
| -------------- | -------------------------------------------------------------------------------------- |
| Client         | <!-- e.g. Claude Code 2.1, Cursor 2.4, MCP Inspector, with the version -->             |
| Installed as   | <!-- the plugin, an entry in .mcp.json or another client config, or a local server --> |
| Server version | <!-- `serverInfo.version` of the `initialize` response, e.g. 0.1.5 -->                 |
| What you used  | <!-- the tool, prompt or resource, e.g. chassis_get_reference -->                      |

## Reproduction

<!--
The request that shows it, if you can. `initialize` also returns the server version:
-->

```sh
curl -s https://mcp.chassis-ui.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

## Anything else
