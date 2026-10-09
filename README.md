# Chassis MCP

MCP server and agent skills for working with the **Chassis UI** design system — covering both sides of the design-to-code workflow: designing screens in Figma and implementing them in code.

## Usage

Add the Chassis UI MCP server to your editor or agent configuration:

Then add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "chassis-ui": {
      "url": "https://mcp.chassis-ui.com/mcp"
    }
  }
}
```

Once connected, the server exposes:

- **Resources** — all skill and reference files, readable by your agent on demand
- **Prompt** — `/chassis-ui` — one-shot command to build or reconnect a Figma screen using the Chassis UI library
- **Tools** — `chassis_create_design`, `chassis_implement_design`, `chassis_get_reference`

### Using slash commands

Copy the skills into Claude Code's global skills directory and add the MCP server to your project:

```bash
git clone https://github.com/chassis-ui/mcp chassis-mcp
cp -r chassis-mcp/skills/chassis-create-design ~/.claude/skills/
cp -r chassis-mcp/skills/chassis-implement-design ~/.claude/skills/
```

Restart Claude Code. `/chassis-create-design` and `/chassis-implement-design` will appear in slash command autocomplete.

## Overview

This repository provides structured guidance for AI agents to:

- Build and update full-page Figma screens from code or descriptions using Chassis UI components
- Implement Figma designs into code, correctly mapping Chassis UI design tokens, components, and patterns

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
  index.ts                        # Vercel serverless MCP handler
build/
  generate-content.js             # Bundles the skills and prompts into server/content.generated.ts
  generate-css-classes.js         # Generates the implement-design class catalog from @chassis-ui/css
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
```

## Requirements

- Figma MCP server connected (for `use_figma`, `get_metadata`, `search_design_system`, etc.)
- Access to the Chassis UI Figma library and the target Figma file
