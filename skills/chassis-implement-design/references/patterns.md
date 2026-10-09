# Chassis Implementation Patterns

## Asset extraction

Chassis Figma components expose no top-level text property. Text, images and icons live in nested instances whose name ends in `Asset` (`Title Text Asset`, `Label Asset`, `Description Asset`, `Icon Asset`, `Image Asset`).

1. Walk the instance's children for `*Asset` layers; read TEXT, image hash or icon name.
2. Pick the semantic element from the asset's role and the parent component.
3. Put the content inside that element. The Asset layer itself never becomes a DOM node.
4. If the screenshot shows text that no `*Asset` child carries, drill down with `get_metadata`; the text sits in a deeper instance.

| Asset role                       | Target                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Title / Heading                  | `<h1>`–`<h6>` by outline; `<h3 class="card-title">` in a card, `<h2 class="modal-title">` in a modal |
| Subtitle                         | `<p class="card-subtitle">` in a card; `<p class="font-lead">` under a page title                    |
| Label (form)                     | `<label class="form-label" for="…">`                                                                 |
| Label (button, badge, chip, tab) | the element's own text                                                                               |
| Description / Body               | `<p>`                                                                                                |
| Helper                           | `<div class="form-help">`                                                                            |
| Action                           | text of the `<button>` or `<a>`                                                                      |
| Icon                             | `<svg class="icon">` or `<i class="icon cx-{name}-{style}">`, see components.md                      |
| Image                            | `<img>`; `<picture>` when theme-conditional                                                          |

```text
Card / Vertical (instance)
├─ Image Asset
├─ Title Text Asset   TEXT="Roadmap update"
├─ Subtitle Asset     TEXT="Q2 highlights"
├─ Description Asset  TEXT="What shipped this quarter…"
└─ Action Asset       TEXT="Read more"
```

```html
<div class="card">
  <img class="card-image-top" src="/assets/roadmap.jpg" alt="" />
  <div class="card-body">
    <h3 class="card-title">Roadmap update</h3>
    <p class="card-subtitle">Q2 highlights</p>
    <p>What shipped this quarter…</p>
    <a href="#" class="button primary sm me-auto">Read more</a>
  </div>
</div>
```

## Variants → modifiers

Figma variant props become space-separated classes on the root, in the order `{root} {color} {style} {size} {state}`. States that HTML expresses are attributes, not classes.

| Figma                                                 | Markup                                            |
| ----------------------------------------------------- | ------------------------------------------------- |
| `Button / context=primary`                            | `button primary`                                  |
| `Button / context=primary, style=outline, size=small` | `button primary outline sm`                       |
| `Button / state=disabled`                             | `button primary` + `disabled`                     |
| `Badge / context=success`                             | `badge success`                                   |
| `Card / size=large`                                   | `card lg`                                         |
| `Card / context=warning`                              | `card context warning`                            |
| `Tab / state=active`                                  | `nav-link active` + `aria-selected="true"`        |
| `has-icon=false`, `has-subtitle=false`                | omit the child element; there is no `has-*` class |

Which components take the color directly and which need `context` is in the Components table of css-classes.md ("Direct color").

## The context class

`context {ctx}` re-aims every color variable of a subtree; `solid`, `smooth` and `outline` change the surface treatment. Use it for any component or region whose Figma context is not `default` and that has no direct color class:

```html
<div class="card context warning">…</div>
<table class="table striped context primary">
  …
</table>
<nav class="navbar md:navbar-expand context primary solid">…</nav>
<section class="context alternate py-3xl">…</section>
```

Inside it, `fg-main`, `bg-even`, `border-subtle`, `icon-subtle` and the component colors resolve to the context's palette. Prefer one `context` on the wrapper over per-element `{ctx}-fg-*` classes.

## Layout

### Auto-layout → flex or stacks

| Figma auto-layout      | Classes                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| Horizontal             | `d-flex` (or `hstack` for a centered row with `gap-{size}`)             |
| Vertical               | `d-flex flex-column` (or `vstack`)                                      |
| Wrap                   | `flex-wrap`                                                             |
| Item spacing           | `gap-{size}`                                                            |
| Padding                | `p-{size}`, `px-`, `py-`                                                |
| Main-axis alignment    | `justify-content-start \| center \| end \| between \| around \| evenly` |
| Cross-axis alignment   | `align-items-start \| center \| end \| baseline \| stretch`             |
| Fill container (child) | `flex-fill` or `w-100`                                                  |
| Hug contents (child)   | `w-auto`                                                                |

### Columns → the grid

Figma column layouts, constraints and breakpoint variants map to CSS Grid. `grid` is twelve tracks with the breakpoint's gutter; items span tracks.

```html
<div class="container">
  <div class="grid">
    <div class="col-span-full md:col-span-6 lg:col-span-4">…</div>
    <div class="col-span-full md:col-span-6 lg:col-span-4">…</div>
    <div class="col-span-full lg:col-span-4">…</div>
  </div>
</div>
```

- An item with no span class is one track wide, so write `col-span-full` for the mobile layout.
- `grid-cols-{n}` changes the track count; `grid-fill` makes equal auto-fit columns (card grids, galleries).
- `col-start-{n}` offsets; `gap-{size}`, `row-gap-`, `column-gap-` override the gutter.
- A grid inside a component that should respond to its own width uses `@md:col-span-6` and sits inside a `contains-inline` ancestor (or a `grid contained`).
- `container` centers and pads to the page margin; `container fluid` is full width; `container lg` is full width until `lg`. A grid does not need a container.

Figma width variants named by breakpoint (`screen-small`, `screen-medium`, `screen-large`) are mobile-first: the smallest variant is the unprefixed layout, each larger one adds a prefixed class.

### Sections and pages

Figma `Page` and `Section` components have no CSS class. Compose: `<main class="container py-3xl">`, `<section class="py-2xl">` with a `<h2 class="font-heading">`, and a `grid` or `vstack` inside. Mobile navs (`mobile-nav-top`, `mobile-nav-bottom`) are a `navbar` at the top, or a `nav nav-segments` in a `position-fixed bottom-0 w-100` wrapper at the bottom.

## Theming

### Document and subtree

```html
<html lang="en" data-cx-theme="dark"></html>
```

```html
<section class="context alternate" data-cx-theme="dark">
  <h2 class="font-heading">Inverse hero</h2>
  <p class="fg-subtle">Subtitle</p>
</section>
```

The nearest attribute wins. Colors are `light-dark()` tokens, so every class follows; no `bg-inverse` tricks are needed to invert a section. `data-cx-theme="primary"` and the other context names exist for pages that set a colored theme; use them only when the project does.

### Theme-conditional assets

A layer gated by `figma/switch/theme/mode-*` (a dark-mode logo, an illustration) becomes conditional markup:

```html
<!-- Follows the attribute and the system preference -->
<picture>
  <source srcset="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.svg" alt="Brand" />
</picture>
```

When the page toggles `data-cx-theme` itself, `<picture>` does not follow the attribute. Native mode: twin images with a `color-mode()` rule in the project's Sass. Tailwind mode: `<img class="d-none dark:d-block" …>` and `<img class="dark:d-none" …>`, which follow both the attribute and the preference.

Brand switches (`figma/switch/brand/*`) are not expressed in markup. A project compiles one brand of `@chassis-ui/tokens`.

## Native vs Tailwind mode

| Concern                         | `native`                                          | `tailwind`                                                                                                                  |
| ------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Class names                     | css-classes.md                                    | The same names                                                                                                              |
| Responsive prefixes             | Only on the families that list them               | On every utility                                                                                                            |
| `dark:` / `light:`              | `dark:` on a few families, system preference only | On every utility; follows `data-cx-theme` and the preference                                                                |
| `hover:`                        | On shadow, link and decoration opacities          | On every utility                                                                                                            |
| Grid placement                  | `col-span-*` from Chassis                         | `col-span-*` from Tailwind core, same declarations; numeric gaps (`gap-4`) do not exist                                     |
| Numeric Tailwind utilities      | Do not exist                                      | Do not exist either: the theme is reset, only Chassis scales remain                                                         |
| Tailwind names that are Chassis | —                                                 | `grid`, `container`, `table`, `inline`, `list-item`, `collapse`, `outline`, `static`, `caption-top` are the Chassis classes |
| Runtime-built class names       | Fine                                              | Need the safelist (`@chassis-ui/css/tailwind/safelist.css`) or literal names in source                                      |
| Extra color utilities           | None                                              | With the bridge: `ring-primary/50`, `bg-primary-70`, gradient stops                                                         |

Markup written with the Chassis names renders the same in both modes. Reach for Tailwind-only variants (`hover:bg-even`, `dark:fg-primary`) only in `tailwind` mode, and say so in the summary.

## Semantic HTML

| Role                  | Element                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| Action that runs code | `<button type="button">`                                               |
| Action that navigates | `<a href>`                                                             |
| Form control          | `<input>` / `<select>` / `<textarea>` with `<label for>`               |
| Navigation            | `<nav aria-label>`                                                     |
| List                  | `<ul>` / `<ol>`; `<ul class="list">` for the component                 |
| Table                 | `<table class="table">` with `<thead>`, `<th scope>`                   |
| Modal, drawer, alert  | `<dialog>`                                                             |
| Accordion item        | `<details>` / `<summary>`                                              |
| Icon                  | `aria-hidden="true"` when decorative, `role="img" aria-label` when not |

## Anti-patterns

```html
<!-- ❌ MCP output adapted -->
<div className="bg-white rounded-lg shadow p-6 md:flex gap-4">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
</div>

<!-- ✅ Chassis, from the tokens -->
<div class="card">
  <div class="card-body md:d-flex gap-md">
    <h3 class="card-title">Title</h3>
  </div>
</div>
```

```html
<!-- ❌ long names, old breakpoints, old grid, Bootstrap parts -->
<div class="row">
  <div class="col-12 col-medium-6 p-medium rounded-round">…</div>
</div>
<button class="btn btn-primary btn-lg">…</button>
<div class="card">
  <div class="card-content"><p class="card-text">…</p></div>
</div>

<!-- ✅ -->
<div class="grid">
  <div class="col-span-full md:col-span-6 p-md rounded-full">…</div>
</div>
<button class="button primary lg">…</button>
<div class="card">
  <div class="card-body"><p>…</p></div>
</div>
```

```html
<!-- ❌ Asset wrapper kept; hyphenated modifiers; raw values -->
<div class="title-text-asset">Heading</div>
<span class="badge-success-smooth">New</span>
<p style="color:#0a84ff; margin-top:24px">…</p>

<!-- ✅ -->
<h2>Heading</h2>
<span class="badge success smooth">New</span>
<p class="fg-primary mt-xl">…</p>
```

Also wrong: two colors on one root (`button primary success`), mixed sizes in one `button-group`, mixed regular and floating fields in one form, hidden Figma layers emitted with `d-none`, `data-bs-*` attributes, `<div role="button">`.
