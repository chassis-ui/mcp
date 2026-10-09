---
mode: agent
description: One-shot Chassis Figma design build or reconnect. Loads the Figma skills and the chassis-create-design skill, collects the inputs, and runs the skill's workflow for screens, modals, drawers, dashboards and other multi-section views.
---

# /chassis-ui

Build or reconnect a Figma view with the Chassis UI library.

## Inputs (collect any missing value before starting)

- **mode**: `build` (a new view) or `reconnect` (an existing view with detached or hand-built layers)
- **target file URL**: the Figma file that holds, or will hold, the design; `fileKey` and an optional `nodeId` come from it
- **source**: for `build`, a code path, a screenshot, a written description or a live web URL; for `reconnect`, the frame or page to fix
- **modes** (optional): the brand, theme and app modes the view is for; the designer sets them in Figma
- **scope** (optional): one section, a list of sections, or the full screen

## Procedure

1. Load, in this order and before any tool call: `figma-use` and `figma-generate-design` from the Figma MCP server, then [`chassis-create-design`](../skills/chassis-create-design/SKILL.md). Its rules and its overlay on Figma's workflow govern the work; this prompt adds nothing to them.
2. Confirm the Figma MCP server is connected, the target file is accessible, and `cx.components.UI` and `cx.tokens.MAIN` are among the libraries of the file (`get_libraries`).
3. Follow the six steps of `figma-generate-design` with the skill's overlay, and fetch the skill's reference files as the steps need them: the library and its components, the recipes, the tokens, the workflow.
4. Close with the skill's report: Built, Swapped, Replaced, Composed, Local components, Already connected, Blocked.

## Example invocations

```
/chassis-ui mode=build target=https://figma.com/design/<key>/Sandbox source="packages/website/src/pages/about.astro"
/chassis-ui mode=build target=<figma-url> source="settings page with Profile, Notifications, Billing sections"
/chassis-ui mode=reconnect target=<figma-url with nodeId of the frame to fix>
/chassis-ui mode=build target=<figma-url> source=https://staging.chassis-ui.com/about/ scope="hero, feature grid, footer"
```

## When NOT to use this prompt

- A fix inside a single component: work on the component directly
- Generating code FROM Figma: use the `chassis-implement-design` skill
- Token or variable edits: use Figma directly or the `chassis-tokens` repository
