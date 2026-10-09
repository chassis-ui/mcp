# Chassis build and reconnect workflow

What the SKILL.md does not say: the order of a build, the reconnect playbook, how a multi-theme view is checked, the quality checklist, and the failures with their fixes.

## Build mode

1. **Source and target.** The source is code, a screenshot, a description or a URL; ask when it is unclear which. The target is a file URL (`fileKey`, and a `nodeId` with `-` turned into `:` when a frame is named) and a page; a user without a file gets one through `create_new_file`, which adds the team libraries.
2. **Modes.** Note which brand, theme and app modes the view is for. The designer sets them; a view for several themes is checked in each (below).
3. **Sections.** List them top to bottom (navbar, page title, hero, cards, form, table, footer; a modal or drawer is a deliverable of its own) and, per section, the components by their library name ([components.md → The pages](./components.md#the-pages)). A gap is settled before building: compose from library instances, build a local component for a repeated element, or flag it as Blocked.
4. **One discovery pass.** `get_libraries`, then `search_design_system` with every component of the list in one call and the variables and styles in another (at most six to a call), then one inspection per component ([recipes.md → Inspect a component](./recipes.md#inspect-a-component)). Keep in the session notes, per component: its key and `assetType`, the prop keys with their types and defaults, the Asset names and their text keys, the slot names, the plain text layers.
5. **Wrapper, then sections**, in retry-safe batches; per instance the order of [recipes.md → Insert an instance](./recipes.md#insert-an-instance). Return every created id.
6. **One screenshot**, a targeted fix, one more screenshot.
7. **Report** in the seven buckets of the SKILL.md.

## Reconnect mode

An existing view, made library-true one layer at a time.

### Inventory

Walk the frame and tag each visible layer:

| Tag                | Meaning                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `library-instance` | An instance of `cx.components.UI`, on the current component: leave      |
| `deprecated`       | An instance of a ` - DEPRECATED` component or a wrong variant: swap     |
| `detached`         | Was a library instance, since detached: replace                         |
| `local-wrapper`    | A local component or frame around a library instance: unwrap or replace |
| `raw-frame`        | Hand-built, no component behind it: replace, compose, or block          |

For each layer that is not a library instance, name the library component it stands for by its structure and intent (a row of labeled fields is a form, not a card), and read that component once ([recipes.md → Inspect a component](./recipes.md#inspect-a-component)). What matches nothing is Blocked; a repeated raw element becomes a local component (rule 1).

### Plan

Order the work outer to inner, so an inner replacement is not redone when its container changes. Per layer, the strategy:

| Strategy    | When                                                          | How                                                                                                                                |
| ----------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Swap**    | An instance of the wrong variant or of a deprecated component | `swapComponent`, then the variants; overrides survive                                                                              |
| **Replace** | A detached or raw layer one library component stands for      | A new instance at the same index and, in a non-auto-layout parent, the same `x`, `y`, `width`, `height`; then remove the old layer |
| **Compose** | Several library components stand for it                       | Replace with a frame of instances                                                                                                  |
| **Skip**    | A valid library instance                                      | Nothing                                                                                                                            |
| **Block**   | No library component stands for it                            | Report with the reason                                                                                                             |

Before a Replace or Compose, capture from the old layer: position and size, every text, and the variant intent (size, context, state), to re-apply on the new instance.

### Replace, one at a time

For each planned layer: the recipe in [recipes.md → Swap and replace](./recipes.md#swap-and-replace), then the text through the Assets or plain layers, the variants and booleans, the slot content. One layer per call where the old layer must stay until the new one is right; never a bulk replacement. A frame is not converted to auto-layout unless the user asked for that cleanup.

### Verify

Walk the frame again: every visible layer is `library-instance`, a local component made of them, or listed as Blocked. One screenshot against the original (or the design the original came from). A view for several themes goes through the check below.

### Report

Swapped (count and list), Replaced (count and list), Composed, Local components, Already connected (count), Blocked (each with the exact failure: "no library component for a radial slider").

## Multi-theme validation

The agent never sets a mode (rule 9). To see the view in another brand, theme or app mode, ask the designer to apply the mode in the Appearance panel of the page (deselect everything, then the page panel), of the wrapper frame, or of one instance; `resolvedVariableModes` on the frame confirms which modes are in force ([recipes.md → Read the modes](./recipes.md#read-the-modes)). In each mode look for a color that did not change (a raw fill, a unit token, a `createText` node), low contrast in dark, and a layout broken by the longer or wider text of another brand's font. Fix at the token level, never by overriding an instance per mode. A layer that must differ by theme binds its visibility to a switch variable ([tokens.md → Collections and modes](./tokens.md#collections-and-modes)).

## Quality checklist

Before the report:

- [ ] Every text is a text Asset, a plain text layer of a component or a `Basic Text  Asset` instance; nothing from `createText()`
- [ ] Every instance had its booleans subtracted: no decoration the design does not show
- [ ] Every slot is filled and its placeholders removed
- [ ] Every color, padding, gap, size, radius, border and opacity of the agent's own frames is bound to a `*/context/*` variable, or the value was approved
- [ ] Every text node has one `font/*` style and no raw font value or `typography/*` binding
- [ ] Every shadow is a `shadow/*` effect style
- [ ] No component named ` - DEPRECATED`; every icon a library icon
- [ ] One button size per action group; one form style per form; no hidden layer without a prop revealed; every part hidden by an override is in the report
- [ ] Positions preserved in non-auto-layout parents; no frame converted to auto-layout unasked (reconnect)
- [ ] No variable mode set by a script
- [ ] The screenshot shows no placeholder text, no clipped Asset, no empty image, the product font
- [ ] The report has the seven buckets, and every blocked item its reason

## Failure modes

| Error or symptom                                                                           | Cause                                                                                                             | Fix                                                                                        |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `in appendChild: unloaded font "…"`                                                        | The instance was appended before its fonts were loaded                                                            | `loadFontsOf(instance)`, then append; remove the instance the failed call left on the page |
| `Could not find a component property with name: 'text'` (or `has-badge`)                   | A BOOLEAN, TEXT or INSTANCE_SWAP key without its `#id`                                                            | Read the key from `componentProperties` and pass it whole                                  |
| A variant is not applied; `set.children.find(c => c.name === 'size=small')` is `undefined` | A variant's name lists all its props                                                                              | `instance.setProperties({ size: 'small' })`                                                |
| `setProperties` rejects the slot property                                                  | A slot is a node, not a value                                                                                     | `findOne(n => n.type === 'SLOT')`, then `appendChild`                                      |
| `FILL can only be set on children of auto-layout frames`                                   | Sizing set before `appendChild`, or the parent is not auto-layout                                                 | Append first; `FILL` only where the design fills                                           |
| The search for text returns `chassis-app-icon-square`                                      | The query was `cx.asset.text`                                                                                     | Query "Basic Text Asset"                                                                   |
| "No variables" or "no styles" in the file                                                  | `getLocalVariableCollectionsAsync()` sees local ones only                                                         | `search_design_system` with `entity: "variable"` or `"style"`                              |
| `componentPropertyDefinitions` throws                                                      | Read on a variant component                                                                                       | Read it on the set                                                                         |
| Every button shows an icon, a badge and a caret                                            | Booleans left at their defaults                                                                                   | Subtract by type ([recipes.md → Insert an instance](./recipes.md#insert-an-instance))      |
| The label did not change                                                                   | Text set on the parent, or on the wrong Asset                                                                     | Find `<Role> Asset`, set its `text#…` key                                                  |
| Text unchanged after a theme switch                                                        | A raw fill, or a `createText()` node                                                                              | Bind `color/context/*`; use `Basic Text  Asset`                                            |
| The wrong font family in the screenshot                                                    | A hardcoded family, or the file is in another brand mode                                                          | Load the fonts read from the nodes; ask the designer which brand the file should be in     |
| `The node with id X does not exist`                                                        | A `detachInstance()` changed the ids inside                                                                       | Find the nodes again from a stable parent                                                  |
| A section built outside the wrapper cannot be moved in                                     | `appendChild` across calls on a top-level node fails silently                                                     | Create the wrapper first, build inside it                                                  |
| `counterAxisAlignItems` or `primaryAxisAlignItems` rejects `'FLEX_END'`                    | A CSS value; the API takes `'MIN'`, `'MAX'`, `'CENTER'`, `'BASELINE'` (and `'SPACE_BETWEEN'` on the primary axis) | `counterAxisAlignItems = 'MAX'` for bottom alignment in a horizontal layout                |

## Recovering when stuck

An action that fails once is diagnosed, not retried as it was: does the component have that prop (read it), is the parent auto-layout, is the Asset name right, were the fonts loaded. `safeToRetryWithoutCanvasRead` on the error says whether the canvas must be read first. The same failure twice: stop and report it in Blocked with the message, instead of building around it.

## Session notes

Keys, property keys and Asset names are per file and publication, so they are resolved by name once per session and kept in the session's notes, with the wrapper id and the sections done and pending, for the calls that follow. They are not copied into another file's session or into a skill: the next session resolves them again by name.
