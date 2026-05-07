---
name: chassis-implement-design
description: 'Implement a Figma design (made with the Chassis UI Figma library) as production HTML/CSS using Chassis CSS (`@chassis-ui/css`). Use when the user wants to translate, generate, build, or convert a Chassis Figma view, screen, page, modal, drawer, sidebar, panel, dashboard, landing page, or component into shipping markup with 1:1 visual fidelity. Runs on top of the Figma MCP server skill `figma-implement-design` and adds Chassis-specific class mapping, token translation, Asset Override extraction, component composition, and Brand/Theme/App theming conventions. Do NOT use for: writing INTO Figma (use `chassis-create-design`), pure token/SCSS edits, or non-Chassis design systems.'
disable-model-invocation: false
---

# Implement Chassis Figma Designs as Chassis CSS Code

This skill specializes the generic Figma-to-code workflow for the **Chassis UI ecosystem**: it converts Figma views built from the Chassis library into production HTML using **Chassis CSS** (`@chassis-ui/css`) classes, semantic spacing/typography scales, context-aware colors, `data-cx-*` behaviors, and the Brand × Theme × App multi-mode system.

## ⛔ Required Figma MCP Skills

This skill is a **specialization layer** that runs on top of the Figma MCP server. Load the canonical implementation skill **before** doing any work here:

| Order | Skill                                  | Why                                                                                                                                                                                                                                                                                        |
| ----- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `figma-implement-design`               | **MANDATORY before ANY code generation.** Provides the canonical 7-step workflow: Get Node ID → `get_design_context` → `get_screenshot` → Download Assets → Translate → 1:1 Parity → Validate. This skill **does not redefine that workflow** — it overlays Chassis-specific rules on top. |
| 2     | `chassis-implement-design` (this file) | Chassis specialization layer — read after the above.                                                                                                                                                                                                                                       |

If the user wants to write back to Figma (not code), stop and switch to `chassis-create-design` instead.

If Figma MCP tools appear as deferred tools, batch-load their schemas in **one** `tool_search` call: e.g. `tool_search query="select:get_design_context,get_screenshot,get_metadata,get_variable_defs,get_code_connect_map"`.

## When to Use

When the deliverable is **Chassis CSS code** (HTML + Chassis CSS classes; optionally JS for `data-cx-*` behaviors) implementing a Figma view that was authored with the Chassis UI Figma library.

| Mode        | Use when                                                                            |
| ----------- | ----------------------------------------------------------------------------------- |
| `screen`    | Full page, view, modal, drawer, dashboard, landing page from Figma                  |
| `component` | Single component instance (button, card, form, table, etc.) into a reusable snippet |
| `section`   | A subsection of an existing page (header, hero, feature block, footer)              |

## When NOT to Use

- **Writing TO Figma** — switch to `chassis-create-design`
- **Pure token / SCSS edits** — work directly in `chassis-css` or `chassis-tokens` repos
- **Non-Chassis design systems** — use vanilla `figma-implement-design`
- **JS framework bindings only** — use the project's own framework conventions; this skill targets the markup + class layer

## Prerequisites

- Figma MCP server connected with: `get_design_context`, `get_screenshot`, `get_metadata`, `get_variable_defs`, `get_code_connect_map`
- Source Figma URL (extract `fileKey` and `nodeId` — convert `-` to `:` in nodeId), or active selection in Figma desktop
- Target project either depends on `@chassis-ui/css` or includes its built CSS via `chassis.css`
- Reference docs for the live class system: see [css-classes.md](./references/css-classes.md)

## 🔑 Core Chassis Rule — Figma MCP Output Is Not Chassis CSS

`get_design_context` returns a **React + Tailwind** code block. **Discard all its class names.** Use it only to understand layer nesting — every style decision must come from `get_variable_defs` tokens, not from Tailwind utilities.

### What to use from the MCP output

| MCP output part | Use it for | Never use it for |
| --- | --- | --- |
| `code` block (React + Tailwind JSX) | Understanding layer nesting and component structure | Emitting class names or inline styles |
| Resolved hex / rgba / px values | Visual cross-check against screenshot | Writing to code — never emit raw values |
| Component instance tree (children) | Asset slot discovery and component identification | — |
| `get_variable_defs` results | **Every** style decision — the sole source of truth | — |

### Tailwind → Chassis quick map

The MCP JSX uses Tailwind utilities and React component syntax. Replace them:

| Tailwind / JSX (MCP output) | Chassis CSS | Note |
| --- | --- | --- |
| `className="…"` | `class="…"` | JSX → HTML |
| `text-{color}-{n}` | `fg-subtle`, `fg-main`, `{ctx}-fg-{emphasis}` | Always from `get_variable_defs` |
| `bg-{color}-{n}` | `bg-main`, `bg-evident`, `{ctx}-bg-{emphasis}` | Always from `get_variable_defs` |
| `p-4`, `px-3`, `py-2`, `m-3` | `p-medium`, `px-small`, `py-xsmall`, `m-medium` | Semantic step from token |
| `gap-4`, `gap-x-2` | `gap-large`, `column-gap-xsmall` | Semantic step from token |
| `text-xl`, `text-2xl`, `text-sm` | `font-xlarge`, `font-2xlarge`, `font-small` | Confirm via `get_variable_defs` |
| `font-bold` | `font-strong` | |
| `font-light` | `font-elegant` | |
| `rounded-lg`, `rounded-md` | `rounded-{ctx}` | Token from `get_variable_defs` |
| `flex flex-col` | `d-flex flex-column` | |
| `grid grid-cols-{n}` | `row` + `col-*` | Use responsive col classes |
| `hidden` | `d-none` | |
| `md:`, `lg:`, `sm:`, `xl:`, `2xl:` | `medium:`, `large:`, `small:`, `xlarge:`, `2xlarge:` | Full name — never abbreviated |
| `data-bs-*` | `data-cx-*` | (rare in MCP output) |
| `<Button variant="primary">` | `<button class="button primary">` | See [components.md](./references/components.md) |
| `p-[14px]`, `bg-[#ff0000]` | 🚩 raise to user | Arbitrary values = detached or unknown token |

> **Modifiers are space-separated, never hyphenated:** `button primary outline large` — not `button-primary-outline-large`.
>
> ⚠️ **Arbitrary Tailwind values** (`p-[14px]`, `text-[#hex]`, `bg-[rgba(…)]`) mean the design has a detached or undocumented token. Raise it explicitly — never silently emit inline CSS.

## 🔑 Core Chassis Rule — Asset Layer Extraction

Chassis components in Figma expose **no top-level text properties.** Text content lives in nested instances whose name ends in `Asset` — `Text Asset`, `Label Asset`, `Title Text Asset`, `Subtitle Asset`, `Description Asset`. When implementing:

1. **Inspect the Figma node tree** for `*Asset` children — that's where real text content sits.
2. **Inline the asset's text** as the visible content of the corresponding HTML element.
3. **Drop the wrapper layer names** — `Asset` is a Figma authoring convention, not a CSS class.
4. **Map Asset role → semantic HTML element**: `Title Text Asset` → `<h1>`–`<h6>`, `Subtitle Asset` → `<p class="font-lead">` or `<small>`, `Label Asset` → `<label>` or `<span>`, `Description Asset` → `<p>`.

If text appears in the screenshot but no `*Asset` child exists in `get_design_context`, fall back to `get_metadata` and drill down — the text may be in a deeper nested instance. See [patterns.md → Asset Extraction](./references/patterns.md#asset-extraction) for examples.

## Workflow — Chassis Overlay on `figma-implement-design`

Follow the 7-step workflow defined by `figma-implement-design`. Apply these **Chassis-specific overrides** at each step:

### Step 1 — Get Node ID

- Standard URL parse, no Chassis-specific changes.

### Step 2 — Fetch Design Context

- Run `get_design_context` first.
- **Also run `get_variable_defs`** for the node — it returns Chassis token names (`color/context/primary/fg-main`, `space/context/medium`, `font/html/h1`) used in the design. These map directly to Chassis CSS classes via [tokens.md](./references/tokens.md).
- **Run `get_code_connect_map`** for the node before generating code — Chassis components may have Code Connect snippets that already pin the correct Chassis CSS class names. If a mapping exists, use it verbatim.
- For large screens, use `get_metadata` first to identify section nodes, then fetch each section's context separately.

> ⛔ **The `code` block inside `get_design_context` output is React + Tailwind. Discard it completely — do not adapt it.**
> The resolved hex/rgba/px values in the style data are also off-limits for emitting CSS. They exist only as a visual cross-check.
> **You may not emit any color, spacing, or typography style until you have a matching variable name from `get_variable_defs`.** Every style decision must trace back to a token name → Chassis class lookup via [tokens.md](./references/tokens.md). If no variable name covers a property, raise it — do not fall back to inline hex or hardcoded pixel values.

### Step 3 — Capture Visual Reference

- `get_screenshot` per section as well as the full view — use sections to validate Asset extraction and theme correctness.

### Step 4 — Download Required Assets

- Use Figma MCP `localhost` URLs verbatim per the parent skill.
- **Icons**: Chassis ships an icon system (`@chassis-ui/icons`). If the Figma layer is a Chassis icon instance (look for `Icon Asset` or `*-icon` child names), use the `<svg class="icon">` Chassis pattern with the matching icon slug **instead of** the localhost SVG. Resolve via [components.md → Icons](./references/components.md#icons).
- **Brand/theme-conditional images** (logos, illustrations gated by Chassis switch variables) require dual sources — see [patterns.md → Theme-Conditional Assets](./references/patterns.md#theme-conditional-assets).

### Step 5 — Translate to Chassis CSS Conventions

- **Discard** the Tailwind utility classes from the MCP output entirely.
- **Gate on `get_variable_defs`**: before writing any color, spacing, or typography class for an element, confirm you have the variable name for it from `get_variable_defs`. No variable name = raise it to the user; never fall back to a hex value, a Tailwind class, or a numeric pixel value.
- **Map every Figma variable** returned by `get_variable_defs` to its Chassis CSS class using [tokens.md](./references/tokens.md). Token-bound colors → `fg-*` / `bg-*` / context-prefix variants. Token-bound spacing → semantic spacing utilities. Token-bound type → `font-*` classes.
- **Identify each Figma component instance** and emit its canonical Chassis CSS HTML pattern from [components.md](./references/components.md). Variants in Figma map to space-separated modifiers (`button primary outline large`).
- **Lift Asset text** into the wrapping element per the rule above — never emit an `Asset` div as wrapper markup.
- **Use semantic HTML** for the role: navbar → `<nav>`, list → `<ul>/<ol>`, form fields → real `<label>` + `<input>`, table → `<table>` with `<thead>/<tbody>`, dialog → `<dialog>` or `[role="dialog"]`, etc.
- **Behaviors** (toggles, modals, dropdowns, tabs, scrollspy) use `data-cx-*` attributes — see [css-classes.md → Data Attributes](./references/css-classes.md#data-attributes).

### Step 6 — Achieve 1:1 Visual Parity

- **Never hardcode** colors, spacing, typography, radius, border-width — they must resolve to a Chassis class.
- **Prefer context tokens** (`bg-main`, `fg-subtle`, `space-medium`) over unit/level tokens — context tokens swap correctly across themes/modes; unit tokens do not.
- **Don't fabricate classes.** If a needed style has no Chassis class, raise it explicitly rather than emitting raw CSS or Tailwind. Custom one-off CSS is allowed only as an inline `style="…"` for non-token values that genuinely don't exist in the system (e.g., a precise pixel offset for an illustration), and must be flagged in the deliverable summary.
- **Auto-layout in Figma → flex/grid utilities**: `d-flex`, `flex-column`, `gap-{size}`, `justify-content-*`, `align-items-*`. See [css-classes.md → Layout](./references/css-classes.md#layout--flex).
- **Constraints in Figma → responsive col classes**: `col-12 col-medium-6 col-large-4`.

### Step 7 — Validate Against Figma

- Apply the parent skill's checklist.
- **Add Chassis-specific checks:**
  - All classes are Chassis (no Tailwind leftovers: `className`, `text-{color}-{n}`, `bg-{color}-{n}`, numeric spacing `p-{n}` / `gap-{n}`, abbreviated breakpoints `md:` / `lg:`, arbitrary values `[…]`)
  - All variants are space-separated (`button primary outline`, not `button-primary-outline`)
  - All Asset wrappers were lifted (no leftover `<div class="text-asset">` shells)
  - Theme/mode switching works — render under each target Brand × Theme × App combination if applicable
  - `data-cx-*` behavior attributes present where the component requires JS
  - **Zero hex colors** in class attributes, inline `style=""`, or a `<style>` block — any hex value that isn't a deliberate non-token art direction override (flagged in the deliverable summary) is a translation error; go back and find the correct Chassis class

## Component Catalog → Chassis CSS Map

Every documented Chassis component family has a canonical HTML/CSS pattern. The full catalog with output snippets is in [components.md](./references/components.md). Key families that appear in Chassis Figma views:

- **Buttons** — `<button class="button {context} {style?} {size?}">…</button>` ; groups via `<div class="button-group">…</div>` ; floating, close, dropdown variants
- **Forms** — `<form>` with `<div class="form-floating | form-outline | form-check">` blocks; pair real `<label>` with `<input class="form-control">` / `<select class="form-select">`
- **Cards** — `<div class="card">` with `card-content`, `card-title`, `card-body`, `card-footer` (`card-content` is the body wrapper; `card-body` is the text paragraph inside it — the MCP JSX will often emit these backwards)
- **Tables** — `<table class="table {variant?}">` with semantic `<thead>/<tbody>` and `<th scope="…">`
- **Navigation** — `<nav class="navbar">`, `<ul class="nav">` (tabs), `<ul class="pagination">`, `<ol class="breadcrumb">`, mobile nav top/bottom
- **Surfaces** — Modal, Accordion, Section, Page — wired via `data-cx-toggle` / `data-cx-target` where interactive
- **Feedback** — Alert, Notification, Message, Tooltip, Progress
- **Data** — Table, Chart, Carousel, Badge, Chip, Story, List
- **Communication** — Comment

For Chassis CSS classes that don't yet have a Figma component (e.g., toast, popover, offcanvas, skeleton, spinner, avatar), see [css-classes.md](./references/css-classes.md) — these may appear in hand-authored markup but won't typically come out of `get_design_context`.

## Token Translation

Chassis Figma variables follow strict namespaces. Translation to Chassis CSS classes:

| Figma namespace                               | Chassis CSS class family                                 |
| --------------------------------------------- | -------------------------------------------------------- |
| `color/context/default/{fg\|bg}-{emphasis}`   | `{fg\|bg}-{emphasis}` (default context drops the prefix) |
| `color/context/{context}/{fg\|bg}-{emphasis}` | `{context}-{fg\|bg}-{emphasis}` (canonical, prefixed)    |
| `space/context/{step}`                        | `p-{step}` / `m-{step}` / `gap-{step}`                   |
| `space/unit/{n}`                              | Avoid; use a context spacing instead                     |
| `font/html/{role}`                            | `font-{role}` (`font-h1`, `font-lead`, `font-code`)      |
| `font/text/{size}/normal`                     | `font-{size}` (text family is the default)               |
| `font/{family}/{size}/{weight}`               | `font-{family}` + `font-{size}` + `font-{weight}`        |
| `borderRadius/context/{step}`                 | `rounded-{step}`                                         |
| `borderWidth/context/{step}`                  | `border-{step}`                                          |
| `opacity/context/{step}`                      | `opacity-{step}`                                         |

**Contexts (11):** `default` (page-level neutral, inverts in dark mode), `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `alternate` (prominent content, may not invert), `neutral` (grayscale / non-semantic), `black` (persists in all modes), `white` (persists in all modes).

Full mapping in [tokens.md](./references/tokens.md).

## Theme & Mode Awareness

Chassis supports multi-theme designs via three Figma collections (Brand × Theme × App). At the code level this surfaces as:

- **No raw colors** — use `fg-*` / `bg-*` / context-prefix variants so the active CSS variable cascade resolves the correct value per active mode.
- **Theme switching** is performed by setting the active CSS context on the document or a wrapping element (e.g., `<html data-cx-theme="dark">` or a brand class wrapper). If the source view has section-level theme inversions (e.g., a dark hero on a light page), wrap that section in the inverse-theme container and let context tokens cascade.
- **Switch variables** that gate visibility in Figma (`figma/switch/theme/mode-1`) translate to **conditional rendering** in code (separate light/dark logo `<img>` tags toggled by media query or theme attribute) — not `display:none` on raw colors.

See [patterns.md → Themes & Modes](./references/patterns.md#themes--modes).

## Chassis-Specific Critical Rules

1. **No Tailwind remnants** — no `className`, `text-{color}-{n}`, `bg-{color}-{n}`, numeric spacing (`p-4`, `gap-3`), abbreviated breakpoints (`md:`, `lg:`), or arbitrary values (`p-[14px]`, `bg-[#hex]`).
2. **Space-separated modifiers** — `button primary outline large`, NOT `button-primary-outline-large`.
3. **Lift Asset text** — never render Figma `*Asset` wrapper layers as DOM nodes.
4. **Semantic HTML always** — `<button>` for buttons (not `<div role="button">`), real `<label for>`, `<table>` for tables, `<nav>` for navs.
5. **Token-bound styles only** — every color/spacing/type/radius decision maps to a Chassis class.
6. **Context tokens > unit tokens** — `space-medium` not `space-16`; `bg-main` not raw hex.
7. **`card-content` ≠ `card-body`** — the MCP output will often use `card-body` for the wrapper; in Chassis that's `card-content`. `card-body` in Chassis is the text paragraph inside `card-content`.
8. **`data-cx-*` for behaviors** — toggle, target, dismiss, theme, spy, etc.
9. **Run `get_code_connect_map` first** — if Chassis has a Code Connect snippet for the component, that's the source of truth.
10. **Run `get_variable_defs`** — never guess token classes; the variable namespaces returned are the ground truth.
11. **Don't expand hidden Figma sub-layers** — if a layer is hidden in the source, omit it from the markup.
12. **Don't mix button sizes within an action group; don't mix form styles within a single form** (regular vs floating vs outline).
13. **Always check border color against `border-main`** — a bare `border` or `border-top` resolves to `border-main` (the default context border color). If the design uses any other border color, pair a color class explicitly: `border border-subtle`, `border-top border-primary`, etc. Matching `border-main` in the design requires no extra class; any other color does.

These extend (do not replace) the rules in `figma-implement-design`. Extended anti-patterns: [patterns.md → Anti-patterns](./references/patterns.md#anti-patterns).

## Deliverable Format

| Bucket          | Meaning                                                             |
| --------------- | ------------------------------------------------------------------- |
| **Implemented** | Sections/components emitted as Chassis CSS HTML                     |
| **Reused**      | Project-existing Chassis components/snippets reused verbatim        |
| **Composed**    | Sections built from Chassis primitives (no single component fits)   |
| **Iconified**   | Localhost SVGs replaced with `@chassis-ui/icons` references         |
| **Flagged**     | Styles that required raw inline CSS — list each with reason         |
| **Blocked**     | Sections that could not be implemented — include exact failure mode |

If everything is blocked, say so plainly with the specific failure reason.

## References

- [css-classes.md](./references/css-classes.md) — Complete Chassis CSS class catalog (typography, colors, spacing, layout, components, data attributes, breakpoints)
- [tokens.md](./references/tokens.md) — Figma token namespaces → Chassis CSS class families translation
- [components.md](./references/components.md) — Chassis component family → canonical HTML/CSS output snippets
- [patterns.md](./references/patterns.md) — Asset extraction, theme switching, theme-conditional assets, anti-patterns
- [workflow.md](./references/workflow.md) — Detailed Chassis Implement playbook (Discover → Translate → Validate)

**Required Figma MCP skill (loaded from the Figma MCP server):** `figma-implement-design`.
