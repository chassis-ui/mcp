# Chassis Design Patterns

Conventions and recipes that apply across the Chassis library. Read the relevant section before working on a component family.

## Asset Override Pattern

Chassis components **do not** expose top-level text properties. All text content is set via nested instances whose layer name ends in `Asset`.

### How it works

```
Solid Button (instance)
└─ Text Asset (nested instance)        ← override TEXT property HERE
   └─ "Click me" (text node, not directly editable as a top-level prop)
```

### Common Asset names

| Asset layer name      | Found in                                                   |
| --------------------- | ---------------------------------------------------------- |
| `Text Asset`          | Buttons, badges, chips, links                              |
| `Label Asset`         | Form fields, switches, checkboxes                          |
| `Title Text Asset`    | Cards, modals, sections, alerts                            |
| `Subtitle Asset`      | Cards, list items                                          |
| `Description Asset`   | Cards, alerts, notifications                               |
| `Icon Placeholder`    | Any component with a swappable icon (use instance-swap)    |

### Procedure

1. Inspect the component instance — list all nested `*Asset` layers
2. Find the asset whose role matches your content (label, title, body, etc.)
3. Override the **TEXT property on the nested asset instance**, not on the parent
4. If no `*Asset` exists for a role you need, the component likely doesn't support that role — choose a different component or compose

### Anti-pattern

```
❌ Setting text on the parent instance:
   solidButton.text = "Click me"   // No such property — fails silently

✅ Setting text on the Asset:
   solidButton["Text Asset"].characters = "Click me"
```

### Why?

Asset overrides decouple content from layout. The same Text Asset can be reused across button styles, sizes, and states without each component needing its own text prop. It also lets components hide/show text via boolean variants (`has-icon-only`, etc.) without breaking the API.

---

## Buttons

### Choosing a button style

| Action level           | Component        | Visual treatment                                |
| ---------------------- | ---------------- | ----------------------------------------------- |
| Primary action         | `button-solid`   | `bg-solid` background, `fg-solid` text          |
| Secondary action       | `button-smooth`  | `bg-highlight` background, `fg-highlight` text  |
| Tertiary action        | `button-outline` | `border-main` border, `fg-main` text            |
| Inline / link-style    | `button-link`    | Transparent background, `link-main` text        |

### Context variants

All button styles accept the full set of color contexts: `default`, `alternate`, `primary`, `secondary`, `success`, `error`, `warning`, `info`, `black`, `white`. Choose by intent:

- **Primary action** → `context: primary`
- **Default secondary action** → `context: default`
- **Destructive action** → `context: error`
- **Confirm success** → `context: success`

### Size variants

Available: `small`, `medium` (default), `large`.

> **Never mix sizes within the same action group or section.** All buttons in a toolbar, footer, or form action row must share the same size.

### Mixing styles for hierarchy

Hierarchy via style is encouraged — e.g., a footer with `[Cancel: outline] [Save: solid primary]` creates clear primary vs. secondary affordance. Mixing styles is the right tool for visual priority.

### Boolean props (common)

| Prop              | Effect                                                |
| ----------------- | ----------------------------------------------------- |
| `has-icon-start`  | Show leading icon                                     |
| `has-icon-end`    | Show trailing icon                                    |
| `has-badge`       | Show inline badge after label                         |
| `is-dropdown`     | Show dropdown caret indicator                         |

When `has-icon-*: true`, also set `icon-*-instance` (instance-swap) to specify the icon component.

---

## Forms

### Choosing a form style

Pick **one** form style and apply it consistently across the screen — never mix `regular`, `floating`, and `outline` in the same form.

| Style           | When to use                                                                |
| --------------- | -------------------------------------------------------------------------- |
| `form-regular`  | Standard forms — most common, label above field                            |
| `form-floating` | Material-inspired — floating labels animate from placeholder to label      |
| `form-outline`  | Material-inspired — prominent border, no background                        |

### Form Check (checkboxes / radios)

Use `form-check` for both checkboxes and radio buttons. Available variants:

- **Type**: `checkbox` / `radio`
- **State**: `default`, `hover`, `active`, `disabled`
- **Selected**: `true` / `false`

### Field composition

Most form components compose: outer field wrapper + nested label + nested input + nested helper/error text. Override via the appropriate `*Asset` layers.

### Validation states

Use `state` and/or `context` props to show validation:

- **Error** → `context: error` + error message via `Helper Text Asset`
- **Success** → `context: success` + confirmation via `Helper Text Asset`
- **Disabled** → `state: disabled`

---

## Tables

Tables are **composed**, not monolithic. Build bottom-up:

```
Table Data Cell ─┐
                 ├─→ Table Row ─→ Table
Table Head Cell ─┘
```

### Procedure

1. **Build a row** — combine `Table Head Cell` instances (for header row) or `Table Data Cell` instances (for body rows) horizontally
2. **Variants per cell** — set `type` per cell: `basic`, `form`, `button`, `icon`, `badge`, `check`, `custom`
3. **Component-ize the row** — convert your assembled row to a component with at least 2 variants (e.g., `default`, `hover`)
4. **Stack rows** — assemble the full table by stacking the row component
5. **Add header row** — using `Table Head Cell` with sorting/filtering props as needed

### Header cell props

| Prop          | Purpose                                                          |
| ------------- | ---------------------------------------------------------------- |
| `checkbox`    | Show selection checkbox in header (for selectable tables)        |
| `filtering`   | Show filter UI (dropdown / search)                               |
| `has-sorting` | Enable sort indicator (when `checkbox: false`)                   |
| `has-input`   | Show inline input (when `checkbox \|\| filtering`)              |

### Why composition?

Composing rows from cells (instead of one giant Table component) means you can:

- Swap individual cell types per column without affecting others
- Reuse the same row component across tables with different layouts
- Update one cell variant globally to propagate everywhere

---

## Themes & Modes

Chassis uses Figma's variable collections for multi-theme support:

| Collection | Modes                                                  |
| ---------- | ------------------------------------------------------ |
| Brand      | Brand A, Brand B, ... (brand identity)                 |
| Theme      | Light, Dark, High Contrast, ... (color modes)          |
| App        | Web, iOS, Android, ... (platform variants)             |

### Switching levels

| Level     | When to use                                                      | How                                                |
| --------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| Page      | Preview entire file in another theme                             | Deselect all → Page panel → Apply variable mode    |
| Frame     | Design a section in a specific theme                             | Select frame → Appearance panel → Apply variable mode |
| Component | Override theme for one instance (e.g., dark CTA on light page)   | Select instance → Appearance → Apply variable mode |

### Theme-conditional content (switch variables)

For content that **structurally** changes between themes (logos, illustrations, theme-specific imagery), use Chassis switch variables for layer visibility:

```
Header Component
├─ Logo Light → Visibility: figma/switch/theme/mode-1
└─ Logo Dark  → Visibility: figma/switch/theme/mode-2
```

This enables a single component to morph across themes without instance swapping.

### Designing for multiple themes

1. **Always** build with context-based color tokens — they auto-invert across modes
2. Validate the screen in **all relevant theme combinations** before sign-off
3. Don't treat dark mode as an afterthought — design and test it in parallel with light
4. For brand variants, validate all brand × theme combinations at section level

---

## Anti-patterns

Reject these when working in Chassis:

### Token & variable

- ❌ **Hardcoded hex/rgb colors** — use `color/context/*` tokens
- ❌ **Hardcoded pixel spacing** — use `space/context/*` or `space/unit/*`
- ❌ **Hardcoded font properties** — use `font/*` text styles
- ❌ **Custom border radii / widths** — use `borderRadius/context/*` or `borderWidth/context/*`
- ❌ **Custom opacity values** — use `opacity/context/*` or `opacity/level/*`

### Component usage

- ❌ **Setting text on parent component** — use the nested `*Asset` (Asset Override Pattern)
- ❌ **Importing by component name** — use `componentKey` (names can collide / change)
- ❌ **Revealing hidden sub-layers** — only the documented prop API is supported
- ❌ **Mixing button sizes within an action group** — pick one size per group
- ❌ **Mixing form styles within one form** — pick `regular`, `floating`, or `outline` and stick with it
- ❌ **Using `Dropdown Button @ 0.2`** — deprecated, use `Dropdown Button`

### Layout & structure

- ❌ **Converting frames to auto-layout opportunistically** — only when user requests structural cleanup
- ❌ **Losing position info** — when replacing inside a non-auto-layout parent, preserve `x`, `y`, `width`, `height` explicitly
- ❌ **Detached instances** — never detach a library component to "fix" a missing variant; either use a different component, compose, or report blocked

### Workflow

- ❌ **Rewriting a whole screen in one operation** — always section-by-section
- ❌ **Inventing custom components** — if the library doesn't have it, report blocked
- ❌ **Skipping validation** — confirm each section visually before moving on
