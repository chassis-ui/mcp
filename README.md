# Chassis MCP

MCP server and agent skills for working with the **Chassis UI** design system — covering both sides of the design-to-code workflow: designing screens in Figma and implementing them in code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/chassis-ui/mcp/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/chassis-ui/mcp/actions/workflows/ci.yml?query=branch%3Adevelop)

## Overview

This repository provides structured guidance for AI agents to:

- Build and update full-page Figma screens from code or descriptions using Chassis UI components
- Implement Figma designs into code, correctly mapping Chassis UI design tokens, components, and patterns

## Usage

There are two ways to use Chassis MCP. The **plugin** gives an agent the two skills as slash commands and connects the MCP servers they need. The **MCP server** alone gives any MCP client the same skills as tools, prompts and resources.

### Claude Code plugin

```
/plugin marketplace add chassis-ui/mcp
/plugin install chassis-ui@chassis-ui
```

The plugin adds the skills as `/chassis-ui:chassis-create-design` and `/chassis-ui:chassis-implement-design`, and connects two MCP servers: Chassis UI (`https://mcp.chassis-ui.com/mcp`) and Figma (`https://mcp.figma.com/mcp`). Figma asks you to sign in the first time.

### Cursor

Add the server to `.cursor/mcp.json` in your project, or to `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "chassis-ui": {
      "url": "https://mcp.chassis-ui.com/mcp"
    }
  }
}
```

The repository also carries a Cursor plugin manifest (`.cursor-plugin/plugin.json`) with the same skills and servers as the Claude Code plugin.

### Any MCP client

The server speaks Streamable HTTP at `https://mcp.chassis-ui.com/mcp`. It needs no authentication and keeps no session.

In Claude Code, without the plugin:

```bash
claude mcp add --transport http chassis-ui https://mcp.chassis-ui.com/mcp
```

Or in your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "chassis-ui": {
      "type": "http",
      "url": "https://mcp.chassis-ui.com/mcp"
    }
  }
}
```

Once connected, the server exposes:

- **Tools** — `chassis_create_design` and `chassis_implement_design` return a skill with all of its reference files; `chassis_get_reference` returns one reference file by name
- **Prompts** — `chassis-create-design` and `chassis-implement-design` load a skill; `chassis-ui` is a one-shot command to build or reconnect a Figma screen using the Chassis UI library
- **Resources** — every skill and reference file, readable by your agent on demand

### Skills without the plugin

The plugin is the way to get the skills as slash commands. Without it, copy them into Claude Code's skills directory and connect the two MCP servers yourself:

```bash
git clone https://github.com/chassis-ui/mcp chassis-mcp
cp -r chassis-mcp/skills/chassis-create-design ~/.claude/skills/
cp -r chassis-mcp/skills/chassis-implement-design ~/.claude/skills/
```

Restart Claude Code. `/chassis-create-design` and `/chassis-implement-design` will appear in slash command autocomplete. A copy does not update itself: copy the skills again after a release.

## Requirements

- The **Figma MCP server** in the same agent session (for `use_figma`, `get_design_context`, `get_metadata`, `search_design_system`, etc.). Both skills run on top of it. The plugin connects it; with another client, add `https://mcp.figma.com/mcp` yourself.
- Access to the Chassis UI Figma library and the target Figma file.
- For `chassis-implement-design`: a project that uses [`@chassis-ui/css`](https://github.com/chassis-ui/css) 0.7.

## Skills

### `chassis-create-design`

Guides agents through building or updating a composed view in Figma using the Chassis UI library.

Use when:

- Creating a new screen, modal, dialog, drawer, sidebar, or any multi-section layout in Figma
- Reconnecting an existing screen to the Chassis UI library (replacing detached layers with proper instances)
- Translating a page description or existing code into a Figma design

Key behaviours:

- Discovers components via design system library search and Code Connect files
- Assembles views section-by-section using design system tokens instead of hardcoded values
- Applies Chassis UI's **Asset layer override pattern** — many components expose no top-level text property; text must be set on nested `*Asset` child instances
- Supports two modes: **build** (new screen from scratch) and **reconnect** (repair detached layers in an existing frame)

### `chassis-implement-design`

Guides agents through turning a Figma design into HTML that uses Chassis CSS (`@chassis-ui/css`), in a native CSS project or a Tailwind CSS v4 project that uses the Chassis Tailwind entry.

Use when:

- Translating a Figma screen, section, or component into Chassis CSS markup
- Mapping Figma variables (long names such as `space/context/medium`) to the Chassis classes (short names such as `p-md`)
- Ensuring component variants, Asset text, theming, and `data-cx-*` behaviors match the design intent

Its class catalog, `references/css-classes.md`, is generated from the compiled stylesheet of the `@chassis-ui/css` dev dependency, so it cannot drift from the framework. After bumping the dependency, regenerate it:

```bash
pnpm generate:css-classes
```

Set `CHASSIS_CSS_DIR` to a checkout of `chassis-css/packages/css` to generate from an unreleased build instead.

## Structure

```
api/
  index.ts                        # The HTTP handler Vercel deploys as mcp.chassis-ui.com
build/
  generate-content.js             # Bundles the skills and prompts into server/content.generated.ts
  generate-css-classes.js         # Generates the implement-design class catalog from @chassis-ui/css
  tests/                          # Tests of the generators
prompts/
  chassis-ui.prompt.md            # /chassis-ui prompt
server/                           # MCP server: resources, prompts, tools
skills/
  chassis-create-design/
    SKILL.md                      # Workflow skill — design screens in Figma with Chassis UI
    references/                   # Component catalog, tokens, patterns, typography, workflow
  chassis-implement-design/
    SKILL.md                      # Workflow skill — implement Figma designs as Chassis CSS HTML
    references/                   # css-classes (generated), components, tokens, patterns, workflow
tests/                            # Tests of the server and the handler
.claude-plugin/                   # Claude Code plugin manifest and marketplace
.cursor-plugin/                   # Cursor plugin manifest
.mcp.json                         # The MCP servers the plugin connects
```

## Contributing

Contributions are welcome. For major changes, please open an issue first to discuss what you would like to change.

Read the [contributing guide](.github/CONTRIBUTING.md) for the dev setup, the conventions, and what a pull request needs. Everyone taking part in this project is expected to follow the [Code of Conduct](.github/CODE_OF_CONDUCT.md). Found a security vulnerability? Please don't open a public issue; see the [security policy](.github/SECURITY.md) for private disclosure instead.

## License

MIT License — see [LICENSE](LICENSE) file for details.
