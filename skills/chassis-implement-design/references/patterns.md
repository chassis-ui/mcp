# Chassis Implementation Patterns

Patterns and anti-patterns for translating Chassis Figma views into Chassis CSS code.

## Asset Extraction

Chassis components in Figma expose **no top-level text properties**. Text content sits inside nested instances whose name ends in `Asset`.

### The rule

When `get_design_context` returns a Chassis component instance, walk its children. **Any layer whose name ends in `Asset` is a content slot** — its TEXT (or image / icon reference) is the real content; the wrapper itself is a Figma authoring convention with no DOM equivalent.

Don't try to enumerate Asset names ahead of time; the library evolves. Instead:

1. List every child whose name matches `*Asset`.
2. Read its content (TEXT for text assets, image hash for image assets, icon slug for `Icon Asset`).
3. Pick the semantic HTML element from the **role implied by the asset's name and its parent component context** (a "Title"-style asset inside a card becomes `<h5 class="card-title">`; the same name inside a page header becomes `<h1>`).
4. Inline the content into that element. **Do not emit the Asset wrapper as a DOM node.**

### Mapping role → semantic element

The asset's name suffix and its parent component's role together determine the target element. Common patterns (illustrative — confirm against the actual node tree, don't memorize):

| Role suffix in asset name     | Typical target element                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Title / Heading               | `<h1>`–`<h6>` per outline; `<h5 class="card-title">` inside a card                             |
| Subtitle                      | `<h6 class="card-subtitle fg-subtle">` inside a card; `<p class="font-lead">` on a page header |
| Label (form-adjacent)         | `<label class="form-label" for="…">`                                                           |
| Label (badge / chip / button) | inline content of the wrapping `<span>` / `<button>`                                           |
| Description / Body            | `<p>` (sometimes `<p class="card-body">` inside a card)                                        |
| Action                        | inline content of the wrapping `<button>` / `<a>`                                              |
| Helper                        | `<small class="form-text">`                                                                    |
| Caption                       | `<figcaption>` or `<small>`                                                                    |
| Icon                          | `<svg class="icon">` with the resolved sprite reference                                        |
| Image                         | `<img>` with the transferred asset (or `<picture>` for theme-conditional)                      |

If the asset's role isn't obvious from its name and parent, fall back to the screenshot and pick the element that matches the rendered semantics.

### Example

**Figma instance tree:**

```
Card / Vertical / Default (instance of @chassis Card)
├─ Image Asset (image fill)
├─ Title Text Asset (TEXT="Roadmap update")
├─ Subtitle Asset (TEXT="Q2 highlights")
├─ Description Asset (TEXT="What shipped this quarter…")
└─ Action Asset (TEXT="Read more", icon=arrow-right)
```

**Emitted Chassis CSS HTML:**

```html
<div class="card">
  <img class="card-img-top" src="/assets/roadmap.jpg" alt="" />
  <div class="card-content">
    <h5 class="card-title">Roadmap update</h5>
    <h6 class="card-subtitle fg-subtle">Q2 highlights</h6>
    <p class="card-body">What shipped this quarter…</p>
    <a href="#" class="button primary small">
      Read more
      <svg class="icon" aria-hidden="true">
        <use href="/icons/sprite.svg#icon-arrow-right"></use>
      </svg>
    </a>
  </div>
</div>
```

Note: every `*Asset` wrapper has been **lifted** — no `<div class="text-asset">` survives.

### Anti-pattern

```html
<!-- ❌ Asset wrappers kept as DOM nodes -->
<div class="card">
  <div class="image-asset"><img src="…" /></div>
  <div class="title-text-asset">Roadmap update</div>
  <div class="subtitle-asset">Q2 highlights</div>
</div>
```

## Semantic HTML

Always pick the correct semantic element for the role; class names are styling, not semantics.

| Role                      | Element                                                         |
| ------------------------- | --------------------------------------------------------------- |
| Action that runs JS       | `<button type="button">`                                        |
| Action that navigates     | `<a href="…">`                                                  |
| Form input                | `<input>` / `<textarea>` / `<select>` with paired `<label for>` |
| Heading                   | `<h1>`–`<h6>` per outline                                       |
| Navigation region         | `<nav>`                                                         |
| List                      | `<ul>` / `<ol>` / `<li>`                                        |
| Tabular data              | `<table>` with `<thead>` / `<tbody>` / `<th scope>`             |
| Aside / sidebar           | `<aside>`                                                       |
| Article / card-as-content | `<article>`                                                     |
| Dialog / modal            | `<dialog>` (or `<div role="dialog">`)                           |

## Themes & Modes

Chassis supports multi-theme designs via Brand × Theme × App. In code:

### Document-level toggle

```html
<html lang="en" data-cx-theme="dark">
  …
</html>
```

All `fg-*` / `bg-*` / context-prefixed tokens cascade automatically.

### Section-level inversion

If the Figma source has a section that uses an inverse theme (e.g., dark hero on a light page):

```html
<section class="bg-inverse" data-cx-theme="dark">
  <h1 class="font-h1 fg-main">Inverse hero</h1>
  <p class="fg-subtle">Subtitle</p>
</section>
```

### Theme-conditional assets

Layers gated by a Figma switch variable (`figma/switch/theme/mode-1`) — typically logos and illustrations — translate to **conditional rendering** in code, not display toggles on raw colors:

```html
<!-- Twin elements, gated by theme attribute -->
<img class="logo logo-light" src="/logo-light.svg" alt="Brand" />
<img
  class="logo logo-dark"
  src="/logo-dark.svg"
  alt="Brand"
  aria-hidden="true"
/>
```

```css
[data-cx-theme='light'] .logo-dark {
  display: none;
}
[data-cx-theme='dark'] .logo-light {
  display: none;
}
```

…or use `<picture>` with `prefers-color-scheme`:

```html
<picture>
  <source srcset="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.svg" alt="Brand" />
</picture>
```

### Brand switching

Brand-level overrides typically scope to a class on the document or a top-level wrapper:

```html
<body class="brand-acme">
  …
</body>
```

Confirm the project's actual brand-toggle mechanism before emitting.

## Variant → modifier translation

Figma component variants map to **space-separated modifiers** on the base class, in this conventional order:

```
{base} {context} {style?} {size?} {state?}
```

Examples:

| Figma variants                                        | Chassis class                                      |
| ----------------------------------------------------- | -------------------------------------------------- |
| `Button / context=primary`                            | `button primary`                                   |
| `Button / context=primary, style=outline`             | `button primary outline`                           |
| `Button / context=primary, style=outline, size=small` | `button primary outline small`                     |
| `Button / context=primary, state=disabled`            | `button primary` + `disabled` attribute on element |
| `Badge / context=success`                             | `badge success`                                    |
| `Alert / context=danger`                              | `alert danger`                                     |
| `Card / variant=horizontal`                           | `card horizontal` (if defined)                     |

> **State variants** (`disabled`, `loading`, `active`) are typically expressed via element attributes (`disabled`, `aria-busy="true"`, `aria-current="true"`), not class modifiers — confirm per component.

## `has-*` boolean props

Figma components often expose `has-icon`, `has-title`, `has-subtitle`, `has-action` boolean props that toggle nested layer visibility. In code, these become **presence or absence** of the corresponding child element — there is no `has-icon` class to emit. If `has-icon=false`, simply omit the `<svg class="icon">` element.

## Layout translation

### Auto-layout → flex / gap

Figma auto-layout maps to flex utilities:

| Figma direction        | Chassis classes                                                    |
| ---------------------- | ------------------------------------------------------------------ | ------ | --- | -------- | --------- | -------- |
| Horizontal             | `d-flex flex-row` (or just `d-flex`)                               |
| Vertical               | `d-flex flex-column`                                               |
| Wrap                   | add `flex-wrap`                                                    |
| Spacing between        | `gap-{semantic}` (resolved from the Figma `space/context/*` token) |
| Padding                | `p-{semantic}` / `px-` / `py-` / individual sides                  |
| Alignment (main axis)  | `justify-content-{start                                            | center | end | between  | around    | evenly}` |
| Alignment (cross axis) | `align-items-{start                                                | center | end | baseline | stretch}` |

### Constraints → responsive grid

Figma constraints (left, right, scale) and breakpoint variants map to Chassis's responsive grid:

```html
<div class="container">
  <div class="row g-medium">
    <div class="col-12 col-medium-6 col-large-4">…</div>
    <div class="col-12 col-medium-6 col-large-4">…</div>
    <div class="col-12 col-medium-12 col-large-4">…</div>
  </div>
</div>
```

Breakpoint mapping is fixed: `sm→small`, `md→medium`, `lg→large`, `xl→xlarge`, `xxl→2xlarge`.

## Validation patterns

After implementation:

1. **Visual diff** vs. the per-section `get_screenshot`. Look for spacing, alignment, type mismatches.
2. **Theme cycle**: render under each Brand × Theme × App combination targeted by the source. Watch for low-contrast text, broken backgrounds, hidden-but-needed assets.
3. **Class lint**: grep the output for `btn-`, `text-muted`, `bg-light`, `data-bs-`, numeric spacing (`p-[0-9]`), abbreviated breakpoints (`-md-`, `-sm-`, `-lg-`, `-xl-`, `-xxl-`), Asset wrapper class names (`text-asset`, `*-asset`).
4. **Accessibility**: confirm `<label for>`, `aria-*`, `role`, `scope`, `tabindex` per the component patterns in [components.md](./components.md).
5. **Behavior**: every interactive component carries the matching `data-cx-*` attributes.

## Anti-patterns

### Bootstrap leakage

```html
<!-- ❌ -->
<button class="btn btn-primary btn-lg">Save</button>
<p class="text-muted small">Hint</p>
<div class="card">
  <div class="card-body"><p class="card-text">…</p></div>
</div>
<div class="col-md-6"></div>
<button data-bs-toggle="modal" data-bs-target="#m">Open</button>
<div class="p-3 mb-4">…</div>

<!-- ✅ -->
<button class="button primary large">Save</button>
<p class="fg-subtle font-small">Hint</p>
<div class="card">
  <div class="card-content"><p class="card-body">…</p></div>
</div>
<div class="col-medium-6"></div>
<button data-cx-toggle="modal" data-cx-target="#m">Open</button>
<div class="p-medium mb-large">…</div>
```

### Hyphenated modifiers

```html
<!-- ❌ -->
<button class="button-primary-outline-large">…</button>
<span class="badge-success-soft">…</span>

<!-- ✅ -->
<button class="button primary outline large">…</button>
<span class="badge success">…</span>
```

### Raw colors / spacing

```html
<!-- ❌ -->
<p style="color:#0a84ff; margin-top:24px">Token-bound text</p>

<!-- ✅ -->
<p class="fg-primary mt-large">Token-bound text</p>
```

### Asset wrappers kept

```html
<!-- ❌ -->
<div class="title-text-asset">Heading</div>

<!-- ✅ -->
<h2 class="font-h2">Heading</h2>
```

### Wrong card subpart names

```html
<!-- ❌ Bootstrap subpart names -->
<div class="card">
  <div class="card-body">
    <h5 class="card-title">…</h5>
    <p class="card-text">…</p>
  </div>
</div>

<!-- ✅ Chassis subpart names -->
<div class="card">
  <div class="card-content">
    <h5 class="card-title">…</h5>
    <p class="card-body">…</p>
  </div>
</div>
```

### Mixing form styles in one form

```html
<!-- ❌ -->
<form>
  <div class="form-floating">…</div>
  <div class="mb-medium"><label>…</label><input class="form-control" /></div>
  <div class="form-outline">…</div>
</form>

<!-- ✅ pick one style and stick with it -->
<form>
  <div class="form-floating mb-medium">…</div>
  <div class="form-floating mb-medium">…</div>
</form>
```

### Mixing button sizes in a group

```html
<!-- ❌ -->
<div class="button-group">
  <button class="button primary large">Save</button>
  <button class="button secondary small">Cancel</button>
</div>

<!-- ✅ -->
<div class="button-group">
  <button class="button primary">Save</button>
  <button class="button secondary">Cancel</button>
</div>
```

### Revealing hidden Figma sub-layers

If a layer is hidden in the source, **omit it from the markup**. Do not emit it with `display:none` or `visibility:hidden` "just in case."
