# Chassis Implement Workflow

What the SKILL.md does not say: what is settled before the first Figma call, the lint checklist that runs on the written markup, the order of component mode, and the failures with their fixes. The phases of the work are the Workflow overlay of the SKILL.md on `figma-design-to-code` and are not repeated here. `{ctx}` in a pattern or a fix stands for a context color name, `{size}` for a step of the size scale, as in css-classes.md.

## Before the first Figma call

- **Source**: a Figma URL gives `fileKey` and `nodeId` (`-` → `:`); without one, the active selection.
- **Target**: which file or route; a new page or a slot in an existing layout; which themes the design covers. A standalone page loads `dist/css/chassis.css` and, as a module, `dist/js/chassis.bundle.min.js` of `@chassis-ui/css`, and the sprite `chassis-icons.svg` of `@chassis-ui/icons` from wherever the project serves it: the `href` of a `<use>` is that path plus `#{name}-{style}`.
- **CSS mode**: as the SKILL.md says. Note which JS entry the project loads (`dist/js/chassis.bundle.min.js`, or imports from `@chassis-ui/css`).
- **Reuse**: search the project for existing partials of the same sections; reuse over recreation. The framework's own examples are the docs in `chassis-css/packages/site/content/docs/` when that repo is at hand.

## Lint checklist

Grep the output; every hit is a defect unless flagged in the summary.

| Check                         | Pattern                                                                                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSX leak                      | `className=`                                                                                                                                                                                                                            |
| Tailwind colors               | `\b(text\|bg\|border)-(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose)-\d`                                                     |
| Numeric spacing or size       | `\b(p\|px\|py\|pt\|pb\|ps\|pe\|m\|mx\|my\|mt\|mb\|ms\|me\|gap\|row-gap\|column-gap\|space-[xy]\|w\|h)-[1-9]\d*\b` (except `w-25` `w-50` `w-75` `w-100`, the same `h-*` fractions and `w-{n}/12`; the `-0` forms exist and are not hits) |
| Long size names               | `-(\d?x)?(small\|medium\|large)\b`                                                                                                                                                                                                      |
| Old breakpoint forms          | `\b(small\|medium\|large\|xlarge\|2xlarge):`, `-(sm\|md\|lg\|xl\|xxl)-\d`, `d-(sm\|md\|lg)-`                                                                                                                                            |
| Removed grid                  | `\b(row\|col(-\d+)?\|offset-\d+\|g[xy]?-\d+\|row-cols-\d+)[\s"]` inside `class="…"` (`row-gap-*`, `col-span-*`, `col-start-*` and `grid-cols-*` are not hits)                                                                           |
| Bootstrap / old Chassis parts | `\b(btn\|card-content\|card-text\|card-img\|form-control\|form-select\|form-check-input\|form-text\|dropdown\|modal-dialog\|modal-content\|offcanvas\|list-group\|page-item\|page-link\|nav-pills\|font-h[1-6]\|alert-dismissible)\b`   |
| Arbitrary values              | `\[[^\]]+\]` inside `class="…"`                                                                                                                                                                                                         |
| Raw values                    | `#[0-9a-f]{3,8}\b`, `style="` (allowed: `progress-bar` width)                                                                                                                                                                           |
| Asset wrappers                | `-asset\b`                                                                                                                                                                                                                              |
| Hyphenated modifiers          | `\b(button\|badge\|chip\|alert\|notification)-(primary\|secondary\|success\|danger\|warning\|info)`                                                                                                                                     |
| Wrong attributes              | `data-bs-`, `data-cx-toggle="(modal\|offcanvas\|dropdown\|alert)"`                                                                                                                                                                      |
| Class not in catalog          | every class value exists in css-classes.md                                                                                                                                                                                              |

Then: ARIA and `for` attributes present; `<dialog>` for modals and drawers; `aria-current` on active nav and list items; hidden Figma layers absent.

## Component mode

`get_design_context` → `get_code_connect_map` (verbatim if mapped) → `get_variable_defs` → component in components.md → modifiers → Asset and layer text → token classes → `data-cx-*` → screenshot check.

## Failure modes

| Symptom                                 | Cause                                               | Fix                                                                      |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Empty text                              | Read the instance, not the layers inside it         | Walk the tree for `<Role> Asset` and plain text layers, lift the text    |
| Class has no effect                     | Not a Chassis class                                 | Look it up in css-classes.md; translate long names; drop Bootstrap forms |
| Everything one track wide               | Items without `col-span-*`                          | `col-span-full` for the mobile layout                                    |
| Modal shows in the page flow            | `<div class="modal">`                               | `<dialog class="modal dialog">` and the Dialog plugin                    |
| Menu never opens                        | `data-cx-toggle="dropdown"`                         | `data-cx-toggle="menu"` on the button, `.menu` as the next sibling       |
| Card unstyled inside                    | `card-content`                                      | `card-body`                                                              |
| Colors ignore the context               | `{ctx}-fg-*` per element on a non-colored component | `context {ctx}` on the root                                              |
| Dark mode does not switch               | Raw colors, or `prefers-color-scheme` only          | Token classes; `data-cx-theme` on `<html>`                               |
| `@md:` class does nothing               | No query container                                  | `contains-inline` on an ancestor, or `grid contained`                    |
| Tailwind mode: class missing at runtime | Name built from parts                               | Literal class in source, or the safelist                                 |
| `get_design_context` sparse             | Section too large                                   | `get_metadata`, then one call per visible child                          |
| A frame comes back without children     | Fetched by its own id inside a slot                 | Fetch the instance that owns the slot                                    |
| Icon blank                              | Asset not downloaded, or another glyph name         | Chassis Icons reference by the glyph's name                              |
