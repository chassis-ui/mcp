---
'chassis-mcp': minor
---

**Breaking:** `chassis-create-design` is rewritten against the Chassis UI Figma library as published today, and its reference files change: `references/typography.md` and `references/patterns.md` are gone, `references/recipes.md` is new, and `components.md`, `tokens.md` and `workflow.md` are rewritten. The resources `chassis-create-design/references/typography` and `chassis-create-design/references/patterns` no longer exist, and the `name` enum of `chassis_get_reference` changes with them.

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
