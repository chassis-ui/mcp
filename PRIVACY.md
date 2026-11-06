# Privacy Policy

Last updated: 6 November 2026

This policy covers the Chassis UI MCP server at `https://mcp.chassis-ui.com/mcp` and the
Chassis UI plugin for Claude Code and Cursor, both published from
[github.com/chassis-ui/mcp](https://github.com/chassis-ui/mcp).

## What the server receives

An MCP client sends the server JSON-RPC requests over HTTPS. A request carries the name of a
tool, prompt or resource and its arguments: a skill name, a reference file name and section, or
the class names and markup that `chassis_check_classes` is asked to check. The server answers
from the Markdown and the class list compiled into it. It takes no credentials, asks for no
account and sets no cookie.

## What the server keeps

Nothing. The server is a stateless function: it keeps no session, writes no file, has no
database and calls no other service while it answers. A request is not stored, and the
markup or class names sent to `chassis_check_classes` are not kept after the answer.

## Logs

The server is hosted on [Vercel](https://vercel.com), which records each request in its
function logs (the path, the status, the duration and the IP address of the client) and keeps
them for the period its plan sets, under
[Vercel's privacy policy](https://vercel.com/legal/privacy-policy). The server itself writes
to those logs only when a request fails, and then the error, not the request body. No analytics
and no tracking are added.

## The plugin

The plugin installs the skills into your agent and connects two MCP servers: this one, and the
Figma MCP server at `https://mcp.figma.com/mcp`, which has its own
[privacy policy](https://www.figma.com/legal/privacy/). What an agent sends to either server is
decided by the agent and by what you ask it; the skills are plain instructions and send nothing
by themselves.

## Changes and contact

A change to this policy is made in the repository, with the date above. Questions go to the
[issue tracker](https://github.com/chassis-ui/mcp/issues).
