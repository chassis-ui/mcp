---
mode: agent
description: One-shot Chassis Figma design build or reconnect. Wraps the chassis-create-design skill with a parameterized invocation for screens, modals, drawers, dashboards, and other multi-section views.
---

# /chassis-design

Build or reconnect a Figma view using the Chassis UI library.

## Inputs (collect any missing values before starting)

- **mode**: `build` (new) | `reconnect` (existing detached/wrapped layers)
- **target file URL**: Figma file containing (or to contain) the design — extract `fileKey` and optional `nodeId` from the URL
- **source**:
  - For `build`: a code path, screenshot URL, written description, or live web URL
  - For `reconnect`: the existing frame/page node within the target file
- **theme set** (optional): which Brand / Theme / App combinations to design for (default: current file defaults)
- **scope** (optional): a single section name, list of sections, or "full screen"

## Procedure

1. **MANDATORY** — load these skills in order, before any tool call:
   1. `figma-use` (from the Figma MCP server) — Plugin API rules; required before every `use_figma` call.
   2. `figma-generate-design` (from the Figma MCP server) — canonical screen-building workflow.
   3. [`chassis-create-design`](../skills/chassis-create-design/SKILL.md) — Chassis specialization layer.
2. Confirm prerequisites (Figma MCP server connected, target file accessible, Chassis library available).
3. Follow the `figma-generate-design` 6-step workflow with the Chassis overrides defined in `chassis-create-design`.
4. **Parallel `generate_figma_design` capture** — run when the source is a live web URL OR when the source contains images. The Plugin API cannot fetch image URLs, so the capture is the only way to land images. Refine the component-instance build against the capture, transfer `imageHash` values, then delete the capture frame.
5. Validate every section with `get_screenshot` before moving to the next.
6. Pass `skillNames: "figma-use,figma-generate-design,chassis-create-design"` on every `use_figma` call (logging only).
7. Close with the deliverable report (Built / Swapped / Composed / Already connected / Blocked).

## Hard rules (non-negotiable)

- **Load `figma-use` before any `use_figma` call** — skipping causes silent, hard-to-debug failures
- **`generate_figma_design` is mandatory when the source contains images** — Plugin API cannot fetch image URLs
- **Asset Override Pattern** for all text — never assume top-level `label` / `text` / `title` props on Chassis components
- **No raw colors / spacing / type** — only Chassis variables; ask before hardcoding
- **Prefer Chassis `context` tokens** over `unit`/`level` tokens — context tokens swap correctly across themes
- **`componentKey` over name** when importing — resolve via `fileKey` from `component-keys.md` + `get_metadata`
- **Preserve x/y/width/height** when replacing inside non-auto-layout parents
- **One section per `use_figma` call** — never rewrite a whole screen in one call
- **Don't convert frames to auto-layout** unless explicitly asked
- **Return all created/mutated node IDs** from every `use_figma` call
- **Never use deprecated `Dropdown Button @ 0.2`** — use `Dropdown Button` (`b5c9294f0d6576fd0dbc60c4bcb3feae193f3b18`)

## Quick references

- [tokens.md](../skills/chassis-create-design/references/tokens.md) — colors, type, spacing, sizing, radius, borders, opacity
- [components.md](../skills/chassis-create-design/references/components.md) — full component catalog
- [patterns.md](../skills/chassis-create-design/references/patterns.md) — Asset overrides, buttons, forms, tables, themes, anti-patterns
- [workflow.md](../skills/chassis-create-design/references/workflow.md) — phased build/reconnect playbooks
- [component-keys.md](../skills/chassis-create-design/references/component-keys.md) — slug → fileKey resolution

## Example invocations

```
/chassis-design mode=build target=https://figma.com/design/<key>/Sandbox source="packages/website/src/pages/about.astro"
/chassis-design mode=build target=<figma-url> source="settings page with Profile, Notifications, Billing sections"
/chassis-design mode=reconnect target=<figma-url with nodeId of the frame to fix>
/chassis-design mode=build target=<figma-url> source=https://staging.chassis-ui.com/about/ scope="hero, feature grid, footer"
```

## When NOT to use this prompt

- Single-component fixes — work on the component directly
- Generating code FROM Figma — use a `chassis-implement-design` workflow instead
- Pure variable / token edits — use Figma directly or the `chassis-tokens` repo
