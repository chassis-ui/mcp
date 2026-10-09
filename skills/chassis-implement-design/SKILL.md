---
name: chassis-implement-design
description: 'Implement a Figma design made with the Chassis UI Figma library as production HTML using Chassis CSS (`@chassis-ui/css` 0.7), in a native CSS project or a Tailwind CSS v4 project that uses the Chassis Tailwind entry. Use when the user wants to translate, generate, build, or convert a Chassis Figma view, screen, page, modal, drawer, panel, dashboard, landing page, or component into shipping markup with 1:1 visual fidelity. Runs on top of the Figma MCP server skill `figma-design-to-code` and adds the Chassis class catalog, the Figma-token-to-class translation, Asset text extraction, component markup, and theming. Do NOT use for: writing INTO Figma (use `chassis-create-design`), React components, token/SCSS edits, or non-Chassis design systems.'
disable-model-invocation: false
---

# Implement Chassis Figma Designs as Chassis CSS HTML

This skill converts a Figma view built from the Chassis UI library (the components of `cx.components.UI`, the variables and styles of `cx.tokens.MAIN`) into HTML that uses Chassis CSS classes, Chassis JavaScript data attributes, and nothing else for styling. It works for two kinds of project:

| CSS mode   | The project                                                                                               | Prefix variants available on utilities                                                                               |
| ---------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `native`   | Loads `@chassis-ui/css/dist/css/chassis.css` or compiles `@use "@chassis-ui/css/scss/chassis"`            | The ones listed per family in css-classes.md (`sm:`–`2xl:`, `@sm:`–`@2xl:`, `print:`)                                |
| `tailwind` | Imports `@chassis-ui/css/tailwind` (CSS) or `@use "@chassis-ui/css/scss/tailwind"` with Tailwind CSS 4.1+ | Every Tailwind variant on every Chassis utility: `dark:`, `light:`, `hover:`, `sm:`–`2xl:`, `@sm:`–`@2xl:`, `print:` |

The class names are the same in both modes. Detect the mode from the project (a `tailwindcss` dependency and an import of `@chassis-ui/css/tailwind` mean `tailwind`); when there is no project, ask, and default to `native`.

## ⛔ Required Figma MCP skill

Load `figma-design-to-code` from the Figma MCP server before any code generation. It says how a design is fetched (`get_design_context` with its screenshot, one call per visible child when a response is sparse), that what the project has is reused, that Code Connect is applied at its node, that every asset is used and downloaded, and that the result is verified; this skill overlays Chassis rules on it and does not redefine it. If the Figma tools are deferred, load them in one call of the client's tool search: `select:get_design_context,get_screenshot,get_metadata,get_variable_defs,get_code_connect_map`.

To write to Figma instead, stop and use `chassis-create-design`.

## Modes

| Mode        | Deliverable                                                |
| ----------- | ---------------------------------------------------------- |
| `screen`    | A full page, view, modal, drawer or dashboard              |
| `section`   | One region of a page (header, hero, feature block, footer) |
| `component` | One component instance as a reusable snippet               |

Not for: React (`@chassis-ui/react` has its own conventions), token or SCSS edits (`chassis-tokens`, `chassis-css`), non-Chassis designs (plain `figma-design-to-code`).

## The ten rules

1. **The MCP code block is not Chassis.** `get_design_context` returns React + Tailwind with arbitrary values: a bound property carries its variable (`gap-[var(--space\/context\/medium,16px)]`), an unbound one a bare value (`gap-[16px]`). Read it for the layer nesting, the layer names (`data-name`), the text and the variable on each property ([patterns.md](./references/patterns.md#reading-the-figma-output)). Never copy a class from it: none is a Chassis class. The resolved hex and px values are a visual cross-check only.
2. **Every style comes from a token.** Run `get_variable_defs`, which lists the variables and text styles of the node by their exact names, and map each to a class with [tokens.md](./references/tokens.md). No variable for a property means ask, not guess. The only inline style allowed without flagging is the width of a progress bar.
3. **Figma names are long, CSS names are short.** `medium` → `md`, `xsmall` → `xs`, `2xlarge` → `2xl`. Apply the table in tokens.md to every size, space, radius, border and font token. Component sizes are `sm` and `lg` (`button lg`, `card sm`); `md` is the default and is not written.
4. **Only classes in [css-classes.md](./references/css-classes.md) exist.** The file is generated from the compiled stylesheet. A class that is not there, including anything Bootstrap-shaped (`btn`, `col-md-6`, `text-muted`, `form-control`, `dropdown-menu`, `modal-dialog`), is a translation error.
5. **Breakpoints are `sm:` `md:` `lg:` `xl:` `2xl:`**, written as a prefix with a colon: `md:d-flex`, `lg:col-span-4`. Container-query variants are `@md:col-span-6`. There are no `small:`/`medium:` names and no `col-md-6` forms.
6. **Layout is CSS Grid or flex.** `grid` with `col-span-{n}` / `col-span-full` / `col-start-{n}`; `d-flex` with `gap-{size}`; `hstack` / `vstack` for simple stacks. The flexbox grid (`row`, `col-*`, `g-*`) no longer exists.
7. **Modifiers are space-separated on the root class**, in the order `{root} {color} {style} {size} {state}`: `button primary outline sm`, `notification danger solid`. In Figma the style of a button, badge or chip is the component (`Outline Button`), not a prop. Buttons, badges, chips, avatars, notifications and check inputs take the color directly. Everything else takes it through the context class: `card context warning`, `table context primary`, `navbar context primary solid`.
8. **Lift Asset text.** Chassis Figma components hold most of their text in nested instances named `<Role> Asset` ("Label Asset", "Title Asset"), and some in plain text layers (a form label, an input's text, a check label, the levels of a breadcrumb). The text becomes the content of the semantic element; the Asset layer never becomes a DOM node. See [patterns.md](./references/patterns.md#asset-extraction).
9. **Theme with `data-cx-theme`.** No attribute follows the system preference; `data-cx-theme="dark"` or `"light"` on `<html>` or on any element sets the mode of that subtree. Colors are classes, never values, so they follow. Brand is a token build, not a class.
10. **Behavior is `data-cx-*`.** Dialogs, drawers, menus, tabs, tooltips, popovers, collapse, carousels, comboboxes and datepickers initialize from `data-cx-toggle` and friends; the page loads `@chassis-ui/css/dist/js/chassis.bundle.min.js` as a module, or imports the plugins it needs.

## Workflow overlay

Follow `figma-design-to-code` and add, at each part of the work:

- **Fetch** — after `get_design_context`, run `get_variable_defs` for the same node, and `get_code_connect_map`: a Code Connect snippet is used verbatim. For large screens, `get_metadata` first and then one `get_design_context` per section, at the frame or instance that owns a slot and not at a node inside one.
- **Assets** — a Chassis icon (an instance of a glyph component of the library, `pen-solid`, whatever its layer is called) becomes a Chassis Icons reference, not a downloaded SVG: it is the exact match in the design library that the parent skill allows in place of an asset ([components.md](./references/components.md#icons)); other images are downloaded as the response says; brand- or theme-gated images become conditional markup ([patterns.md](./references/patterns.md#theme-conditional-assets)).
- **Translate** — identify the component of each Figma instance by its name with [components.md](./references/components.md), emit its markup, lift Asset text, then add utilities for the token-bound styles that the component does not already apply (a card's padding, a button's font and colors are built in and are not repeated as utilities).
- **Parity** — compare against the per-section screenshot; fix by picking a different token class, never by inline CSS.
- **Validate** — run the checklist in [workflow.md](./references/workflow.md#phase-5--lint-checklist); render under light and dark when the design has both.

## Deliverable format

| Bucket          | Meaning                                                                        |
| --------------- | ------------------------------------------------------------------------------ |
| **Implemented** | Sections and components emitted as Chassis CSS HTML                            |
| **Reused**      | Project snippets reused verbatim                                               |
| **Composed**    | Figma components with no Chassis CSS counterpart, built from primitives        |
| **Iconified**   | Downloaded SVGs replaced with Chassis Icons references                         |
| **Flagged**     | Styles that needed an inline value or a non-token decision, each with a reason |
| **Blocked**     | What could not be implemented, with the exact failure                          |

State the CSS mode used at the top of the summary.

## References

- [css-classes.md](./references/css-classes.md) — generated catalog of every class, variant and component modifier in the installed `@chassis-ui/css`
- [tokens.md](./references/tokens.md) — Figma variable and style → Chassis class translation, with the long-to-short name table
- [components.md](./references/components.md) — Figma component → Chassis markup, with the `data-cx-*` wiring
- [patterns.md](./references/patterns.md) — reading the Figma output, Asset extraction, variants, layout, context class, theming, native vs Tailwind, anti-patterns
- [workflow.md](./references/workflow.md) — phase playbook, lint checklist, failure modes
