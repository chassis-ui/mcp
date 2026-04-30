---
name: chassis-create-design
description: "Build or update a Figma design (screen, page, view, modal, dialog, drawer, sidebar, panel, dashboard, landing page, or any multi-section layout) using the Chassis UI Figma library. Use when the user wants to create, compose, assemble, or reconnect a Figma view from code, a screenshot, a description, or an existing detached layout. Runs on top of the Figma MCP server skills (`figma-use`, `figma-generate-design`) and adds Chassis-specific component, token, asset-override, and theme-switching conventions. Do NOT use for: single-component fixes, generating code FROM Figma (use `chassis-implement-design`), or pure token/variable edits."
disable-model-invocation: false
---

# Build / Update Screens and Views using the Chassis UI Figma Library

This skill specializes the generic Figma screen-building workflow with **Chassis-specific** rules: the Asset Override Pattern, the Chassis token namespaces, the Chassis component catalog, and the Brand/Theme/App multi-mode system.

## ⛔ Required Figma MCP Skills

This skill is a **specialization layer** that runs on top of the Figma MCP server. The Figma MCP server provides the canonical screen-building skills — load them **before** doing any work in this skill:

| Order | Skill                               | Why                                                                                                                                                                                                                                                                                                                                |
| ----- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `figma-use`                         | **MANDATORY before ANY `use_figma` call.** Plugin API rules: color ranges (0–1), font preloading, page context, `setBoundVariableForPaint` returning new paints, `layoutSizingHorizontal/Vertical = 'FILL'` ordering, returning IDs, error recovery. Skipping causes silent, hard-to-debug failures.                               |
| 2     | `figma-generate-design`             | **MANDATORY for screen/view work.** Provides the canonical 6-step workflow: Understand Deliverable → Collect Components/Variables/Styles → Create Wrapper Frame → Build Sections → Validate & Transfer Images → Update Existing Views. This skill **does not redefine that workflow** — it overlays Chassis-specific rules on top. |
| 3     | `chassis-create-design` (this file) | Chassis specialization layer — read after the two above.                                                                                                                                                                                                                                                                           |

**Logging:** Pass `skillNames: "figma-use,figma-generate-design,chassis-create-design"` on every `use_figma` call made under this skill. This is a logging parameter — does not affect execution.

If Figma MCP tools appear as deferred tools, batch-load their schemas in **one** `tool_search` call: e.g. `tool_search query="select:use_figma,get_screenshot,get_metadata,search_design_system,generate_figma_design"`.

## When to Use

When the deliverable is a **composed Figma view** built from Chassis library components — full-page screens, modals, dialogs, drawers, sidebars, panels, dashboards, landing pages, or any multi-section container.

| Mode        | Use when                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `build`     | Creating a new screen from scratch, or from code / screenshot / description / live URL                |
| `reconnect` | Replacing detached layers or local wrappers in an existing view with proper Chassis library instances |

## When NOT to Use

- **Single targeted component fix** — work directly on the component
- **Generating code FROM Figma** — switch to `chassis-implement-design`
- **Pure variable/token edits** — use Figma directly or the `chassis-tokens` repo
- **Asset/icon import only** — use `figma-use` directly

## Prerequisites

- Figma MCP server connected with: `use_figma`, `search_design_system`, `get_metadata`, `get_screenshot`, `get_design_context`, `generate_figma_design`
- Target file URL/key (extract `fileKey` and optional `nodeId` from the URL — convert `-` to `:` in nodeId)
- Chassis library available to the target file (published or linked)
- Source: code path, screenshot URL, written description, **or live web URL**

## ⚠️ Parallel Workflow with `generate_figma_design` (web sources)

When the source is a **live web app / URL**, or when **the source contains images** (whether web or not), follow the parallel workflow defined in the Figma MCP `figma-generate-design` skill ("Parallel Workflow with generate_figma_design" section):

1. **In parallel:**
   - Start the Chassis component-instance build via `use_figma` (Steps 3–4 of `figma-generate-design`)
   - Run `generate_figma_design` to capture a pixel-perfect screenshot of the running web app
2. **After both complete:** refine the component-instance build to match the screenshot's spacing/sizing, and **transfer images** from the capture by copying `imageHash` values onto your target frames (see `figma-generate-design` Step 5).
3. **Then delete the `generate_figma_design` capture frame.**

> **`generate_figma_design` is MANDATORY when the source contains images.** The Plugin API cannot fetch external image URLs — it can only set `IMAGE` fills using `imageHash` values from nodes already in the file. Skipping the capture leaves image frames blank.

For non-web sources without images (e.g., text-only descriptions, native mobile mocks, internal screenshots already in Figma), the standard `use_figma`-only workflow is fine.

## 🔑 Core Chassis Rule — Asset Layer Override Pattern

Chassis components expose **no top-level text properties**. Text content is set by overriding **nested instances whose name ends in `Asset`** — e.g., `Text Asset`, `Label Asset`, `Title Text Asset`, `Subtitle Asset`, `Description Asset`. These nested instances expose their own `TEXT` properties.

> **Never assume a Chassis component has `label`, `text`, or `title` props.** Inspect first; if absent, drill into the child `*Asset` instance and call `setProperties()` on **that** instance.

This overrides the default `figma-generate-design` Step 4 pattern of calling `setProperties()` on the top-level instance. See [patterns.md → Asset Override Pattern](./references/patterns.md#asset-override-pattern) for examples.

## 🔑 Core Chassis Rule — Boolean Visibility Props Default `true`

Almost every Chassis component gates its optional sub-elements (leading icon, trailing icon, badge, dropdown caret, helper text, etc.) behind boolean props (`has-icon-start`, `has-icon-end`, `has-badge`, `is-dropdown`, ...) — and **all of them default to `true`**. A freshly placed instance shows every decoration; you must explicitly set the unwanted ones to `false` to get a minimal instance.

> Forgetting this is the most common reason Chassis instances look heavier than the source design. Always inspect `componentProperties` after placement and subtract what your design doesn't need before applying Asset Overrides.

See [patterns.md → Boolean Visibility Props](./references/patterns.md#boolean-visibility-props--default-true).

## Workflow — Chassis Overlay on `figma-generate-design`

Follow the 6-step workflow defined by the Figma MCP `figma-generate-design` skill. Apply these **Chassis-specific overrides** at each step:

### Step 1 — Understand the Deliverable

- Identify whether the source contains images → trigger parallel `generate_figma_design` capture if yes
- Identify which Chassis themes/modes the deliverable targets (Brand × Theme × App combinations)

### Step 2 — Collect Components, Variables, Styles

- **2a-i (Code Connect):** check chassis-website / chassis-css for `*.figma.tsx` / `*.figma.ts` files first
- **2a-ii (existing screens):** inspect any existing Chassis screens in the target file
- **2a-iii (search_design_system):** search by Chassis family names — `button-solid`, `form-regular`, `navbar`, `card`, `modal`, `table`, etc. (full list in [components.md](./references/components.md)). The result includes the `componentKey` — use it directly for `import_components` / `use_figma`. **Never import by component name** (names can collide and change).
- **2b (variables + text styles):** Chassis variables follow strict namespaces — `color/context/...`, `space/context/...`, `typography/...` etc. See [tokens.md](./references/tokens.md). **Typography is special:** `font/{family}/{size}/{weight}` (e.g. `font/text/medium/normal`) is a **Figma text style**, not a variable — the underlying `typography/*` variables compose into it. Apply the **text style**, not the individual typography variables. See [typography.md](./references/typography.md). **Never** conclude "no variables" or "no styles" from `getLocalVariableCollectionsAsync()` / `getLocalTextStylesAsync()` alone — `search_design_system` (with `includeVariables` / `includeStyles`) is the source of truth for library assets.

### Step 3 — Create the Wrapper Frame First

- Size the wrapper to a Chassis `grid/breakpoint/*` token rather than a pixel literal. Most common page widths: `2xlarge` (desktop), `large` (tablet), `xsmall` (mobile). Modals, drawers, and panels size off `size/context/*` or fixed component widths defined by the source. Adapt to the source.
- Bind background/spacing to Chassis context tokens immediately so theme switching works for free.

### Step 4 — Build Each Section Inside the Wrapper

- One section per `use_figma` call (mandatory).
- **Asset overrides instead of top-level `setProperties` for text** — see core rule above.
- Use Chassis context tokens for paddings/gaps via `setBoundVariable`, not pixel literals.
- Use `setBoundVariableForPaint` with Chassis color tokens for fills/strokes — capture the returned paint and reassign.
- **For typography, apply a `font/*` text style** via `importStyleByKeyAsync` + `setTextStyleIdAsync` (after `loadFontAsync`). Do **not** set raw font family/size/weight, and do **not** bind individual `typography/*` variables on production text. See [typography.md](./references/typography.md).
- Don't reveal hidden sub-layers (Back Button, Title Badge, Subtitle Action, Filters row, Aside, Empty states, etc.) unless explicitly required.
- Don't mix button sizes within one action group; don't mix form styles within one form (regular vs floating vs outline).

### Step 5 — Validate Each Section + Transfer Images

- `get_screenshot` per section, not just the full view, to catch placeholder text and clipped Asset layers.
- If `generate_figma_design` was used: transfer `imageHash` values into the corresponding Chassis frames, then delete the capture.

### Step 6 — Updating an Existing View / `reconnect` Mode

- Inventory layers as `library-instance` / `detached` / `local-wrapper` / `raw-frame`.
- Preserve `x`, `y`, `width`, `height` explicitly when replacing inside **non-auto-layout** parents.
- Use `instance.swapComponent(newVariant)` rather than delete-and-recreate so prop overrides survive.
- Do **not** convert frames to auto-layout unless the user explicitly asks for structural cleanup.

Detailed Chassis procedures, including the full Reconnect Mode playbook, are in [workflow.md](./references/workflow.md).

## Design Tokens (Chassis namespaces)

| Family                | Pattern                                                | Kind                                                  |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Colors                | `color/context/{context}/{role}-{emphasis}`            | variable                                              |
| Typography (applied)  | `font/{family}/{size}/{weight}`                        | **text style** (composed of `typography/*` variables) |
| Typography (raw vars) | `typography/{property}/{...}`                          | variable — only used **inside** text styles           |
| Spacing               | `space/context/{context}` or `space/unit/{unit}`       | variable                                              |
| Sizing                | `size/context/{context}` or `size/unit/{unit}`         |
| Radius                | `borderRadius/context/{context}`                       |
| Border width          | `borderWidth/context/{context}`                        |
| Opacity               | `opacity/context/{context}` or `opacity/level/{level}` |

**Always prefer `context` tokens over `unit`/`level` tokens** — context tokens swap correctly across themes/modes; unit tokens do not. Full reference: [tokens.md](./references/tokens.md). **For typography, always apply text styles** — see [typography.md](./references/typography.md).

## Component Catalog

Chassis ships documented component families covering Actions, Forms, Navigation, Surfaces, Feedback, Data, and Communication. See [components.md](./references/components.md) for the full catalog. Resolve `componentKey`s at runtime via `search_design_system`.

Families with non-trivial composition rules:

- **Buttons** (solid, smooth, outline, link, group) — see [patterns.md → Buttons](./references/patterns.md#buttons)
- **Forms** (regular, floating, outline, form-check — each ships a bare input + a wrapper field) — see [patterns.md → Forms](./references/patterns.md#forms)
- **Tables** (cell → row → table compose-up) — see [patterns.md → Tables](./references/patterns.md#tables)

## Theme & Mode Awareness

Chassis supports multi-theme designs via three Figma variable collections — **Brand**, **Theme**, **App**. To switch a section across themes/modes:

- Use **context** tokens, not raw color values — they invert/swap automatically.
- Set theme overrides at the **wrapper frame** level for whole-screen theme switching: `frame.setExplicitVariableModeForCollection(themeCollection, modeId)`.
- Use Chassis **switch variables** (`figma/switch/theme/mode-1`, etc.) to toggle layer visibility for theme-conditional content (logos, illustrations).

See [patterns.md → Themes & Modes](./references/patterns.md#themes--modes).

## Chassis-Specific Critical Rules

1. **Asset Override Pattern for ALL text** — never assume top-level text props on Chassis components.
2. **Boolean visibility props default to `true`** — explicitly set `has-*` / `is-*` props to `false` for sub-elements your design doesn't need; otherwise instances arrive with every decoration visible.
3. **Prefer `componentKey` over name** when importing — resolve at runtime via `search_design_system`. Names can collide and change.
4. **Don't reveal hidden sub-layers** unless explicitly required.
5. **Preserve `x`/`y`/`width`/`height`** when replacing inside non-auto-layout parents.
6. **Don't convert frames to auto-layout** without explicit user request.
7. **Never use components named `… @ x.x`** — the `@ x.x` suffix marks a deprecated-but-still-published version. Use the same-named component without the suffix. See [components.md → Deprecated / Avoid](./references/components.md#deprecated--avoid).
8. **One section per `use_figma` call.**
9. **No raw colors / spacing / type** — always bind a Chassis variable, or apply a `font/*` text style for typography (never raw font values, never individual `typography/*` variable bindings on production text). If none fits, ask the user before hardcoding.
10. **Don't mix button sizes within an action group; don't mix form styles within a form.**
11. **`generate_figma_design` is mandatory when the source contains images** — the Plugin API cannot fetch image URLs.

These extend (do not replace) the rules in `figma-use` and `figma-generate-design`. Extended anti-patterns: [patterns.md → Anti-patterns](./references/patterns.md#anti-patterns).

## Deliverable Format

| Bucket                | Meaning                                                               |
| --------------------- | --------------------------------------------------------------------- |
| **Built**             | New sections/screens created using Chassis library components         |
| **Swapped**           | Existing instances swapped to the correct Chassis variant             |
| **Composed**          | Sections rebuilt from Chassis primitives (no single component fits)   |
| **Already connected** | Sections already on valid Chassis library instances                   |
| **Blocked**           | Sections that could not be connected — include the exact failure mode |

If everything is blocked, say so plainly with the specific failure reason.

## References

- [tokens.md](./references/tokens.md) — Complete Chassis token system reference
- [typography.md](./references/typography.md) — Text styles vs typography variables, and how to apply them
- [components.md](./references/components.md) — Full Chassis component catalog
- [patterns.md](./references/patterns.md) — Asset overrides, buttons, forms, tables, themes, anti-patterns
- [workflow.md](./references/workflow.md) — Detailed Chassis Build & Reconnect playbooks

**Required Figma MCP skills (loaded from the Figma MCP server):** `figma-use`, `figma-generate-design`.
