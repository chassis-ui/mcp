# Chassis Implement Workflow

## Phase 1 — Prepare

1. **Source**: Figma URL → `fileKey` and `nodeId` (`-` → `:`), or the active selection.
2. **Target**: which file or route; new page or a slot in an existing layout; which themes the design covers.
3. **CSS mode**: `tailwind` when the project depends on `tailwindcss` and imports `@chassis-ui/css/tailwind` (or `@use "@chassis-ui/css/scss/tailwind"`); otherwise `native`. Note which JS entry the project loads (`dist/js/chassis.bundle.min.js`, or imports from `@chassis-ui/css`).
4. **Tools**: Figma MCP connected; `figma-design-to-code` loaded.
5. **Reuse**: search the project for existing partials of the same sections; reuse over recreation. The framework's own examples are the docs in `chassis-css/packages/site/content/docs/` when that repo is at hand.

## Phase 2 — Discover

6. `get_metadata` for the node tree; mark sections, Chassis instances (`<instance>`), raw frames (`<frame>`), slots (`<slot>`) and hidden layers (`hidden="true"`).
7. `get_code_connect_map`; a mapped node is emitted verbatim. When the tool answers that the plan has no Code Connect, nothing is mapped: go on.
8. `get_variable_defs` for the node (a top-level node id, not one inside an instance); build the variable → class lookup with tokens.md, translating long size names to short ones.
9. `get_design_context` per section, at the frame or instance that owns a slot and not at a node inside one; when the response is sparse or metadata only, one call per visible child.
10. The screenshot that comes with each call is the visual target; `get_screenshot` for the whole view, and for a section whose call returned none.

## Phase 3 — Translate

For each section, top to bottom, outer to inner:

11. **Component**: find the Figma component in components.md by its name (patterns.md → Reading the Figma output when the layer was renamed); emit its markup; variants → modifiers (`{root} {color} {style} {size}`, the style from the component's name); a boolean that is `false` → omit the child.
12. **Text**: lift the text of every `<Role> Asset` and plain text layer into the semantic element; never a wrapper.
13. **Styles**: for the properties the component does not already own, add the token classes. Padding, font and color of a `button`, `card-body`, `notification` are built in: do not repeat them.
14. **Layout**: auto-layout → `d-flex gap-{size}` / `vstack` / `hstack`; columns → `grid` + `col-span-*`; frames of the same view at other widths → `sm:` … `2xl:` prefixes, mobile-first.
15. **Behavior**: `data-cx-toggle`, `data-cx-target`, `data-cx-dismiss`, `data-cx-placement`, plus the ids and ARIA the component's snippet shows.
16. **Icons**: Chassis Icons references, by the glyph's name (`pen-solid`) or, for a layer named by its role, by what the screenshot shows; a non-Chassis icon falls back to the downloaded SVG and is flagged. Other images are downloaded as the response of `get_design_context` says.
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
| Long size names               | `-(2x\|3x\|4x\|5x\|6x)?(small\|medium\|large)\b`                                                                                                                                                                                      |
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
