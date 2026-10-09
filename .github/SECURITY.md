# Security Policy

## Supported versions

Chassis MCP is pre-1.0. Only the latest version gets fixes: the one that runs at
`https://mcp.chassis-ui.com/mcp` and that the plugin installs from the `main` branch. There are no
maintenance branches for older versions.

## What this project runs

The server is one stateless HTTP function. It answers MCP requests with the Markdown of
[`skills/`](../skills/) and [`prompts/`](../prompts/), which is compiled into the function at
build time. It takes no credentials, keeps no session and no user data, reads no file and calls
no other service at runtime. Its runtime dependencies are `@modelcontextprotocol/sdk` and `zod`.

The skills are instructions that an AI agent follows with the tools of its own session: the Figma
MCP server, the file system, a shell. What an agent does on your machine after reading a skill is
therefore part of what this project ships.

## What to report

- The hosted endpoint serves content that differs from this repository at the released commit, or
  can be made to serve content it should not.
- A request that makes the function fail for other clients, or run beyond its limits.
- An advisory in a runtime dependency that can be reached through the handler in
  [`api/index.ts`](../api/index.ts).
- A skill, reference or prompt that instructs an agent to do something unsafe: to send data
  somewhere, to run a command that is not needed for the task, to change files outside the
  project, or to follow instructions found in a Figma file or a web page.

An advisory in the lint, test or build tooling is not a vulnerability of the server: none of it is
deployed. Open a regular issue or a pull request for it.

## Reporting a vulnerability

**Please don't open a public GitHub issue for a security vulnerability.**

Instead, use GitHub's private vulnerability reporting for this repository:
[github.com/chassis-ui/mcp/security/advisories/new](https://github.com/chassis-ui/mcp/security/advisories/new).
This opens a private thread visible only to you and the maintainers, so a fix can be released
before any public write-up.

If you can't use GitHub's private reporting, open a regular issue asking a maintainer to reach out
for a private channel, without including any details of the vulnerability.

We'll acknowledge new reports and keep you updated while we investigate and fix a confirmed issue.
Please give us reasonable time to release a fix before any public disclosure.
