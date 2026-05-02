# Chassis CSS Class Catalog

Complete class reference for translating Chassis Figma views into Chassis CSS code. Source of truth: `@chassis-ui/css`.

> **Golden rule:** Chassis CSS uses **space-separated modifiers** on a single base class, **semantic spacing/breakpoint names**, and **`fg-*`/`bg-*`** color families. The Figma MCP outputs React + Tailwind — **every class name it produces must be discarded and replaced**. If you find yourself emitting `className`, `text-blue-500`, `p-4`, `gap-3`, `rounded-lg`, or `md:flex`, stop — that's Tailwind. Bootstrap-style classes (`btn-primary`, `text-muted`, `col-md-6`) are equally invalid.

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

| Tailwind                       | Bootstrap   | Chassis        |
| ------------------------------ | ----------- | -------------- |
| `font-light`                   | `fw-light`  | `font-elegant` |
| `font-normal`                  | `fw-normal` | `font-normal`  |
| `font-semibold`, `font-bold`   | `fw-bold`   | `font-strong`  |
| `font-extrabold`, `font-black` | `fw-bolder` | `font-mass`    |

### Alignment / transform

`text-start`, `text-center`, `text-end`, `text-uppercase`, `text-lowercase`, `text-capitalize`, `text-wrap`, `text-nowrap`, `text-truncate`.

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

## Spacing

### Scale (semantic)

`zero`, `4xsmall`, `3xsmall`, `2xsmall`, `xsmall`, `small`, `medium`, `large`, `xlarge`, `2xlarge`, `3xlarge`, `4xlarge`, `5xlarge`, `6xlarge`.

### Properties

- Padding: `p-{size}`, `pt-`, `pe-`, `pb-`, `ps-`, `px-`, `py-`
- Margin: `m-{size}`, `mt-`, `me-`, `mb-`, `ms-`, `mx-`, `my-` (auto allowed: `mx-auto`, `ms-auto`, `me-auto`)
- Gap (in flex/grid): `gap-{size}`, `row-gap-{size}`, `column-gap-{size}`

> Always pick the **named scale step that matches the bound Figma `space/context/{ctx}` token**. Never guess a step from a numeric value (Tailwind's `p-4` or Bootstrap's `p-3`). The token is the only source of truth.

## Layout & Flex

### Containers / grid

- `container`, `container fluid`, `container {breakpoint}`
- `row`, `col`, `col-{n}`, `{breakpoint}:col-{n}`
- `g-{size}`, `gx-{size}`, `gy-{size}` (grid gutters)

### Flex / display utilities

`d-flex`, `d-inline-flex`, `d-grid`, `d-block`, `d-inline-block`, `d-inline`, `d-none`, plus responsive variants `{breakpoint}:d--{value}`.

`flex-row`, `flex-row-reverse`, `flex-column`, `flex-column-reverse`, `flex-wrap`, `flex-nowrap`, `flex-fill`, `flex-grow-{0|1}`, `flex-shrink-{0|1}`.

`justify-content-start | center | end | between | around | evenly`.
`align-items-start | center | end | baseline | stretch`.
`align-self-*`, `align-content-*`.

### Position / sizing

`position-{static|relative|absolute|fixed|sticky}`, `top-0` … `top-100`, `start-0` … `start-100`, `end-0`, `bottom-0`, `translate-middle{-x|-y}`.

`w-25`, `w-50`, `w-75`, `w-100`, `w-auto`, `mw-100`, `vw-100`, `min-vw-100`.

### Borders & radius

- Border presence: `border`, `border-top`, `border-end`, `border-bottom`, `border-start`, `border-0`
- Border color: `border-{role}` (`border-primary`, `border-success`, …) · default-context emphases: `border-main`, `border-subtle`
- Border width (semantic): `border-{size}` (where size is a semantic token from the borderWidth family)
- Radius: `rounded`, `rounded-{ctx}` (semantic, where `ctx` includes `round` for pills/avatars), `rounded-{side}`

> ⚠️ **`border` / `border-{side}` alone resolves to `border-main`** (the default context border color) — not the browser reset. If the design uses `border-main`, no color class is needed. If the design uses any other border color, add a color class explicitly: `border-top border-subtle`, `border border-primary`, etc. Omitting the color class when the design isn't `border-main` is a translation error.

## Breakpoints

| Tailwind prefix | Bootstrap | Chassis   | ≥      |
| --------------- | --------- | --------- | ------ |
| `sm:`           | `sm`      | `small`   | 576px  |
| `md:`           | `md`      | `medium`  | 768px  |
| `lg:`           | `lg`      | `large`   | 992px  |
| `xl:`           | `xl`      | `xlarge`  | 1200px |
| `2xl:`          | `xxl`     | `2xlarge` | 1400px |

Apply to: `{bp}:col-*`, `{bp}:d-*`, `{bp}:flex-*`, `{bp}:text-*`, spacing `{bp}:m{side}-{size}` etc.

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

Chassis behavior attributes use the `data-cx-*` namespace:

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

## Legacy: Bootstrap → Chassis class migration

> This section is for **porting existing Bootstrap code** to Chassis, not for Figma translation. When translating from Figma, use the Tailwind → Chassis table above and `get_variable_defs`.

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

## Tailwind → Chassis quick lookup

The Figma MCP code block uses Tailwind utilities and JSX. Discard all of it — use only `get_variable_defs` for style decisions. Common replacements:

| Tailwind / JSX (MCP output)                                       | Chassis CSS                                                                   | Rule                              |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| `className="…"`                                                   | `class="…"`                                                                   | JSX → HTML                        |
| `text-{color}-{n}` (e.g. `text-blue-500`)                         | `fg-{emphasis}` or `{ctx}-fg-{emphasis}`                                   | Always from `get_variable_defs` — never guess from the color name |
| `bg-{color}-{n}` (e.g. `bg-gray-100`)                             | `bg-main`, `{ctx}-bg-{emphasis}`                                              | Resolve via `get_variable_defs`   |
| `text-sm` / `text-base` / `text-lg` / `text-xl` / `text-2xl`     | `font-small` / `font-medium` / `font-large` / `font-xlarge` / `font-2xlarge` | Confirm via token                 |
| `font-bold`, `font-semibold`                                      | `font-strong`                                                                 |                                   |
| `font-light`                                                      | `font-elegant`                                                                |                                   |
| `p-{n}` / `px-{n}` / `py-{n}` / `pt-{n}` etc.                   | `p-{step}` / `px-{step}` / `py-{step}` / `pt-{step}` etc.                    | Semantic step from token          |
| `m-{n}` / `mt-{n}` / `mx-{n}` etc.                               | `m-{step}` / `mt-{step}` / `mx-{step}` etc.                                  | Semantic step from token          |
| `gap-{n}` / `gap-x-{n}` / `gap-y-{n}`                            | `gap-{step}` / `column-gap-{step}` / `row-gap-{step}`                        | Semantic step from token          |
| `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`           | `rounded-{ctx}`                                                               | Token from `get_variable_defs`    |
| `rounded-full`                                                    | `rounded-round`                                                               |                                   |
| `flex`                                                            | `d-flex`                                                                      |                                   |
| `flex flex-col`                                                   | `d-flex flex-column`                                                          |                                   |
| `grid`                                                            | `d-grid`                                                                      |                                   |
| `hidden`                                                          | `d-none`                                                                      |                                   |
| `block`                                                           | `d-block`                                                                     |                                   |
| `inline-flex`                                                     | `d-inline-flex`                                                               |                                   |
| `items-center` / `items-start` / `items-end`                      | `align-items-center` / `align-items-start` / `align-items-end`                |                                   |
| `justify-center` / `justify-between` / `justify-start`            | `justify-content-center` / `justify-content-between` / `justify-content-start` |                                  |
| `w-full`                                                          | `w-100`                                                                       |                                   |
| `sm:` / `md:` / `lg:` / `xl:` / `2xl:` (prefix)                  | `small:` / `medium:` / `large:` / `xlarge:` / `2xlarge:`                     | Full names — never abbreviated    |
| `p-[14px]`, `text-[#hex]`, `bg-[rgba(…)]`                        | 🚩 raise to user                                                              | Arbitrary values = detached token |

## Anti-patterns (HARD STOPS)

**Tailwind / MCP output leakage (primary concern — what `get_design_context` emits):**

- ❌ `className="text-blue-500"` → ✅ `class="fg-primary"` (from `get_variable_defs`)
- ❌ `className="bg-gray-100"` → ✅ `class="bg-main"` (from `get_variable_defs`)
- ❌ `p-4`, `gap-3`, `m-2` (numeric Tailwind spacing) → ✅ `p-large`, `gap-medium`, `m-xsmall` (semantic step from token)
- ❌ `rounded-lg` → ✅ `rounded-{ctx}` (token from `get_variable_defs` — never guess the step from Tailwind's size name)
- ❌ `font-bold` → ✅ `font-strong`
- ❌ `md:flex`, `lg:col-6` (abbreviated breakpoints) → ✅ `medium:d-flex`, `large:col-6`
- ❌ `p-[14px]`, `bg-[#0a84ff]` (arbitrary Tailwind values) → 🚩 raise to user, do not emit inline CSS

**Also invalid (Bootstrap-style):**

- ❌ `btn-primary-outline-lg` → ✅ `button primary outline large`
- ❌ `text-muted` → ✅ `fg-subtle`
- ❌ `bg-light` → ✅ `bg-main`
- ❌ `p-3` (numeric) → ✅ `p-medium`
- ❌ `col-md-6` → ✅ `col-medium-6`
- ❌ `data-bs-toggle` → ✅ `data-cx-toggle`

**Always invalid (regardless of origin):**

- ❌ `<div class="text-asset">…</div>` (Asset wrapper kept) → ✅ asset text lifted onto its parent semantic element
- ❌ `style="color:#0a84ff"` for a token color → ✅ `class="fg-primary"`
- ❌ `card-body` as the outer content wrapper → ✅ `card-content` (in Chassis, `card-body` is the `<p>` inside `card-content`)
