# Typography in Chassis

> **Critical distinction:** In Chassis, `font/{family}/{size}/{weight}` (e.g. `font/text/medium/normal`) is **not a variable**. It is a **Figma text style** — a named bundle of typography properties. The text style itself is composed of underlying **typography variables** (`typography/fontFamily/*`, `typography/fontSize/*`, `typography/lineHeight/*`, etc.).
>
> Apply **text styles**, not raw values, and not individual typography variables.

## What a Chassis text style looks like

```
font/text/medium/normal   ← the Figma text style (this is what you apply)
├─ fontFamily        → typography/fontFamily/text
├─ fontWeight        → typography/fontWeight/text/normal
├─ fontSize          → typography/fontSize/text/medium
├─ lineHeight        → typography/lineHeight/text/medium
├─ letterSpacing     → typography/letterSpacing/base/zero
├─ paragraphSpacing  → typography/paragraphSpacing/base/zero
├─ textCase          → typography/textCase/base/none
└─ textDecoration    → typography/textDecoration/base/none
```

The Figma UI confirms which surface you're looking at:

| Typography panel shows                                                                                 | Meaning                                                                                   |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `Ag font/text/medium/normal · 16/24` (single chip with the `Ag` style icon)                            | A **text style** is applied — correct.                                                    |
| Individual chips on family / size / weight rows (`typography/fontFamily/text`, `…/strong`, `18`, etc.) | Individual **typography variables** are bound — partial, almost always wrong for Chassis. |
| Plain values (`Inter`, `Medium`, `16`, `24`, `0%`) with no chip                                        | **Raw values** — wrong. Replace with the matching text style.                             |

If the panel doesn't show a single `font/*` chip at the top, the type is not properly styled.

## How to apply text styles (Plugin API)

Text styles are **library assets**, like components — they must be imported by key, then applied to `TextNode.textStyleId`.

> **Why you must never hardcode font family names in `loadFontAsync` calls:**
> Chassis text styles store font families as **typography variables** (e.g. `typography/fontFamily/text`). Those variables resolve to different actual font families depending on the active **brand collection variable mode** — and that mapping can vary across projects that use Chassis. Hardcoding `Archivo Narrow`, `Helvetica Neue`, or any other family name will silently break whenever a different brand mode is active. Always **resolve font names at runtime** from the style object and the text node itself.

### Universal recipe (brand-agnostic)

```ts
// 1. Import the style — no font loading needed for this step.
const style = await figma.importStyleByKeyAsync(textStyleKey)

// 2. Resolve the "from" and "to" font names at runtime.
//    textNode.fontName always returns the currently rendered font (the resolved value
//    of any bound variable), not the variable reference itself — safe to use directly.
const currentFont = textNode.fontName as FontName  // "from": what the node has now
const targetFont  = style.fontName   as FontName   // "to":   what the style will apply

// 3. Load both. If they happen to be identical, the second call is a no-op.
await figma.loadFontAsync(currentFont)
await figma.loadFontAsync(targetFont)

// 4. Apply the style.
await textNode.setTextStyleIdAsync(style.id)
```

This recipe works unchanged for:
- Manually created text nodes (`figma.createText()` — current font is always Inter Regular)
- Text nodes inside Basic Text Asset instances (current font is whatever the library carries in the active brand mode)
- Any other component's inner text nodes

**Do not** substitute step 2 with hardcoded family names, even as a "quick fix". The resolved font is available directly from `textNode.fontName` and `style.fontName` — there is no reason to guess.

### Using Basic Text Asset (preferred for standalone text)

```ts
// No font loading before component insertion — library carries fonts automatically.
const component = await figma.importComponentByKeyAsync('6209e2b0b166983bcb5697be17578479f8bcbfcb')
const inst = component.createInstance()
parent.appendChild(inst)
inst.setProperties({ 'text#142:1': content })

// Then apply the text style using the universal recipe above:
const textNode = inst.findOne(n => n.type === 'TEXT')
const style = await figma.importStyleByKeyAsync(textStyleKey)
await figma.loadFontAsync(textNode.fontName as FontName)  // "from"
await figma.loadFontAsync(style.fontName   as FontName)   // "to"
await textNode.setTextStyleIdAsync(style.id)
```

Notes:

- `setTextStyleIdAsync` (not the deprecated synchronous `textStyleId =`) is required for library styles.
- **Never call `loadFontAsync` before `importComponentByKeyAsync` / `importComponentSetByKeyAsync` / `createInstance()`** — component instances carry their own font context from the library. Font loading is only needed immediately before `setTextStyleIdAsync`.
- After applying, **do not** re-bind individual typography variables on the same node — that breaks the style link and will surface as "mixed" or "detached" in the inspector.
- Mixed runs (different styles on different ranges) are not supported in Chassis text — split the layer instead.

## Resolving a text style key

In order of preference:

1. `search_design_system` with `includeStyles: true` (or equivalent style-aware search) — returns `key` for each text style. Use this in the same pass as component resolution.
2. `get_metadata` on the source file — exposes published style keys.
3. **Never** look up by name only. Names can collide across libraries.

If the deliverable already contains a node with the right text style, you can also read its `textStyleId`, resolve it via `figma.getStyleByIdAsync`, and reuse the key.

## When to bind a typography variable directly

Almost never. The legitimate cases:

- Building a **new text style** in the `chassis-tokens` source — out of scope for this skill.
- A one-off Asset that intentionally diverges from the system **and** the user has explicitly approved it. In that case, bind variables (not raw values), and document the divergence.

Anything else: pick the closest `font/*` text style.

## Choosing a text style

Pattern: `font/{family}/{size}/{weight}`

### Family

| Family    | Use for                                                              |
| --------- | -------------------------------------------------------------------- |
| `text`    | Body text, labels, general-purpose typography                        |
| `display` | Headings, titles, prominent text                                     |
| `html`    | Documentation/content design — simulating HTML headings/lists/quotes |
| `code`    | Monospaced code snippets, technical text                             |

### Size

`2xsmall` → `5xlarge`. `medium` is the default body size. See [tokens.md → Typography](./tokens.md#typography) for the full table and use-case guidance.

### Weight

| Weight    | Use for                                               |
| --------- | ----------------------------------------------------- |
| `normal`  | Standard text                                         |
| `strong`  | Slightly emphasized text                              |
| `mass`    | Heavy weight for very prominent text                  |
| `elegant` | Sophisticated emphasis — main headings, hero sections |

> Weight names are **descriptive, not numeric**, on purpose — different brands map them to different numeric weights.

## Anti-patterns

- ❌ **Raw font values** (`Inter`, `16`, `24`, `0%`) on a text node.
- ❌ **`textNode.fontName = { family, style }`** — never set font properties directly. Always apply a `font/*` text style via `setTextStyleIdAsync`.
- ❌ **`textNode.fontSize = 16` / `.letterSpacing` / `.lineHeight`** — never set typography properties raw. Use text styles only.
- ❌ **Skipping `figma.loadFontAsync()` before `setTextStyleIdAsync`** — `setTextStyleIdAsync` does NOT auto-load fonts. Always load both the node's current font (`textNode.fontName`) and the style's target font (`style.fontName`) before calling it.
- ❌ **Hardcoding font family names in `loadFontAsync` calls** — Chassis font families are resolved through typography variables whose values depend on the active brand collection mode. Hardcoding names like `Archivo Narrow` or `Helvetica Neue` silently breaks when a different brand mode is active. Use `textNode.fontName` and `style.fontName` to resolve font names at runtime.
- ❌ **`figma.loadFontAsync()` before component insertion** — component instances carry their own font context from the library. Font loading is only needed immediately before `setTextStyleIdAsync`, not before `importComponentByKeyAsync` / `importComponentSetByKeyAsync` / `createInstance()`.
- ❌ **`figma.createText()` for standalone text in Chassis** — always use Basic Text Asset (`importComponentByKeyAsync('6209e2b0b166983bcb5697be17578479f8bcbfcb')`) instead.
- ❌ **Binding only `typography/fontSize/*` (or any single typography variable)** instead of applying the full `font/*` text style.
- ❌ **Calling `font/text/medium/normal` a "variable" or "token"** — it's a **text style**. Variables are the things _inside_ it (`typography/*`).
- ❌ **Setting `textStyleId` synchronously** for library styles — use `setTextStyleIdAsync`.
- ❌ **Mixing styles within a single text node** — split into multiple nodes.
- ❌ **Re-binding typography variables after applying a style** — detaches the style.

## Quick checklist

- [ ] Every text node shows a single `font/*` chip in the Figma Typography panel.
- [ ] No raw font family / size / line-height / weight values anywhere.
- [ ] No `figma.createText()` — standalone text uses Basic Text Asset component instead.
- [ ] `loadFontAsync` calls use `textNode.fontName` and `style.fontName` — no hardcoded family names.
- [ ] Both the "from" font (`textNode.fontName`) and "to" font (`style.fontName`) are loaded before `setTextStyleIdAsync`.
- [ ] No `figma.loadFontAsync()` calls before component instance creation — font loading happens only immediately before `setTextStyleIdAsync`.
- [ ] No individual `typography/*` variable bindings on production text (unless explicitly approved).
- [ ] Style applied via `importStyleByKeyAsync` + `setTextStyleIdAsync`.
- [ ] Text style key was resolved via `search_design_system` / `get_metadata`, not by name.
