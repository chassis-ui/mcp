---
name: chassis-create-design
description: 'Build or update a Figma design (screen, page, modal, dialog, drawer, panel, dashboard, landing page or any multi-section view) from the Chassis UI Figma library: instances of `cx.components.UI`, bound to the variables and styles of `cx.tokens.MAIN`. Use when the user wants to create, compose, assemble or reconnect a Figma view from code, a screenshot, a description or an existing detached layout. Runs on top of the Figma MCP server skills `figma-use` and `figma-generate-design` and adds how the Chassis library is found, read and composed at run time: component names, props and their defaults, text Assets, slots, text styles, tokens and modes. Do NOT use for: a fix inside a single component, generating code FROM Figma (use `chassis-implement-design`), or token and variable edits.'
disable-model-invocation: false
---

# Build Figma screens with the Chassis UI library

This skill builds and repairs Figma views out of the Chassis UI library: every visible element is an instance of `cx.components.UI`, every color, space and font is a variable or style of `cx.tokens.MAIN`. It adds to Figma's own screen-building skills what is particular to Chassis: where a component keeps its text, what its boolean props default to, which containers take their content in a slot, and how the library is found and read at run time, since nothing in it is written down here.

## Required Figma MCP skills

Load `figma-use` (before any `use_figma` call) and `figma-generate-design` (the workflow this skill overlays) from the Figma MCP server, in that order, then this skill. Pass `skillNames: "figma-use,figma-generate-design"` on every `use_figma` call; it is a logging parameter for Figma's skill names, so this skill's name is not passed. If the Figma tools are deferred, load them in one call of the client's tool search: `select:use_figma,search_design_system,get_libraries,get_metadata,get_screenshot,upload_assets`.

The skill uses `get_libraries`, `search_design_system`, `use_figma`, `get_metadata`, `get_screenshot` and `upload_assets`. Two tools Figma's skill names may not be offered by the client: `generate_figma_design` (the capture of a running web app) and `html_to_figma`. The skill works without them (Step 1 and Step 5 of the overlay say how).

To generate code from Figma instead, stop and use `chassis-implement-design`.

## Modes

| Mode        | Deliverable                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `build`     | A new view on a page of the target file, from code, a screenshot, a description or a URL              |
| `reconnect` | An existing view whose detached layers, local wrappers and raw frames become instances of the library |

Not for: a fix inside one component (edit it directly), code from Figma (`chassis-implement-design`), token or variable edits (`chassis-tokens`, or Figma itself), importing an icon or an image only (`figma-use`).

## The library

Three team libraries, added to a file by name:

- `cx.components.UI` holds every component, asset and icon, one page per component, with a docs section on each page.
- `cx.tokens.MAIN` holds the variables (collections `brand`, `theme`, `app`, `system`), the text styles `font/*` and the effect styles `shadow/*`.
- `cx.components.DOC` holds the components of the docs frames and is not used in a screen.

Keys differ between files and publications, so this skill writes none: a component, variable or style is found by its name, scoped to the libraries of the file, and imported by the key the search returns, in the same session ([components.md](./references/components.md#finding-a-component)). The skill is checked against the team library; a community copy of `cx.components.UI` exists but returns nothing in a scoped search.

## The thirteen rules

1. **Everything visible is a library instance, or a frame that holds library instances.** Never `figma.createText()`: a raw text node has no token binding and breaks on a theme switch, so standalone text is an instance of `Basic Text  Asset` ([recipes.md](./references/recipes.md#standalone-text)). A repeated element the library lacks becomes one local component built from library instances, placed as instances and listed in the report; a single missing component is reported as Blocked, not drawn; and a library instance is never detached to fix a missing variant.
2. **Find by name, import by key, at run time.** `get_libraries` gives the `libraryKey` of each library added to the file; `search_design_system`, scoped with `includeLibraryKeys`, finds a component by its library name ("Solid Button", "Regular Form Field", "Data Table"); its `assetType` says whether `importComponentByKeyAsync` or `importComponentSetByKeyAsync` takes the key. Keys are never written in a skill or copied between files ([components.md](./references/components.md#finding-a-component)).
3. **Read a component's properties from the library, not from memory.** `componentPropertyDefinitions` of the imported set (never of a variant) and `componentProperties` of a temporary instance give the props with their types and defaults. BOOLEAN, TEXT and INSTANCE_SWAP keys carry an `#id` suffix and are passed whole; VARIANT props are set by bare name, `setProperties({ context: 'primary', size: 'large' })`. Most booleans default to `true`, so a fresh instance shows every decoration: find them by type, since their names vary (`has-icon-start`, `is-dropdown`, bare `icon`, `help`, `label`), and set the unwanted ones to `false` first ([recipes.md](./references/recipes.md#inspect-a-component)).
4. **Text goes where the component keeps it.** Most text is a nested `Basic Text  Asset` instance named `<Role> Asset` ("Label Asset", "Title Asset", "Body Asset", "Help Asset") with a TEXT property whose key starts with `text#`: set it with `setProperties` on that nested instance, never on the parent. Form labels, input text, check labels and breadcrumb levels are plain TEXT layers with no property: set their `characters`. A few components have a top-level TEXT property. Inspect, never guess ([components.md](./references/components.md#text)).
5. **Load fonts before appending or editing text.** A fresh instance appended to an auto-layout frame throws `unloaded font` unless the fonts of its text nodes, read with `getStyledTextSegments(['fontName'])`, are loaded first; the same holds before `characters` or a text style. Never a hardcoded family: the family is a `brand` variable and differs by file and mode ([recipes.md](./references/recipes.md#insert-an-instance)).
6. **Typography is a `font/*` text style**, imported with `importStyleByKeyAsync` and applied with `setTextStyleIdAsync` on the inner TEXT node. Never `fontName`, `fontSize`, `lineHeight` or `letterSpacing` set directly, never a `typography/*` variable bound on production text: the style carries them all and follows the brand ([tokens.md](./references/tokens.md#text-styles)).
7. **Every other visual value is a variable of `cx.tokens.MAIN`**, found with `search_design_system` (`entity: "variable"`), imported with `importVariableByKeyAsync` and bound with `setBoundVariable`, or `setBoundVariableForPaint`, which returns a new paint to reassign. Context tokens (`color/context/*`, `space/context/*`) before unit or level tokens: only context tokens follow the theme. Shadows are `shadow/*` effect styles. A value no token fits is asked about, never hardcoded ([tokens.md](./references/tokens.md)).
8. **Containers take their content in a slot.** Nineteen sets (navbar, tabs, segments, button group, accordion, dropdown menu, modal, alert, section, page title, table row, data table, carousels, tooltip, rich notification) have a child node of type `SLOT`: append the content to it and remove its placeholders. `setProperties` does not take a slot ([recipes.md](./references/recipes.md#fill-a-slot)).
9. **Never set a variable mode.** `setExplicitVariableModeForCollection` works, but it overrides the library context the design team manages and gives results a designer cannot reproduce; the agent may read the modes a frame resolves and asks the designer to switch brand, theme or app. A layer that differs by theme binds its visibility to `figma/switch/theme/mode-n` ([tokens.md](./references/tokens.md#collections-and-modes)).
10. **Never a component whose name ends in ` - DEPRECATED`** (`Basic Slot @ 0.1 - DEPRECATED`): use the same name without the suffix, and treat an instance of one in an existing screen as a swap candidate.
11. **Icons are library components only**: `<name>-solid`, `<name>-outline`, `<name>-brand` on the page "Icon", set through an `*-instance` prop or placed as an instance. Never `createNodeFromSvg`; an icon the library lacks is reported ([components.md](./references/components.md#assets)).
12. **One button size per action group and one form style per form**, and no hidden layer revealed unless a prop shows it: what the design needs is a prop or another component. The reverse, a visible part the design does not show and no boolean turns off, is hidden with `visible = false` on that layer of the instance, never by detaching, and named in the report ([components.md](./references/components.md#hidden-layers)).
13. **In reconnect mode, one layer at a time.** An instance is swapped with `swapComponent` so its overrides survive; a detached or raw frame is replaced by a new instance at its `x`, `y`, `width` and `height` when the parent is not auto-layout; no frame is converted to auto-layout unless the user asks ([workflow.md](./references/workflow.md#reconnect-mode)).

These rules extend those of `figma-use` and `figma-generate-design`, which still apply: colors in the 0–1 range, `return` every created or mutated id, `layoutSizing*` after `appendChild`, the retry contract.

## Workflow overlay

Follow the six steps of `figma-generate-design` and add, at each step:

- **Step 1, understand the deliverable** — note the brand, theme and app modes the view targets; the designer sets them (rule 9). If the source holds content images (photos, avatars, logos): run `generate_figma_design` when the client offers it and the source is a running web app; otherwise plan one `upload_assets` call per image at Step 5. Figma's `html_to_figma` shortcut does not apply: a Chassis view is built from instances.
- **Step 2, collect components, variables and styles** — 2a-i: the Chassis repositories have no Code Connect files; note it and move on. 2a-ii: an existing Chassis screen in the file is the best inventory of keys. 2a-iii: `get_libraries`, then the scoped `search_design_system` calls: every component the sections need in one, the variables and styles in another, at most six of those to a call since each returns fourteen results; each by its library name and one intent per query (components.md names them). Read each component once from a temporary instance (rule 3) and keep its prop keys, Asset names, slot and plain text layers in the session notes. Never conclude "no variables" from `getLocalVariableCollectionsAsync()`: the libraries are remote.
- **Step 3, the wrapper frame** — width from `grid/breakpoint/*` (`2xlarge` 1536 for desktop, `large` 1024 for tablet, `xsmall` 400 for mobile) or the fixed width the source gives a modal or panel; background and padding bound to context tokens at once.
- **Step 4, build the sections** — batch related sections in one call when the script is safe to retry, as Figma's skill says. Per instance, in this order: import, set variants, load its fonts, append, subtract booleans, set instance swaps, set text, fill slots; then `FILL` only where the design fills (sections, fields, tables; not buttons, badges, chips or text) ([recipes.md](./references/recipes.md#insert-an-instance)). Build a repeated element the library lacks once, as a local component.
- **Step 5, validate** — one composition screenshot, one more after a fix. Look for placeholder text ("Text", "Button", "Label"), decorations left on (a start icon, a badge and a caret on every button), empty slots and slots still holding their placeholders, clipped Assets, raw values, and the product font. Put images on their nodes from the capture or with `upload_assets`.
- **Step 6, update or reconnect** — the playbook in [workflow.md](./references/workflow.md#reconnect-mode): inventory, a strategy per layer, one layer at a time, verify.

## Deliverable format

| Bucket                | Meaning                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| **Built**             | New sections or screens made of library instances                                                    |
| **Swapped**           | Existing instances swapped to the right component or variant                                         |
| **Replaced**          | Detached layers and raw frames replaced by a new library instance in the same place                  |
| **Composed**          | Sections built from several library instances because no single component fits                       |
| **Local components**  | Repeated elements the library lacks, built once from library instances and placed as instances       |
| **Already connected** | Sections that were valid library instances already                                                   |
| **Blocked**           | What could not be built or connected, each with the exact failure (the missing component, the error) |

Below the buckets, name every layer hidden with a visibility override (rule 12). If everything is blocked, say so plainly with the reason.

## References

- [components.md](./references/components.md) — the three libraries, how to find and read a component at run time, the conventions that hold across the library (text Assets and plain text layers, slots, booleans, variants), the components of every page, and how buttons, forms, tables, navigation, cards and dialogs compose
- [recipes.md](./references/recipes.md) — the Plugin API snippets in today's call shapes, each once: insert and inspect an instance, subtract booleans, set text, standalone text, text styles, slots, variables and effect styles, local components, images, swap and replace
- [tokens.md](./references/tokens.md) — the variables, text styles and effect styles of `cx.tokens.MAIN` by namespace, the collections and modes, and how each kind is applied
- [workflow.md](./references/workflow.md) — the build checklist, the reconnect playbook, multi-theme validation, the quality checklist, the failure modes and their fixes
