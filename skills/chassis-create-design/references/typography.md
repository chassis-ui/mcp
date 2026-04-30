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

| Typography panel shows | Meaning |
| --- | --- |
| `Ag font/text/medium/normal · 16/24` (single chip with the `Ag` style icon) | A **text style** is applied — correct. |
| Individual chips on family / size / weight rows (`typography/fontFamily/text`, `…/strong`, `18`, etc.) | Individual **typography variables** are bound — partial, almost always wrong for Chassis. |
| Plain values (`Inter`, `Medium`, `16`, `24`, `0%`) with no chip | **Raw values** — wrong. Replace with the matching text style. |

If the panel doesn't show a single `font/*` chip at the top, the type is not properly styled.

## How to apply text styles (Plugin API)

Text styles are **library assets**, like components — they must be imported by key, then applied to `TextNode.textStyleId`.

```ts
// 1. Resolve the text style key — preferred path: search_design_system / get_metadata.
//    Never hardcode keys.
const style = await figma.importStyleByKeyAsync(textStyleKey);

// 2. Preload the underlying font (Plugin API requirement).
await figma.loadFontAsync(textNode.fontName as FontName);

// 3. Apply.
await textNode.setTextStyleIdAsync(style.id);
```

Notes:

- `setTextStyleIdAsync` (not the deprecated synchronous `textStyleId =`) is required for library styles.
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

| Family    | Use for                                                                |
| --------- | ---------------------------------------------------------------------- |
| `text`    | Body text, labels, general-purpose typography                          |
| `display` | Headings, titles, prominent text                                       |
| `html`    | Documentation/content design — simulating HTML headings/lists/quotes   |
| `code`    | Monospaced code snippets, technical text                               |

### Size

`2xsmall` → `5xlarge`. `medium` is the default body size. See [tokens.md → Typography](./tokens.md#typography) for the full table and use-case guidance.

### Weight

| Weight    | Use for                                                                      |
| --------- | ---------------------------------------------------------------------------- |
| `normal`  | Standard text                                                                |
| `strong`  | Slightly emphasized text                                                     |
| `mass`    | Heavy weight for very prominent text                                         |
| `elegant` | Sophisticated emphasis — main headings, hero sections                        |

> Weight names are **descriptive, not numeric**, on purpose — different brands map them to different numeric weights.

## Anti-patterns

- ❌ **Raw font values** (`Inter`, `16`, `24`, `0%`) on a text node.
- ❌ **Binding only `typography/fontSize/*` (or any single typography variable)** instead of applying the full `font/*` text style.
- ❌ **Calling `font/text/medium/normal` a "variable" or "token"** — it's a **text style**. Variables are the things _inside_ it (`typography/*`).
- ❌ **Setting `textStyleId` synchronously** for library styles — use `setTextStyleIdAsync`.
- ❌ **Mixing styles within a single text node** — split into multiple nodes.
- ❌ **Re-binding typography variables after applying a style** — detaches the style.

## Quick checklist

- [ ] Every text node shows a single `font/*` chip in the Figma Typography panel.
- [ ] No raw font family / size / line-height / weight values anywhere.
- [ ] No individual `typography/*` variable bindings on production text (unless explicitly approved).
- [ ] Style applied via `importStyleByKeyAsync` + `setTextStyleIdAsync`, with `loadFontAsync` first.
- [ ] Text style key was resolved via `search_design_system` / `get_metadata`, not by name.
