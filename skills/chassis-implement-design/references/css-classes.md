# Chassis CSS Class Catalog

Complete class reference for translating Chassis Figma views into Chassis CSS code. Source of truth: `@chassis-ui/css` and the Bootstrap → Chassis migration guide.

> **Golden rule:** Chassis CSS uses **space-separated modifiers** on a single base class, **semantic spacing/breakpoint names**, and **`fg-*`/`bg-*`** color families. If you find yourself writing `btn-primary`, `text-muted`, `p-3`, `col-md-6`, or `data-bs-toggle`, stop — that's Bootstrap.

## Typography

### Headings & display

| Role                         | Class                                                   |
| ---------------------------- | ------------------------------------------------------- |
| H1–H6 (semantic)             | `font-h1` … `font-h6`                                   |
| Display (largest → smallest) | `font-display font-5xlarge` … `font-display font-large` |
| Lead paragraph               | `font-lead`                                             |
| Small text                   | `font-small`                                            |
| Code / mono                  | `font-code`                                             |
| Body family                  | `font-text`                                             |
| HTML semantic family         | `font-html`                                             |

Heading utility equivalents on non-`<h*>` elements: pair `font-{size}` (`font-2xlarge`, `font-xlarge`, …, `font-large`) with optional `font-display` for the display family.

### Sizes

`font-5xlarge`, `font-4xlarge`, `font-3xlarge`, `font-2xlarge`, `font-xlarge`, `font-large`, `font-medium`, `font-small`, `font-xsmall`, `font-2xsmall`.

### Weights

| Bootstrap   | Chassis        |
| ----------- | -------------- |
| `fw-light`  | `font-elegant` |
| `fw-normal` | `font-normal`  |
| `fw-bold`   | `font-strong`  |
| `fw-bolder` | `font-mass`    |

### Alignment / transform

`text-start`, `text-center`, `text-end`, `text-uppercase`, `text-lowercase`, `text-capitalize`, `text-wrap`, `text-nowrap`, `text-truncate`. (Compatible with Bootstrap names.)

## Colors

### Foreground (text)

**Default-context emphases** (no prefix — these inherit the page's neutral context and invert in dark mode):

| Role                       | Class          |
| -------------------------- | -------------- |
| Main (strongest body text) | `fg-main`      |
| Subtle (muted body text)   | `fg-subtle`    |
| Slight (lightest readable) | `fg-slight`    |
| Highlight                  | `fg-highlight` |
| Solid                      | `fg-solid`     |
| Inverse                    | `fg-inverse`   |

**Per-context shortcut utilities** (each resolves to the context's `main` emphasis):

| Context   | Class          |
| --------- | -------------- |
| Primary   | `fg-primary`   |
| Secondary | `fg-secondary` |
| Neutral   | `fg-neutral`   |
| Success   | `fg-success`   |
| Danger    | `fg-danger`    |
| Warning   | `fg-warning`   |
| Info      | `fg-info`      |
| Alternate | `fg-alternate` |
| Black     | `fg-black`     |
| White     | `fg-white`     |

For non-`main` emphases on a non-default context, use the canonical prefixed form below: `primary-fg-subtle`, `success-fg-slight`, etc.

### Background

Shortcut utilities: `bg-primary`, `bg-secondary`, `bg-success`, `bg-danger`, `bg-warning`, `bg-info`, `bg-alternate`, `bg-neutral`, `bg-black`, `bg-white` (each resolves to the context's `base-color`).

Default-context background emphases (no prefix): `bg-main`, `bg-even`, `bg-evident`, `bg-highlight`, `bg-solid`, `bg-inverse`.

### Context-prefixed variants (canonical)

`{context}-fg-{emphasis}` and `{context}-bg-{emphasis}` are the **canonical** classes generated from Figma variables. The `fg-{context}` / `bg-{context}` shortcuts above are convenience utilities that resolve to the matching context's `main` emphasis.

```html
<div class="primary-fg-main">Main primary text</div>
<div class="primary-fg-subtle">Subtle primary text</div>
<div class="primary-fg-slight">Slight primary text</div>
<div class="primary-fg-highlight">Highlighted primary text</div>
<div class="primary-fg-inverse primary-bg-main">Inverse primary text</div>

<div class="primary-bg-main">Main primary background</div>
<div class="primary-bg-evident">Evident primary background</div>
```

**Contexts (11):** `default`, `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `alternate`, `neutral`, `black`, `white`.

- `default` — page-level neutral context; **inverts in dark mode**. Classes drop the prefix: `color/context/default/fg-main` → `fg-main`.
- `alternate` — prominent content (e.g., featured / promoted sections); may not invert in dark mode.
- `neutral` — grayscale / non-semantic accent context.
- `black` / `white` — persist their literal color in all themes/modes (use sparingly for branding).
- `primary`–`info` — semantic role colors; invert per theme.

**Emphasis (fg):** `main`, `subtle`, `slight`, `highlight`, `solid`, `inverse`.
**Emphasis (bg):** `main`, `even`, `evident`, `highlight`, `solid`, `inverse`.

### Opacity utilities

`fg-opacity-{level}`, `bg-opacity-{level}` — levels: `main`, `subtle`, `slight`. Combine with a color: `fg-primary fg-opacity-subtle`.

### Bootstrap → Chassis color migration

| Bootstrap               | Chassis           |
| ----------------------- | ----------------- |
| `text-muted`            | `fg-subtle`       |
| `text-light`            | `fg-slight`       |
| `text-dark`             | `fg-main`         |
| `text-{role}`           | `fg-{role}`       |
| `bg-light`              | `bg-main`         |
| `bg-dark`               | `bg-inverse`      |
| `text-primary-emphasis` | `primary-fg-main` |

## Spacing

### Scale (semantic)

`zero`, `4xsmall`, `3xsmall`, `2xsmall`, `xsmall`, `small`, `medium`, `large`, `xlarge`, `2xlarge`, `3xlarge`, `4xlarge`, `5xlarge`, `6xlarge`.

### Properties

- Padding: `p-{size}`, `pt-`, `pe-`, `pb-`, `ps-`, `px-`, `py-`
- Margin: `m-{size}`, `mt-`, `me-`, `mb-`, `ms-`, `mx-`, `my-` (auto allowed: `mx-auto`, `ms-auto`, `me-auto`)
- Gap (in flex/grid): `gap-{size}`, `row-gap-{size}`, `column-gap-{size}`

### Bootstrap → Chassis spacing migration

| Bootstrap | Chassis                                     |
| --------- | ------------------------------------------- |
| `*-0`     | `*-zero`                                    |
| `*-1`     | `*-4xsmall`                                 |
| `*-2`     | `*-xsmall` (or `*-small` per design intent) |
| `*-3`     | `*-medium`                                  |
| `*-4`     | `*-large`                                   |
| `*-5`     | `*-2xlarge` (or `*-xlarge`)                 |

> Always pick the **named scale step that matches the bound Figma `space/context/{ctx}` token**, not a numeric guess.

## Layout & Flex

### Containers / grid

- `container`, `container-fluid`, `container-{breakpoint}`
- `row`, `col`, `col-{n}`, `col-{breakpoint}-{n}`
- `g-{size}`, `gx-{size}`, `gy-{size}` (grid gutters)

### Flex / display utilities

`d-flex`, `d-inline-flex`, `d-grid`, `d-block`, `d-inline-block`, `d-inline`, `d-none`, plus responsive variants `d-{breakpoint}-{value}`.

`flex-row`, `flex-row-reverse`, `flex-column`, `flex-column-reverse`, `flex-wrap`, `flex-nowrap`, `flex-fill`, `flex-grow-{0|1}`, `flex-shrink-{0|1}`.

`justify-content-start | center | end | between | around | evenly`.
`align-items-start | center | end | baseline | stretch`.
`align-self-*`, `align-content-*`.

### Position / sizing

`position-{static|relative|absolute|fixed|sticky}`, `top-0` … `top-100`, `start-0` … `start-100`, `end-0`, `bottom-0`, `translate-middle{-x|-y}`.

`w-25`, `w-50`, `w-75`, `w-100`, `w-auto`, `mw-100`, `vw-100`, `min-vw-100`. (Compatible with Bootstrap.)

### Borders & radius

- Border presence: `border`, `border-top`, `border-end`, `border-bottom`, `border-start`, `border-0`
- Border color: `border-{role}` (`border-primary`, `border-success`, …)
- Border width (semantic): `border-{size}` (where size is a semantic token from the borderWidth family)
- Radius: `rounded`, `rounded-{ctx}` (semantic, where `ctx` includes `round` for pills/avatars), `rounded-{side}`

## Breakpoints

| Bootstrap | Chassis   | ≥      |
| --------- | --------- | ------ |
| `sm`      | `small`   | 576px  |
| `md`      | `medium`  | 768px  |
| `lg`      | `large`   | 992px  |
| `xl`      | `xlarge`  | 1200px |
| `xxl`     | `2xlarge` | 1400px |

Apply to: `col-{bp}-*`, `d-{bp}-*`, `flex-{bp}-*`, `text-{bp}-*`, spacing `m{side}-{bp}-{size}` etc.

## Components — class shortlist

Full HTML patterns are in [components.md](./components.md). Class signatures only:

| Component      | Base + modifiers                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --- | ---------------------------------------------- |
| Button         | `button {context} {style?} {size?} {state?}` (style: `outline`/`smooth`/`link`; size: `small`/`large`)                           |
| Button group   | `button-group` (wrap multiple `.button`)                                                                                         |
| Form control   | `form-control`, `form-select`, `form-check-input`, `form-range`, `form-control-color`                                            |
| Form blocks    | `form-floating`, `form-outline`, `form-check`, `form-switch`, `form-text`                                                        |
| Card           | `card`, `card-content`, `card-title`, `card-subtitle`, `card-body`, `card-footer`, `card-img`, `card-img-overlay`, `card-header` |
| Alert          | `alert {context}`                                                                                                                |
| Badge          | `badge {context}`                                                                                                                |
| Chip           | `chip {context}`                                                                                                                 |
| Avatar         | `avatar {size?}`                                                                                                                 |
| Modal          | `modal`, `modal-dialog`, `modal-content`, `modal-header`, `modal-body`, `modal-footer`, `modal-title`                            |
| Offcanvas      | `offcanvas`, `offcanvas-{start                                                                                                   | end                                               | top | bottom}`, `offcanvas-header`, `offcanvas-body` |
| Popover        | `popover`, `popover-header`, `popover-body`                                                                                      |
| Tooltip        | `tooltip`, `tooltip-inner`, `tooltip-arrow`                                                                                      |
| Toast          | `toast`, `toast-header`, `toast-body`                                                                                            |
| Notification   | `notification {context}`                                                                                                         |
| Progress       | `progress`, `progress-bar`                                                                                                       |
| Skeleton       | `skeleton`, `skeleton-{shape}`                                                                                                   |
| Spinner        | `spinner-{border                                                                                                                 | grow}`                                            |
| Navbar         | `navbar`, `navbar-brand`, `navbar-toggler`, `navbar-collapse`, `navbar-nav`                                                      |
| Nav            | `nav`, `nav-tabs`, `nav-pills`, `nav-link`, `nav-item`                                                                           |
| Breadcrumb     | `breadcrumb`, `breadcrumb-item`                                                                                                  |
| Pagination     | `pagination`, `page-item`, `page-link`                                                                                           |
| Dropdown       | `dropdown`, `dropdown-toggle`, `dropdown-menu`, `dropdown-item`, `dropdown-divider`                                              |
| Accordion      | `accordion`, `accordion-item`, `accordion-header`, `accordion-button`, `accordion-collapse`, `accordion-body`                    |
| Carousel       | `carousel`, `carousel-inner`, `carousel-item`, `carousel-control-{prev                                                           | next}`, `carousel-indicators`, `carousel-caption` |
| Table          | `table {variant?}` (variants: `table-striped`, `table-bordered`, `table-hover`, `table-sm`)                                      |
| List           | `list-group`, `list-group-item`                                                                                                  |
| Close button   | `close-button`                                                                                                                   |
| Icon           | `icon` (often inside `<svg class="icon">`)                                                                                       |
| Tooltip target | element with `data-cx-toggle="tooltip"`                                                                                          |

## Data attributes (behaviors)

Replace **all** `data-bs-*` with `data-cx-*`:

| Behavior                   | Attribute                                        |
| -------------------------- | ------------------------------------------------ | --------------------------- | --------- | ------- | ------- | --- | -------- | -------- |
| Toggle a component         | `data-cx-toggle="modal                           | offcanvas                   | dropdown  | tooltip | popover | tab | collapse | button"` |
| Target selector            | `data-cx-target="#id"`                           |
| Dismiss component          | `data-cx-dismiss="modal                          | alert                       | offcanvas | toast"` |
| Scrollspy                  | `data-cx-spy="scroll"` + `data-cx-target="#nav"` |
| Carousel auto              | `data-cx-ride="carousel"`                        |
| Theme attribute (document) | `data-cx-theme="dark                             | light"` (or brand-specific) |
| Slide-to (carousel)        | `data-cx-slide-to="0"`                           |
| Backdrop                   | `data-cx-backdrop="static                        | true                        | false"`   |
| Keyboard                   | `data-cx-keyboard="true                          | false"`                     |

## Bootstrap → Chassis quick lookup

| Bootstrap pattern                      | Chassis pattern                  |
| -------------------------------------- | -------------------------------- |
| `btn btn-primary btn-lg`               | `button primary large`           |
| `btn btn-outline-secondary btn-sm`     | `button secondary outline small` |
| `btn-link`                             | `button link`                    |
| `card-body` (wrapper)                  | `card-content`                   |
| `card-text`                            | `card-body`                      |
| `badge bg-success` / `text-bg-success` | `badge success`                  |
| `alert alert-danger`                   | `alert danger`                   |
| `display-4`                            | `font-display font-2xlarge`      |
| `lead`                                 | `font-lead`                      |
| `text-muted`                           | `fg-subtle`                      |
| `font-monospace`                       | `font-code`                      |
| `fw-bold`                              | `font-strong`                    |
| `p-3 mb-4`                             | `p-medium mb-large`              |
| `col-md-6`                             | `col-medium-6`                   |
| `d-md-flex`                            | `d-medium-flex`                  |
| `me-2 ms-auto`                         | `me-xsmall ms-auto`              |
| `data-bs-toggle="modal"`               | `data-cx-toggle="modal"`         |

## Anti-patterns (HARD STOPS)

- ❌ `btn-primary-outline-lg` → ✅ `button primary outline large`
- ❌ `text-muted` → ✅ `fg-subtle`
- ❌ `bg-light` → ✅ `bg-main`
- ❌ `p-3` → ✅ `p-medium`
- ❌ `col-md-6` → ✅ `col-medium-6`
- ❌ `data-bs-toggle` → ✅ `data-cx-toggle`
- ❌ `<div class="text-asset">…</div>` (Asset wrapper kept) → ✅ asset text lifted onto its parent semantic element
- ❌ `style="color:#0a84ff"` for a token color → ✅ `class="fg-primary"`
- ❌ Mixing `card-body` (Bootstrap wrapper) with `card-content` (Chassis wrapper) — pick one (Chassis) and translate fully
