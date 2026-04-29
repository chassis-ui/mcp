# Chassis MCP

Agent skills for working with the **Chassis UI** design system — covering both sides of the design-to-code workflow: designing screens in Figma and implementing them in code.

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

Guides agents through turning a Figma design into code using Chassis UI's component library and token system.

Use when:
- Translating a Figma screen or component into framework code
- Mapping Figma design tokens and styles to the correct Chassis UI code equivalents
- Ensuring component props, variants, and content overrides match the design intent

## Structure

```
skills/
  chassis-create-design/
    SKILL.md    # Workflow skill — design screens in Figma with Chassis UI
  chassis-implement-design/
    SKILL.md    # Workflow skill — implement Figma designs in code with Chassis UI
```

## Requirements

- Figma MCP server connected (for `use_figma`, `get_metadata`, `search_design_system`, etc.)
- Access to the Chassis UI Figma library and the target Figma file

