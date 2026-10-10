# Chassis Implementation Patterns

How the output of the Figma tools becomes Chassis markup, one concern per section: what the code block of `get_design_context` shows of a Chassis design, how text is lifted out of the Asset layers, how variants become modifiers, the context class, layout, theming, what differs in Tailwind mode, the semantic element of each role, and what not to write. Each section stands on its own. A class named here is in css-classes.md; `{ctx}` stands for a context color name and `{size}` for a step of the size scale, as there.

## Reading the Figma output

`get_design_context` returns a React and Tailwind code block, a screenshot and the text styles of the node. What a Chassis design shows in it:

```text
<div className="bg-[var(--color\/button\/primary\/bg-idle,#1273e0)] px-[var(--space\/button\/medium-padding-x,12px)] rounded-[var(--borderradius\/button\/medium,2px)] …" data-node-id="16:158" data-name="Sign in button">
  <div className="…" data-name="Label Frame">
    <div className="…" data-name="Label Asset">
      <p className="… text-[color:var(--color\/button\/primary\/fg-idle,white)] …">Sign in</p>
```

- **The variable of a property** is in its class: `gap-[var(--space\/context\/medium,16px)]` is `space/context/medium` on the gap, with the resolved value after the comma. The name is lower-cased there (`--borderradius\/…`); `get_variable_defs` lists the same variables as `{ "borderRadius/button/medium": "2" }`, with their exact names. A class with a bare value (`gap-[16px]`) is a property with no variable, with two exceptions that the code block never shows as bound: a width, height or minimum size (`size-[20px]` on an icon whose size is `size/icon/glyph/small`) and the fill of a glyph, which is an `<img>` there. Find those in `get_variable_defs`, called on the smallest top-level node that holds them. The variables on the layers inside an instance are the component's own, unit tokens included (`space/unit/8` in a `Form Help`): its class applies them. So are the variables on the root of the instance; what its class does not draw (the bottom border of `Navbar`, bound to `border-subtle`) is a difference between the library and the stylesheet: add the utility when the screenshot shows it, and flag it.
- **The component** of an instance is its `data-name`, which is the name of the component set (`Solid Button`, `Regular Form Field`) unless the designer renamed the layer ("Sign in button"). A renamed instance is told by the layers inside it, which keep their names ("Label Frame" › "Label Asset" is a button; "Field Label", "Field Input" and "Field Help" are a `Regular Form Field`), and by its component-scoped variables (`color/button/*`, `space/form-input/*`). An instance that the code block turns into a function of its own (`DataTable`, `TableRow`, `CheckInput`) has no `data-name` on its root: the name of the function is the component. What such a function renders when nothing is passed to it (`{children || …}`, `{tableBody || …}`) is the default content of the component in the library, not of this design; the design's content is what the call passes.
- **The variants** of an instance are not listed. Read them from what the instance shows: the style from the component (`Outline Button`), the context, state and size from its variables (`color/button/primary/bg-idle` is `context=primary` and `state=idle`, `space/button/medium-padding-x` is `size=medium`; the states are `idle`, `hover`, `press`, `disabled`; an `Outline Button` has no color variables of its own and binds `color/context/default/base-color`), and the rest (an active `Nav Link`, a checked box) from the screenshot. An instance that is a function in the code block has its variants as the defaults of its props (`type = "head"`, `checked = "True"`).
- **The text style** of a text is not on it: its classes name the typography variables of the base text component, which stay `…/text/medium` when the style is overridden, with the real value after the comma (`text-[length:var(--typography\/fontsize\/text\/medium,32px)]`). The styles in use are listed after the code ("These styles are contained in the design") and in `get_variable_defs`, each with its parts (`font/context/heading`: size `typography/fontSize/text/3xlarge`, which is `32`). Match a text's size and weight to one of them.
- **A slot** (`Navbar`, `Section Block`, `Data Table`, `Table Row`, `Modal Window` and others take their content in one) comes with the instance that owns it: `<slot>` in `get_metadata`, a `data-name` such as `content` or `table-body` in the code. Fetch the instance that owns the slot; a node inside a slot fetched by its own id can come back without its children.
- **Hidden layers** are not in the code block; `get_metadata` marks them `hidden="true"`. `get_metadata` gives the tree only (`<frame>`, `<instance>`, `<slot>`, names, positions and sizes) and stops at an instance without slot content; call it with the instance's id to see one level further.

## Asset extraction

Most text of a Chassis Figma component is not a property of the component: it sits in a nested instance of a text component, named after its role and ending in `Asset` ("Label Asset", "Title Asset", "Body Asset", "Help Asset"). Some text is a plain text layer instead: "Label Text" in the "Field Label" of a form field, "Input Text" in its "Input Asset", "Check Text" in a `Form Check`, "Level 1" to "Level 4" and "Current" in a breadcrumb.

1. Walk the instance for `<Role> Asset` layers and plain text layers; read the text of each.
2. Pick the semantic element from the role and the parent component.
3. Put the content inside that element. Neither the Asset layer nor the frames around it ("Label Frame", "Asset Frame") become DOM nodes.
4. If the screenshot shows text that no layer of the response carries, drill down with `get_metadata`; the text sits in a deeper instance.

A `Basic Text  Asset` that the designer placed on a frame is a text on its own: renamed, it shows as a layer with nothing but a text in it.

| Layer                         | In                                                      | Target                                                                                               |
| ----------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| "Title Asset"                 | cards, alerts, accordion items, modal headers, tooltips | `<h1>`–`<h6>` by outline; `<h3 class="card-title">` in a card, `<h2 class="modal-title">` in a modal |
| "Title Text Asset"            | `Page Title`                                            | `<h1>`–`<h6>` by outline, usually the `<h1>` of the page                                             |
| "Subtitle Asset"              | modal headers, `Page Title`                             | `<p>` under the title, with the class of its text style                                              |
| "Category Asset"              | cards                                                   | `<p>` above the title, with the class of its text style (`font-label`)                               |
| "Body Asset"                  | cards, alerts, accordion items                          | `<p>`                                                                                                |
| "Label Asset"                 | buttons, badges, chips, tab and segment items           | the element's own text                                                                               |
| "Text Asset"                  | `Nav Link`, `Table Head Cell`                           | the element's own text                                                                               |
| "Action 1", "Action 2"        | the footer of a card                                    | text of the `<button>` or `<a>`                                                                      |
| "Label Text" in "Field Label" | form fields                                             | `<label class="form-label" for="…">`                                                                 |
| "Input Text" in "Input Asset" | form inputs                                             | the `placeholder` when its color is `…/fg-inactive`, else the `value`                                |
| "Help Asset"                  | `Form Help`                                             | `<div class="form-help">`                                                                            |
| "Check Text" in "Check Asset" | `Form Check`                                            | the text of the `<label class="form-check">`                                                         |
| An icon instance              | any component                                           | `<svg class="icon">` or `<i class="icon cx-{name}-{style}">`, see components.md                      |
| "Media Placeholder"           | cards                                                   | `<img>`; `<picture>` when theme-conditional                                                          |
| A text asset on its own       | a frame of the designer                                 | `<h1>`–`<h6>` by outline or `<p>`, with the class of its text style                                  |

```text
Contained Card (instance)
├─ Media Placeholder
├─ Category Asset   "Product"
├─ Title Asset      "Roadmap update"
├─ Body Asset       "What shipped this quarter…"
└─ Action 1         "Read more"
```

```html
<div class="card">
  <img class="card-image-top" src="/assets/roadmap.jpg" alt="" />
  <div class="card-body">
    <p class="font-label">Product</p>
    <h3 class="card-title">Roadmap update</h3>
    <p>What shipped this quarter…</p>
    <a href="#" class="button primary sm me-auto">Read more</a>
  </div>
</div>
```

## Variants → modifiers

Figma variant props become space-separated classes on the root, in the order `{root} {color} {style} {size} {state}`. The style of a button, badge or chip is its component (`Solid`, `Smooth`, `Outline`, `Link`), not a prop. States that HTML expresses are attributes, not classes.

| Figma                                                              | Markup                                              |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| `Solid Button`, `context=primary`                                  | `button primary`                                    |
| `Outline Button`, `context=primary, size=small`                    | `button primary outline sm`                         |
| `Solid Button`, `context=primary, state=disabled`                  | `button primary` + `disabled`                       |
| `Solid Badge`, `context=success`                                   | `badge success`                                     |
| `Contained Card`, `size=large`                                     | `card lg`                                           |
| `Notification`, `context=danger, style=solid`                      | `notification danger solid`                         |
| A tab item, `is-active=true`                                       | `nav-link active` + `aria-selected="true"`          |
| `Nav Link` or `Nav Segment Item`, `state=active`                   | `nav-link active` + `aria-current="page"` on a link |
| A boolean that is `false` (`has-icon-start`, `has-header`, `help`) | omit the child element; there is no class for it    |

Most sets carry the color in `context`. `Common Avatar` and `Strip Badge` call it `semantic`, `Form Check` shows it as `state=primary`, and the cards have none. Boolean names vary (`has-*` and `is-*` on most sets, bare `icon`, `help`, `label` on the forms). Which components take the color directly and which need `context` is in the Components table of css-classes.md ("Direct color").

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

Figma column layouts and constraints map to CSS Grid. `grid` is twelve tracks with the breakpoint's gutter; items span tracks.

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

A frame without auto-layout places its children by position. Read the arrangement the positions make and write it as flow (`d-flex`, `grid`, `vstack`), as the parent skill says; `position-relative` on the parent with `position-absolute` and `top-0`, `start-0`, `end-0`, `bottom-0` or `translate-middle` on a child only where the overlap is the design (a badge on an avatar, a caption on an image).

Headings and paragraphs carry a bottom margin of their own (`0.75rem` on `h1`–`h6`, `1rem` on `p`): a gap in Figma between a heading and the paragraph under it is not a margin utility, and `last-mb-0` on a container removes the margin of its last paragraph. In a flex column with `gap-{size}` the margin adds to the gap: `mb-0` on the heading or paragraph.

The library has no width variants and no breakpoint modes. When the design has frames of the same view at several widths, they are mobile-first: the narrowest frame is the unprefixed layout, each wider one adds a prefixed class.

### Sections and pages

`Page Title`, `Section Block`, `Section Header` and `Section Footer` have no CSS class. Compose: `<main class="container py-3xl">`, `<section class="py-2xl">` with an `<h2>` in the class of its text style, and a `grid` or `vstack` inside. The mobile navs are a `navbar` at the top (`Mobile Top Navigation`), or a `nav nav-segments` in a `position-fixed bottom-0 w-100` wrapper at the bottom (`Mobile Bottom Navigation`).

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

A layer gated by `figma/switch/theme/mode-*` (a dark-mode logo, an illustration) becomes conditional markup; `mode-1` shows in light and `mode-2` in dark:

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
  <div class="col-12 col-medium-6 p-medium rounded-2xlarge">…</div>
</div>
<button class="btn btn-primary btn-lg">…</button>
<div class="card">
  <div class="card-content"><p class="card-text">…</p></div>
</div>

<!-- ✅ -->
<div class="grid">
  <div class="col-span-full md:col-span-6 p-md rounded-2xl">…</div>
</div>
<button class="button primary lg">…</button>
<div class="card">
  <div class="card-body"><p>…</p></div>
</div>
```

```html
<!-- ❌ Asset wrapper kept; hyphenated modifiers; raw values -->
<div class="title-asset">Heading</div>
<span class="badge-success-smooth">New</span>
<p style="color:#0a84ff; margin-top:24px">…</p>

<!-- ✅ -->
<h2>Heading</h2>
<span class="badge success smooth">New</span>
<p class="fg-primary mt-xl">…</p>
```

Also wrong: two colors on one root (`button primary success`), mixed sizes in one `button-group`, mixed regular and floating fields in one form, hidden Figma layers emitted with `d-none`, `data-bs-*` attributes, `<div role="button">`.
