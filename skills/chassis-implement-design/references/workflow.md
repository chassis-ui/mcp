# Chassis Implement Workflow

## Phase 1 — Prepare

1. **Source**: Figma URL → `fileKey` and `nodeId` (`-` → `:`), or the active selection.
2. **Target**: which file or route; new page or a slot in an existing layout; which themes the design covers.
3. **CSS mode**: `tailwind` when the project depends on `tailwindcss` and imports `@chassis-ui/css/tailwind` (or `@use "@chassis-ui/css/scss/tailwind"`); otherwise `native`. Note which JS entry the project loads (`dist/js/chassis.bundle.min.js`, or imports from `@chassis-ui/css`).
4. **Tools**: Figma MCP connected; `figma-design-to-code` loaded.
5. **Reuse**: search the project for existing partials of the same sections; reuse over recreation. The framework's own examples are the docs in `chassis-css/packages/site/content/docs/` when that repo is at hand.

## Phase 2 — Discover

6. `get_metadata` for the node tree; mark sections and Chassis instances versus raw frames.
7. `get_code_connect_map`; a mapped node is emitted verbatim.
8. `get_variable_defs` for the node; build the variable → class lookup with tokens.md, translating long size names to short ones.
9. `get_design_context` per section; drill further when the output truncates.
10. `get_screenshot` for the whole view and per section.

## Phase 3 — Translate

For each section, top to bottom, outer to inner:

11. **Component**: find the Figma family in components.md; emit its markup; variants → modifiers (`{root} {color} {style} {size}`); `has-*=false` → omit the child.
12. **Text**: lift every `*Asset` TEXT into the semantic element; never a wrapper.
13. **Styles**: for the properties the component does not already own, add the token classes. Padding, font and color of a `button`, `card-body`, `notification` are built in: do not repeat them.
14. **Layout**: auto-layout → `d-flex gap-{size}` / `vstack` / `hstack`; columns → `grid` + `col-span-*`; breakpoint variants → `sm:` … `2xl:` prefixes, mobile-first.
15. **Behavior**: `data-cx-toggle`, `data-cx-target`, `data-cx-dismiss`, `data-cx-placement`, plus the ids and ARIA the component's snippet shows.
16. **Icons**: Chassis Icons references; a non-Chassis icon falls back to the downloaded SVG and is flagged.
17. **Check the section** against its screenshot; adjust by choosing another token class.

## Phase 4 — Themes

18. Render under `data-cx-theme="light"` and `"dark"` when the design has both modes. Fix low contrast and non-inverting colors at the class level. Theme-gated images → conditional markup.

## Phase 5 — Lint checklist

Grep the output; every hit is a defect unless flagged in the summary.

| Check                         | Pattern                                                                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSX leak                      | `className=`                                                                                                                                                                                                                          |
| Tailwind colors               | `\b(text\|bg\|border)-(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose)-\d`                                                   |
| Numeric spacing or size       | `\b(p\|px\|py\|pt\|pb\|ps\|pe\|m\|mx\|my\|mt\|mb\|ms\|me\|gap\|space-[xy]\|w\|h)-\d+\b` (except `w-25` `w-50` `w-75` `w-100` `h-*` percentages and `w-{n}/12`)                                                                        |
| Long size names               | `-(2x\|3x\|4x\|5x\|6x)?(small\|medium\|large)\b`, `rounded-round`                                                                                                                                                                     |
| Old breakpoint forms          | `\b(small\|medium\|large\|xlarge\|2xlarge):`, `-(sm\|md\|lg\|xl\|xxl)-\d`, `d-(sm\|md\|lg)-`                                                                                                                                          |
| Removed grid                  | `class="[^"]*\b(row\|col(-\d+)?\|offset-\|g-\|gx-\|gy-\|row-cols-)`                                                                                                                                                                   |
| Bootstrap / old Chassis parts | `\b(btn\|card-content\|card-text\|card-img\|form-control\|form-select\|form-check-input\|form-text\|dropdown\|modal-dialog\|modal-content\|offcanvas\|list-group\|page-item\|page-link\|nav-pills\|font-h[1-6]\|alert-dismissible)\b` |
| Arbitrary values              | `\[[^\]]+\]` inside `class="…"`                                                                                                                                                                                                       |
| Raw values                    | `#[0-9a-f]{3,8}\b`, `style="` (allowed: `progress-bar` width)                                                                                                                                                                         |
| Asset wrappers                | `-asset\b`                                                                                                                                                                                                                            |
| Hyphenated modifiers          | `\b(button\|badge\|chip\|alert\|notification)-(primary\|secondary\|success\|danger\|warning\|info)`                                                                                                                                   |
| Wrong attributes              | `data-bs-`, `data-cx-toggle="(modal\|offcanvas\|dropdown\|alert)"`                                                                                                                                                                    |
| Class not in catalog          | every class value exists in css-classes.md                                                                                                                                                                                            |

Then: ARIA and `for` attributes present; `<dialog>` for modals and drawers; `aria-current` on active nav and list items; hidden Figma layers absent.

## Phase 6 — Report

Summary with the CSS mode, then Implemented / Reused / Composed / Iconified / Flagged / Blocked.

## Component mode

`get_design_context` → `get_code_connect_map` (verbatim if mapped) → `get_variable_defs` → family in components.md → modifiers → Asset text → token classes → `data-cx-*` → screenshot check.

## Failure modes

| Symptom                                 | Cause                                               | Fix                                                                      |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Empty text                              | Read the instance, not its `*Asset` children        | Walk the tree for `*Asset`, lift TEXT                                    |
| Class has no effect                     | Not a Chassis class                                 | Look it up in css-classes.md; translate long names; drop Bootstrap forms |
| Everything one track wide               | Items without `col-span-*`                          | `col-span-full` for the mobile layout                                    |
| Modal shows in the page flow            | `<div class="modal">`                               | `<dialog class="modal dialog">` and the Dialog plugin                    |
| Menu never opens                        | `data-cx-toggle="dropdown"`                         | `data-cx-toggle="menu"` on the button, `.menu` as the next sibling       |
| Card unstyled inside                    | `card-content`                                      | `card-body`                                                              |
| Colors ignore the context               | `{ctx}-fg-*` per element on a non-colored component | `context {ctx}` on the root                                              |
| Dark mode does not switch               | Raw colors, or `prefers-color-scheme` only          | Token classes; `data-cx-theme` on `<html>`                               |
| `@md:` class does nothing               | No query container                                  | `contains-inline` on an ancestor, or `grid contained`                    |
| Tailwind mode: class missing at runtime | Name built from parts                               | Literal class in source, or the safelist                                 |
| `get_design_context` truncated          | Section too large                                   | `get_metadata`, then per-subsection context                              |
| Icon blank                              | Download failed                                     | Chassis Icons reference by name                                          |
