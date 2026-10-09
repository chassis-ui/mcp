---
'@chassis-ui/mcp': patch
---

`chassis-implement-design` names the Chassis UI Figma library as it is published today. The CSS side is unchanged.

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
