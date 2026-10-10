# Changelog

## 0.4.0

### Minor Changes

- 6d92b50: A new tool, `chassis_check_classes`, checks class names against the Chassis CSS class catalog. Pass class names, class attribute values or markup (its `class` attributes are read) and the CSS mode, `native` or `tailwind`, and it returns the classes that do not exist in that mode, each with the reason (not a class; a variant prefix the class does not take in the native build; a Tailwind variant on a class that is not a utility of the Tailwind entry), the catalog section to read for it and the classes near it, or one line when all exist. The list it checks against, `skills/chassis-implement-design/references/css-classes.json`, is written by the catalog generator from the same walk of the stylesheet as `css-classes.md`, and is committed with it.

  What an agent now does differently in `chassis-implement-design`: it no longer reads `css-classes.md` whole before the first line of markup. It reads `tokens.md` whole, writes the markup from `tokens.md`, `components.md` and `patterns.md`, calls `chassis_check_classes` on it at the Validate step (the lint checklist's last row), and reads the section of the catalog the tool names for a refused class, or a family's section when it needs a utility the other files do not name. Without the server it checks against the file, as before.

  The catalog's "Tailwind entry" line counts the distinct utility names of the entry (1466), not its `@utility` rules (1485).

- 9f275d4: `chassis_get_reference` takes a `section`: a heading of the reference file, or the anchor of a link `file.md#anchor`. It returns that section with its subsections, under the introduction of the file, instead of the whole file. A section the file does not have, or a heading it has twice, is answered with an error that lists what to ask for.

  The index that `chassis_create_design` and `chassis_implement_design` return lists the sections of each reference file with their sizes, so an agent can fetch the part a task needs.

- 79c4ef9: **Breaking:** `chassis-create-design` is rewritten against the Chassis UI Figma library as published today, and its reference files change: `references/typography.md` and `references/patterns.md` are gone, `references/recipes.md` is new, and `components.md`, `tokens.md` and `workflow.md` are rewritten. The resources `chassis-create-design/references/typography` and `chassis-create-design/references/patterns` no longer exist, and the `name` enum of `chassis_get_reference` changes with them.

  What an agent now does differently:

  - Finds components by their library name (`Solid Button`, `Regular Form Field`, `Basic Text  Asset`) in `cx.components.UI`, scoped to the libraries of the file, with the current `search_design_system` call shape (`queries: [{ entity, query }]`), and imports by `componentKey` or `componentSetKey` according to `assetType`. The libraries `cx.asset.text` and `cx.comp.*`, the docs URL and the catalog of slugs are gone.
  - Reads a component's props from the library at run time instead of a table: property keys carry their `#id` suffix, variants are set by bare name through `setProperties`, booleans are found by type (their names vary, and not all default to `true`).
  - Loads the fonts of an instance's text nodes before appending it, which the old skill forbade and which throws without.
  - Sets text where the component keeps it: the `text#…` property of a nested `<Role> Asset`, the `characters` of a plain text layer (form labels, input text, check labels, breadcrumbs), or a top-level text property.
  - Puts the content of the navbar, tabs, button groups, accordions, menus, modals, alerts, sections, tables, carousels and tooltips into their native slot node; tables are `Data Table` and `Table Row` with cells in slots, nothing is turned into a component.
  - Follows Figma's `figma-generate-design` on batching sections per call, one composition screenshot, and local components for repeated elements the library lacks (listed in a new report bucket, **Local components**); a detached layer or raw frame replaced by an instance is reported in another new bucket, **Replaced**; `generate_figma_design` is optional, with `upload_assets` as the way to put an image on a node; `skillNames` carries only Figma's skill names.
  - Hides a visible part of a component that the design does not show and no boolean turns off (the search field of `Navbar`, the pen icon of `Page Title`) with a visibility override on the instance, and names it in the report.
  - Sends the components of a task in one `search_design_system` call and the variables and styles in calls of at most six queries, since each of those returns fourteen results and a client refuses a result that is too long.
  - Uses the token names the library has: a radius scale ending in `full`, the context `neutral`, `cue-slight`, `opacity/level/zero`, the `font/context/*` text styles, eleven `shadow/context/*` styles, and the collections `brand`, `theme`, `app`, `system` with their modes.

  Still in force, each stated once: never `createText()`, never a raw font property or a hardcoded family, never a raw color or spacing value, never `setExplicitVariableModeForCollection`, never a deprecated component, icons only from the library.

  The `/chassis-ui` prompt no longer restates rules of the skill and points at the new files.

- febf9da: Both skills send an agent to the section of a reference file that a step needs, instead of to the whole file: each rule and each step of the workflow overlay links the section (`file.md#anchor`), a new section of each SKILL.md says which files are read whole and which by section and when, and the References list, which the skill tools show as the index, says the same per file. The index of the skill tools says to fetch the section, not its file, where the instructions link one.

  What an agent now does differently:

  - `chassis-implement-design` reads `tokens.md` whole before the first line of markup, checks its classes with `chassis_check_classes` instead of reading `css-classes.md` whole (the first entry above), and reads the rest by section: "Reading the Figma output" at the fetch step, the family table and then the section of each family the design uses at the translate step, "Asset extraction" and "Semantic HTML" for the text, the lint checklist when the markup is written, the failure modes on a symptom. The order of the Figma calls is stated once, in the SKILL.md: `get_design_context` with its screenshot, then `get_variable_defs` on a top-level node and `get_code_connect_map` (a plan without Code Connect says so: go on), `get_metadata` first for a large screen; `workflow.md` no longer carries a second, different order. Its playbook phases that restated the SKILL.md are gone; what only they said is now in the SKILL.md or in "Before the first Figma call".
  - `chassis-create-design` reads `recipes.md` and `tokens.md` whole, and `components.md` and `workflow.md` by section: finding, reading and the conventions of the library before the first search, the pages when the sections are listed, the composition of a family when its first section is built, the build checklist at Step 1, the quality checklist before the report, the reconnect playbook in reconnect mode only. "The pages" is "The pages and their components" with subsections "Action pages" to "Asset pages", so that every heading of the file names one section.
  - On the CSS side of `chassis-implement-design`: the lint pattern for the removed grid no longer matches `flex-column`, `col-span-*`, `row-gap-*` or `grid-cols-*`, the numeric-spacing pattern no longer matches the `-0` forms, and the long-size-name pattern catches `xsmall` and `xlarge`; the navbar's toggler and drawer are emitted for a desktop-only design too, with the `navbar-expand` breakpoint chosen from the narrowest frame that shows the links inline; a glyph matched by eye is checked against the symbol ids of `chassis-icons.svg`; a frame without auto-layout becomes flow layout, with absolute positioning only where the overlap is the design; the margins headings and paragraphs carry are not repeated as utilities; a class that restates an inherited default (`fg-main` in the default context) is not written; a standalone page is told where the stylesheet, the bundle and the sprite load from.

  The `/chassis-ui` prompt says to fetch the references as the steps name them, whole or by section.

### Patch Changes

- c67b59d: `chassis-implement-design` names the Chassis UI Figma library as it is published today. The CSS side is unchanged.

  What an agent now does differently:

  - Finds the markup of an instance by the name of its component (`Solid Button`, `Regular Form Field`, `Data Table`, `Nav Tabs`) instead of a docs slug (`button-solid`, `form-regular`), and takes the style of a button, badge or chip from the component, not from a `style` prop. A new section of `patterns.md`, "Reading the Figma output", says what `get_design_context` shows of a Chassis design: the variable of a property in its class (`gap-[var(--space\/context\/medium,16px)]`), the layer name in `data-name`, no variant list, the text styles after the code, slots, hidden layers left out, and the default content inside an instance that the code turns into a function (`DataTable`, `TableRow`), which is not the design's.
  - Maps `Alert Window` to the CSS `alert` dialog and `Notification` to the CSS `notification`; a toast has no Figma component. `Nav Segments`, the Progress Flows, a searchable `Dropdown Menu` and the toggles now have a row (`nav-segments`, `stepper`, `combobox`, a button with `aria-pressed`), and the switches are their own components.
  - Lifts text from the layers the library has: "Title Asset", "Body Asset", "Category Asset", "Label Asset", "Help Asset", and the plain text layers of form labels, inputs, check labels and breadcrumbs. A card has no "Description Asset", "Action Asset" or "Image Asset".
  - Tells an icon by its glyph component (`pen-solid`), whatever its layer is called, and no longer looks for a layer "Icon Asset"; a glyph whose fill is an `fg-*` variable takes the `icon-*` class.
  - Gives the heading of a section or page title the class of its text style instead of `font-heading`, which neither `Section Header` nor `Page Title` uses.
  - Uses the token names of the library: `full` for the last radius step (not `round`), `font/context/title/medium` (not `font/context/title`), no `font/html/lead`, the collections `brand`, `theme`, `app` (`docs`, `demo`) and `system`. Tokens that have no class in `@chassis-ui/css` 0.7 are named and asked about: `borderRadius/context/4xlarge`, `size/icon/glyph/5xlarge` and `6xlarge`, `font/context/highlight`, `expired`, `link` and `code`, the state shadows and `shadow/glow`.
  - No longer treats breakpoint-named width variants (`screen-small`) as a thing of the library: frames of the same view at several widths are read mobile-first.
  - Goes on when `get_code_connect_map` answers that the plan has no Code Connect, and fetches a section at the instance that owns a slot.

  The description of the resource `chassis-implement-design/references/components` is now "Components — Figma component → Chassis CSS markup".

## 0.3.0

### Minor Changes

- 6af5b69: The skill tools return the instructions and an index of the references, not every reference.

  - **Breaking:** `chassis_create_design` and `chassis_implement_design` return the `SKILL.md` without its frontmatter, followed by an index of the skill's reference files: for each its file name, its size, the line the skill gives it, its title and its name for `chassis_get_reference`. A call is 29 KB and 9 KB instead of 106 KB and 94 KB; an agent fetches a reference when the instructions send it there. The input `full: true` returns what the tools returned before, the instructions and every reference inline
  - The prompts `chassis-create-design` and `chassis-implement-design` keep returning the whole skill: a prompt is the user's own choice
  - `chassis_get_reference` says in its description what it returns; its names are unchanged
  - The resource registry carries the one-line summary each `SKILL.md` gives its references, and the build fails for a reference the `SKILL.md` does not list that way

## 0.2.0

### Minor Changes

- 06e2673: `chassis-implement-design` is rewritten for Chassis CSS 0.7, and the plugin installs from a marketplace.

  - **Breaking:** `chassis-implement-design` writes markup for `@chassis-ui/css` 0.7: the short size names (`p-md`), the `sm:` to `2xl:` and `@sm:` to `@2xl:` prefixes, the CSS grid and the current component classes. A project on an earlier Chassis CSS gets classes it does not have
  - The skill works in a native CSS project and in a Tailwind CSS v4 project that uses the Chassis Tailwind entry, and says how the two differ
  - `references/css-classes.md` is generated from the compiled stylesheet of `@chassis-ui/css` 0.7.2: every class, its variant prefixes, the subparts and modifiers of each component, the `data-cx-*` attributes and the facts of the Tailwind entry
  - `references/tokens.md`, `components.md`, `patterns.md` and `workflow.md` of the skill follow: the translation of the Figma token namespaces to classes, the current markup of each component family, theming with `data-cx-theme`
  - Claude Code installs the plugin with `/plugin marketplace add chassis-ui/mcp` and `/plugin install chassis-ui@chassis-ui`
  - The server runs on `@modelcontextprotocol/sdk` 1.32, and reports the version of the release, which it no longer holds as a string of its own
  - The README covers the plugin, Cursor and other MCP clients, and names the Figma MCP server the skills need

  No tool, prompt or resource changed its name or its input.

- c0976df: The server greets a browser, reports its health and fails as JSON-RPC.

  - `https://mcp.chassis-ui.com/mcp` and `https://mcp.chassis-ui.com/` opened in a browser show a page with the version, the endpoint and the install commands; `GET /health` answers `{ "ok": true, "version": "<version>" }`
  - An MCP client that opens the standalone event stream (`GET` with `Accept: text/event-stream`) gets 405: the server sends no server-initiated messages, and the stream only held a function open. The official SDKs take 405 as "no stream" and go on
  - A failure inside the function answers a JSON-RPC error `-32603` with status 500, and a body over 4 MiB a 413, instead of a request that hangs; the detail goes to the logs
  - The CORS headers allow `Mcp-Protocol-Version`, which clients send since protocol 2025-06-18, and expose `Mcp-Session-Id`
  - The description of a resource is now the frontmatter description of the skill or the title of the reference file, taken from the file; the registry of resources is generated with the content, so a reference file cannot be left out of the server. The names and URIs of the resources are unchanged
  - The skill bundles are built once per instance of the function, not on every call

### Patch Changes

- 758ef28: The `chassis-ui` prompt and two links of the skills are corrected.

  - The `chassis-ui` prompt no longer sends an agent to `component-keys.md`, a reference file that was removed: it says to resolve a `componentKey` at runtime with `search_design_system`, as the `chassis-create-design` skill does
  - `chassis-implement-design`: the link to the lint checklist of `workflow.md` points at its heading, and the auto-layout table of `patterns.md` is a table again (the alternatives of `justify-content-*` and `align-items-*` are written with escaped pipes)

## [0.1.5] - 2026-05-06

### Changed

- The README describes how to add the server to a project and how to copy the skills
- The plugin manifest under `.github/plugin/` has a display name, a repository and the description of the other two

## [0.1.4] - 2026-05-06

### Changed

- The server reports its own version to a client, in step with the plugin

## [0.1.3] - 2026-05-06

### Changed

- The Claude Code plugin loads the skills from `skills/`, so they are its slash commands

## [0.1.2] - 2026-05-06

### Changed

- `chassis-create-design`: rules and recipes from design sessions, on typography, patterns and the workflow, and a shorter text that takes less of an agent's context

## [0.1.1] - 2026-05-03

### Added

- The tools `chassis_create_design`, `chassis_implement_design` and `chassis_get_reference`, and the prompts `chassis-create-design` and `chassis-implement-design`, which return a skill with its reference files

### Changed

- `chassis-implement-design` no longer translates Bootstrap class names

### Fixed

- The deployment on Vercel

## [0.1.0] - 2026-04-30

### Added

- The skills `chassis-create-design` and `chassis-implement-design`, with their reference files
- The `/chassis-ui` prompt
- The MCP server at `https://mcp.chassis-ui.com/mcp`, with every skill and reference file as a resource
- Plugin manifests for Claude Code, for Cursor and under `.github/plugin/`
