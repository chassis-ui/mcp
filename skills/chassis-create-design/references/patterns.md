# Chassis Design Patterns

Conventions and recipes that apply across the Chassis library. Read the relevant section before working on a component family.

## Asset Override Pattern

Chassis components **do not** expose top-level text properties. All text content is set via nested instances whose layer name ends in `Asset`. Most Chassis components also gate optional sub-elements behind boolean props — see [Boolean Visibility Props](#boolean-visibility-props--default-true) below.

### How it works

A representative Chassis component (Solid Button) has this structure. The same shape — frame-per-feature gated by a boolean, content slotted via an `Asset` instance — repeats across the library:

**Layer tree**

```
Solid Button (component)
├─ Icon Start Frame      [Auto-Layout frame]
│  └─ Icon Start         [Placeholder Icon instance]
├─ Label Frame           [Auto-Layout frame]
│  └─ Label Asset        [Basic Text Asset instance]
│     └─ Label Text      [Text node]
├─ Badge Frame           [Auto-Layout frame]
│  └─ Solid Badge        [Solid Badge instance]
├─ Caret Frame           [Auto-Layout frame]
│  └─ Caret Icon         [chevron-down icon instance]
└─ Icon End Frame        [Auto-Layout frame]
   └─ Icon End           [Placeholder Icon instance]
```

**Component properties on `Solid Button`**

| Prop                  | Type          | Default            | Bound to                      |
| --------------------- | ------------- | ------------------ | ----------------------------- |
| `has-icon-start`      | Boolean       | `true`             | `Icon Start Frame` visibility |
| `icon-start-instance` | Instance Swap | `Placeholder Icon` | `Icon Start` instance         |
| `has-badge`           | Boolean       | `true`             | `Badge Frame` visibility      |
| `is-dropdown`         | Boolean       | `true`             | `Caret Frame` visibility      |
| `has-icon-end`        | Boolean       | `true`             | `Icon End Frame` visibility   |
| `icon-end-instance`   | Instance Swap | `Placeholder Icon` | `Icon End` instance           |

**Component properties on the nested `Label Asset` (Basic Text Asset)**

| Prop   | Type | Default  | Bound to                  |
| ------ | ---- | -------- | ------------------------- |
| `text` | Text | `Button` | `Label Text` `characters` |

The two patterns visible in this one example:

- **Boolean visibility props on the parent** gate optional decoration frames (`Icon Start Frame`, `Badge Frame`, `Caret Frame`, `Icon End Frame`). Default `true` — see [Boolean Visibility Props](#boolean-visibility-props--default-true).
- **Text content lives on a nested `*Asset` instance** (`Label Asset`), not on the parent. To change the label, override the `text` prop **on `Label Asset`** — the parent `Solid Button` has no `text` prop.

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

Asset overrides decouple content from layout. The same Text Asset can be reused across button styles, sizes, and states without each component needing its own text prop. It also lets boolean visibility props gate optional decorations without breaking the API.

---

## Boolean Visibility Props — Default `true`

**Almost every Chassis component defaults its boolean visibility props to `true`.** A freshly placed instance shows every optional decoration — leading icon, trailing icon, badge, dropdown caret, helper text, sub-labels, etc. — by default. To get a minimal/canonical instance you must explicitly turn the unwanted ones **off**.

### Example: a label-only Solid Button

A freshly placed `Solid Button` instance arrives with start icon + badge + dropdown caret + end icon all visible. To get a plain text-only button:

```ts
button.setProperties({
  'has-icon-start': false,
  'has-badge': false,
  'is-dropdown': false,
  'has-icon-end': false
})
// Then override the label via Asset Override:
//   labelAsset.setProperties({ text: "Save" });
```

### Procedure for any Chassis component

1. After placing an instance, inspect its `componentProperties` for keys matching `has-*` / `is-*` / `show-*`.
2. Decide which sub-elements your design actually needs.
3. Set the rest to `false` in a single `setProperties()` call.
4. For any `has-*: true` you keep, also set the matching `*-instance` (Instance Swap) prop — e.g. `icon-start-instance` for `has-icon-start: true`.
5. Then apply Asset Overrides for text content on the nested `*Asset` layers.

### Why this matters

- A button you intended as "Save" arrives showing icon + badge + caret + icon — looks visually wrong, throws off auto-layout sizing, and obscures intent in the file.
- Forgetting to turn props off is the **most common cause** of Chassis instances looking heavier than the source design.
- The default-`true` convention is intentional: it makes every prop discoverable from the Inspector. Authors are expected to subtract, not add.

### Anti-pattern

```
❌ Placing the instance, overriding the label, leaving everything else default:
   button.setProperties({ /* nothing */ });
   labelAsset.characters = "Save";
   // Result: "[▶] Save [99] [▾] [▶]" — not what you wanted.

✅ Turn off unwanted decorations first, then override content:
   button.setProperties({
     "has-icon-start": false, "has-badge": false,
     "is-dropdown": false,    "has-icon-end": false,
   });
   labelAsset.setProperties({ text: "Save" });
```

---

## Basic Text Asset — Standalone Text in Chassis

> **Never use `figma.createText()` in a Chassis workflow.** Raw text nodes have no token bindings, no theme response, and diverge silently on theme switch. Always use **Basic Text Asset** for any standalone text layer.

### Component details

| Property         | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| Library          | `cx.asset.text`                                                          |
| Component key    | `6209e2b0b166983bcb5697be17578479f8bcbfcb`                               |
| Import with      | `importComponentByKeyAsync` (it is a single component, not a set)        |
| Text property    | `text#142:1`                                                             |
| Default font     | Library-carried; resolved by active brand mode — read via `textNode.fontName`, never hardcode |

### Procedure

```ts
// 1. Insert the component — no font loading needed for this step.
//    The library carries whatever font the component uses in the active brand mode.
const component = await figma.importComponentByKeyAsync('6209e2b0b166983bcb5697be17578479f8bcbfcb');
const inst = component.createInstance();
parent.appendChild(inst);

// 2. Set text content via component property.
inst.setProperties({ 'text#142:1': 'Your text here' });

// 3. Resolve font names at runtime — NEVER hardcode family names.
//    Chassis font families are typography variables; they resolve differently per brand mode.
const textNode = inst.findOne(n => n.type === 'TEXT');
const style = await figma.importStyleByKeyAsync(textStyleKey);

await figma.loadFontAsync(textNode.fontName as FontName); // "from": current font in active brand mode
await figma.loadFontAsync(style.fontName   as FontName); // "to":   target font in active brand mode

// 4. Apply the text style.
await textNode.setTextStyleIdAsync(style.id);
```

### Anti-patterns

```
❌ figma.createText()                          — raw text node, no Chassis token bindings
❌ loadFontAsync({ family: 'Archivo Narrow' }) — hardcoded; breaks under a different brand mode
❌ loadFontAsync({ family: 'Helvetica Neue' }) — hardcoded; same problem
❌ textNode.fontName = { ... }                 — bypasses the text style system
❌ textNode.fontSize = 16                      — raw typography, not system-driven
```

---

## Buttons

### Choosing a button style

| Action level        | Component        | Visual treatment                               |
| ------------------- | ---------------- | ---------------------------------------------- |
| Primary action      | `button-solid`   | `bg-solid` background, `fg-solid` text         |
| Secondary action    | `button-smooth`  | `bg-highlight` background, `fg-highlight` text |
| Tertiary action     | `button-outline` | `border-main` border, `fg-main` text           |
| Inline / link-style | `button-link`    | Transparent background, `link-main` text       |

### Context variants

All button styles accept the full set of color contexts: `default`, `alternate`, `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `black`, `white`. Choose by intent:

- **Primary action** → `context: primary`
- **Default secondary action** → `context: default`
- **Destructive action** → `context: danger`
- **Confirm success** → `context: success`

### Size variants

Available: `small`, `medium` (default), `large`.

> **Never mix sizes within the same action group or section.** All buttons in a toolbar, footer, or form action row must share the same size.

### Mixing styles for hierarchy

Hierarchy via style is encouraged — e.g., a footer with `[Cancel: outline] [Save: solid primary]` creates clear primary vs. secondary affordance. Mixing styles is the right tool for visual priority.

### Boolean props (common)

| Prop             | Default | Effect                        |
| ---------------- | ------- | ----------------------------- |
| `has-icon-start` | `true`  | Show leading icon             |
| `has-icon-end`   | `true`  | Show trailing icon            |
| `has-badge`      | `true`  | Show inline badge after label |
| `is-dropdown`    | `true`  | Show dropdown caret indicator |

> **All four default to `true`.** A freshly placed Solid/Smooth/Outline/Link Button instance arrives showing every decoration. For a plain label-only button, set the unwanted props to `false` explicitly. See [Boolean Visibility Props — Default `true`](#boolean-visibility-props--default-true).

When `has-icon-*: true`, also set `icon-*-instance` (instance-swap) to specify the icon component.

---

## Forms

### Choosing a form style

Pick **one** form style and apply it consistently across the screen — never mix `regular`, `floating`, and `outline` in the same form.

| Style           | When to use                                                           |
| --------------- | --------------------------------------------------------------------- |
| `form-regular`  | Standard forms — most common, label above field                       |
| `form-floating` | Material-inspired — floating labels animate from placeholder to label |
| `form-outline`  | Material-inspired — prominent border, no background                   |

### Two components per form file: Input vs. Field

Every form-style file (`form-regular`, `form-floating`, `form-outline`, **`form-check`**) ships **two** components — a bare input and a wrapper field. Pick the right one for the context:

| File            | Bare control    | Wrapper                                              |
| --------------- | --------------- | ---------------------------------------------------- |
| `form-regular`  | **Form Input**  | **Form Field** (label + nested Form Input + helper)  |
| `form-floating` | **Form Input**  | **Form Field** (label + nested Form Input + helper)  |
| `form-outline`  | **Form Input**  | **Form Field** (label + nested Form Input + helper)  |
| `form-check`    | **Check Input** | **Form Check** (label + nested Check Input + helper) |

| Component           | What it is                                                            | Use when                                                                                                                    |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Bare input**      | The bare control only (text input, select, textarea, checkbox, radio) | Inline filters, table cells, toolbars, compound controls — anywhere label and feedback are handled externally or not needed |
| **Wrapper (Field)** | A wrapper with **a nested bare input** + label + helper/feedback      | Standard forms — the default choice when you need a labeled control with validation messaging                               |

> **Default to the wrapper** (`Form Field` / `Form Check`) for standard form layouts. Reach for the bare input (`Form Input` / `Check Input`) only when you explicitly do not want the label / helper-text scaffolding (e.g., a search input in a navbar, an editable cell in a table, a tightly-packed checkbox column).

When using a wrapper, override the nested input's props (placeholder, value, state, selected) through the wrapper's surfaced properties or by drilling into the nested instance — not by replacing the input.

### Form Check (checkboxes / radios)

Use `form-check` for both checkboxes and radio buttons (see `Check Input` vs. `Form Check` above for which sub-component to pick). Available variants:

- **Type**: `checkbox` / `radio` / `indeterminate`
- **State**: `idle`, `disabled`, `error`, `success`
- **Checked**: `true` / `false`

### Validation states

Use `state` prop to show validation:

- **Error** → `state: error` + error message via `Helper Text Asset`
- **Success** → `state: success` + confirmation via `Helper Text Asset`
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

| Prop          | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `checkbox`    | Show selection checkbox in header (for selectable tables) |
| `filtering`   | Show filter UI (dropdown / search)                        |
| `has-sorting` | Enable sort indicator (when `checkbox: false`)            |
| `has-input`   | Show inline input (when `checkbox \|\| filtering`)        |

### Why composition?

Composing rows from cells (instead of one giant Table component) means you can:

- Swap individual cell types per column without affecting others
- Reuse the same row component across tables with different layouts
- Update one cell variant globally to propagate everywhere

---

## Themes & Modes

Chassis uses Figma's variable collections for multi-theme support:

| Collection | Modes                                         |
| ---------- | --------------------------------------------- |
| Brand      | Brand A, Brand B, ... (brand identity)        |
| Theme      | Light, Dark, High Contrast, ... (color modes) |
| App        | Web, iOS, Android, ... (platform variants)    |

### Switching levels

| Level     | When to use                                                    | How                                                   |
| --------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| Page      | Preview entire file in another theme                           | Deselect all → Page panel → Apply variable mode       |
| Frame     | Design a section in a specific theme                           | Select frame → Appearance panel → Apply variable mode |
| Component | Override theme for one instance (e.g., dark CTA on light page) | Select instance → Appearance → Apply variable mode    |

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

## Plugin API Recipes

Canonical, copy-paste-safe snippets for the most common operations. These encode the Chassis-specific rules (pre-load fonts for text nodes, no variable mode on instances, `layoutSizingHorizontal` after `appendChild`) so you don't have to reconstruct them from first principles each time.

### Inserting a Chassis component instance

```ts
// CORRECT: Insert a Chassis component and make it fill its parent's width.
async function insertChassisComponent(
  wrapper: FrameNode,
  componentKey: string,
  variantName?: string   // e.g. "size=small" or "variant=top"
): Promise<InstanceNode> {
  const set = await figma.importComponentSetByKeyAsync(componentKey)
  const variant = variantName
    ? (set.children.find(c => c.name === variantName) ?? set.defaultVariant)
    : set.defaultVariant
  const inst = (variant as ComponentNode).createInstance()

  // ⚠️ NEVER call figma.loadFontAsync() here — not needed.
  // ⚠️ NEVER call inst.setExplicitVariableModeForCollection() —
  //    Chassis components resolve tokens automatically from the library.

  wrapper.appendChild(inst)

  // layoutSizingHorizontal MUST be set AFTER appendChild,
  // otherwise it silently has no effect.
  inst.layoutSizingHorizontal = 'FILL'

  return inst
}
```

### Applying a Chassis text style to a text node

> **Always use Basic Text Asset — never `figma.createText()`** for standalone text in Chassis. Raw text nodes have no token bindings and don't respond to theme changes.

```ts
// CORRECT: Insert a Basic Text Asset instance and apply a font/* text style.
//
// Font loading — resolve names at runtime, never hardcode:
//   setTextStyleIdAsync does NOT auto-load fonts. Load both the "from" font
//   (what the text node currently has) and the "to" font (what the style resolves to).
//   Both are brand-variable — they depend on the active brand collection mode.

async function chassisText(
  parent: FrameNode | GroupNode,
  styleKey: string,  // key from search_design_system / get_metadata
  content: string
): Promise<InstanceNode> {
  // 1. Insert Basic Text Asset — no font loading needed for the component itself.
  const component = await figma.importComponentByKeyAsync('6209e2b0b166983bcb5697be17578479f8bcbfcb')
  const inst = component.createInstance()
  parent.appendChild(inst)

  // 2. Set text content via the component's text property.
  inst.setProperties({ 'text#142:1': content })

  // 3. Resolve and load both fonts dynamically — brand-agnostic.
  const textNode = inst.findOne(n => n.type === 'TEXT') as TextNode
  const style = await figma.importStyleByKeyAsync(styleKey)
  await figma.loadFontAsync(textNode.fontName as FontName)  // "from": current brand mode font
  await figma.loadFontAsync(style.fontName   as FontName)   // "to":   target brand mode font

  // 4. Apply the style.
  await textNode.setTextStyleIdAsync(style.id)

  return inst
}
```

### Setting text inside a Chassis component's Asset slot

Chassis components expose text through nested `*Asset` instances, not top-level props. To set the text label on a component (button, badge, tab, etc.):

```ts
// CORRECT: Override text in a Chassis component's Asset slot.
async function setChassisAssetText(
  instance: InstanceNode,
  slotName: string,   // e.g. "Label", "Text", "Title"
  content: string,
  styleKey?: string   // optional: apply a Chassis text style too
): Promise<void> {
  // Find the *Asset nested instance (name ends in "Asset")
  const asset = instance.findOne(
    n => n.name === `${slotName} Asset` || n.name === `${slotName}Asset`
  ) as InstanceNode | null
  if (!asset) throw new Error(`Asset slot "${slotName}" not found on "${instance.name}"`)

  // Most Chassis Assets expose a "text" TEXT property on the instance itself:
  asset.setProperties({ text: content })

  // If a style key is provided, also apply it to the inner TEXT node:
  if (styleKey) {
    const textNode = asset.findOne(n => n.type === 'TEXT') as TextNode | null
    if (textNode) {
      const style = await figma.importStyleByKeyAsync(styleKey)
      // Load both fonts dynamically — never hardcode; font families are brand-variable.
      await figma.loadFontAsync(textNode.fontName as FontName)  // "from"
      await figma.loadFontAsync(style.fontName   as FontName)   // "to"
      await textNode.setTextStyleIdAsync(style.id)
    }
  }
}
```

> **Finding the slot name:** Call `instance.findAll(n => n.name.endsWith('Asset'))` to list all Asset slots on an instance. The slot name is the part before `" Asset"` or `"Asset"` in the layer name.

---

## Anti-patterns

Reject these when working in Chassis:

### Font & typography (Plugin API)

- ❌ **Using `loadFontAsync` to directly assign a font** (e.g. as a substitute for `setTextStyleIdAsync`) — raw font application bypasses the Chassis text style system. `loadFontAsync` IS required as a prerequisite before `setTextStyleIdAsync`, but only to satisfy the API — resolve both fonts dynamically from `textNode.fontName` ("from") and `style.fontName` ("to"). Never hardcode font family names; they are brand-variable and will break under a different brand mode.
- ❌ **`figma.createText()` for standalone text in Chassis** — always use Basic Text Asset instead. See [Basic Text Asset — Standalone Text in Chassis](#basic-text-asset--standalone-text-in-chassis).
- ❌ **`textNode.fontName = { family, style }`** — raw font assignment bypasses text styles; use `importStyleByKeyAsync` + `setTextStyleIdAsync`.
- ❌ **`textNode.fontSize`, `.letterSpacing`, `.lineHeight` (raw)** — all typography properties must come from a `font/*` text style, never assigned directly.
- ❌ **`instance.setExplicitVariableModeForCollection()` on a component instance** — Chassis components resolve variable modes automatically from the library. Setting modes on individual instances overrides that context and causes wrong font/color resolution. Only set variable modes on **wrapper frames**.

### Token & variable

- ❌ **Hardcoded hex/rgb colors** — use `color/context/*` tokens
- ❌ **Hardcoded pixel spacing** — use `space/context/*` or `space/unit/*`
- ❌ **Hardcoded font properties** — apply a `font/*` **text style** (via `setTextStyleIdAsync`); don't set raw family/size/weight, and don't bind individual `typography/*` variables on production text. See [typography.md](./typography.md).
- ❌ **Custom border radii / widths** — use `borderRadius/context/*` or `borderWidth/context/*`
- ❌ **Custom opacity values** — use `opacity/context/*` or `opacity/level/*`
- ❌ **Raw drop-shadow effects** — apply a `shadow/context/*` **effect style** (via `setEffectStyleIdAsync`); never set `node.effects` with a hand-crafted shadow object

### Component usage

- ❌ **Setting text on parent component** — use the nested `*Asset` (Asset Override Pattern)
- ❌ **Importing by component name** — use `componentKey` (names can collide / change)
- ❌ **Setting `layoutSizingHorizontal = 'FILL'` before `appendChild`** — silently has no effect. Always append to the parent first, then set sizing.
- ❌ **Revealing hidden sub-layers** — only the documented prop API is supported
- ❌ **Mixing button sizes within an action group** — pick one size per group
- ❌ **Mixing form styles within one form** — pick `regular`, `floating`, or `outline` and stick with it
- ❌ **Using a `… @ x.x`-named component** — the `@ x.x` suffix marks deprecated versions; use the unversioned same-named component instead

### Layout & structure

- ❌ **Converting frames to auto-layout opportunistically** — only when user requests structural cleanup
- ❌ **Losing position info** — when replacing inside a non-auto-layout parent, preserve `x`, `y`, `width`, `height` explicitly
- ❌ **Detached instances** — never detach a library component to "fix" a missing variant; either use a different component, compose, or report blocked

### Workflow

- ❌ **Rewriting a whole screen in one operation** — always section-by-section
- ❌ **Inventing custom components** — if the library doesn't have it, report blocked
- ❌ **Skipping validation** — confirm each section visually before moving on
