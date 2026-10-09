# Components — Figma family → Chassis CSS markup

The emit target for each Chassis Figma component. Variants become space-separated modifiers (`{root} {color} {style} {size} {state}`); `*Asset` children become the text of the elements shown. Snippets are the canonical structure from the Chassis CSS docs for `@chassis-ui/css` 0.7. The full list of subparts and modifiers per component is in css-classes.md → Components.

## Figma family → CSS

| Figma family                    | Chassis CSS                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button-solid`                  | `button {ctx}`                                                                                                                                                |
| `button-smooth`                 | `button {ctx} smooth`                                                                                                                                         |
| `button-outline`                | `button {ctx} outline`                                                                                                                                        |
| `button-link`                   | `button link` (color via `fg-{ctx}` when needed)                                                                                                              |
| `button-group`                  | `button-group`                                                                                                                                                |
| `floating-button`               | compose: `button primary lg icon-only position-fixed bottom-0 end-0 m-lg rounded-circle shadow-lg`                                                            |
| `close-button`                  | `close-button`                                                                                                                                                |
| `form-regular`                  | `form-field` + `form-label` + `form-input` + `form-help`                                                                                                      |
| `form-floating`                 | `form-floating`                                                                                                                                               |
| `form-outline`                  | no CSS counterpart; use `form-regular` markup and flag                                                                                                        |
| `form-check`                    | `form-check` + `check-input`; `role="switch"` for switches                                                                                                    |
| `dropdown`                      | `menu` opened by `data-cx-toggle="menu"`; selection → `combobox`                                                                                              |
| `date-picker`                   | `form-input` with `data-cx-toggle="datepicker"`                                                                                                               |
| `navbar`, `mobile-nav-top`      | `navbar`                                                                                                                                                      |
| `mobile-nav-bottom`             | compose: `nav nav-segments` in `position-fixed bottom-0 w-100`                                                                                                |
| `breadcrumb`                    | `breadcrumb`                                                                                                                                                  |
| `tab`                           | `nav nav-tabs` / `nav-segments` / `nav-underline` + Tab plugin                                                                                                |
| `pagination`                    | `pagination`                                                                                                                                                  |
| `card`                          | `card`                                                                                                                                                        |
| `section`, `page`               | compose: `<section>` / `<main>` with `container`, spacing, `font-heading`                                                                                     |
| `accordion`                     | `accordion` with `<details>`                                                                                                                                  |
| `modal`                         | `<dialog class="modal dialog">`                                                                                                                               |
| `list`                          | `list` + `list-item`                                                                                                                                          |
| `alert` (inline message)        | `notification {ctx}` — the CSS `alert` is a confirm dialog                                                                                                    |
| `mobile-alert`, confirm dialogs | `<dialog class="alert dialog">`                                                                                                                               |
| `notification` (transient)      | `toast`                                                                                                                                                       |
| `message` (chat bubble)         | compose: `d-flex`, `rounded-xl`, `context`                                                                                                                    |
| `tooltip`                       | `data-cx-toggle="tooltip"`; richer → `popover`                                                                                                                |
| `progress`                      | `progress` + `progress-bar`; loading → `spinner`, placeholders → `skeleton`                                                                                   |
| `table`                         | `table`                                                                                                                                                       |
| `chart`, `story`, `comment`     | compose from primitives and flag as Composed                                                                                                                  |
| `badge`                         | `badge {ctx}`                                                                                                                                                 |
| `chip`                          | `chip {ctx}`                                                                                                                                                  |
| `carousel`                      | `carousel`                                                                                                                                                    |
| avatar (asset)                  | `avatar`                                                                                                                                                      |
| CSS-only, not in Figma          | `drawer`, `stepper`, `nav-overflow`, `collapse`, `input-group`, `input-adorn`, `combobox`, `form-otp`, `chip-input`, `strength`, `toast-container`, scrollspy |

## Buttons

```html
<button type="button" class="button primary">Save</button>
<button type="button" class="button default">Cancel</button>
<button type="button" class="button secondary outline sm">Outline small</button>
<button type="button" class="button danger smooth lg">Smooth large</button>
<a class="button link" href="/learn-more">Learn more</a>
<button type="button" class="button primary" disabled>Disabled</button>

<button type="button" class="button primary icon-only" aria-label="Settings">
  <svg class="icon" aria-hidden="true">
    <use href="/assets/icons/chassis-icons.svg#gear-solid"></use>
  </svg>
</button>

<div class="button-group" role="group" aria-label="Actions">
  <button type="button" class="button default">Left</button>
  <button type="button" class="button default">Right</button>
</div>
```

Colors: `default`, `primary`, `secondary`, `neutral`, `success`, `danger`, `warning`, `info` (and `alternate`, `black`, `white`). Styles: solid (none), `smooth`, `outline`, `link`. Sizes: `sm`, `lg`. A toggle button: `data-cx-toggle="button"` + `aria-pressed`. A checkbox or radio styled as a button: `<input class="button-check">` + `<label class="button default">`. One size per group.

## Forms

```html
<div class="form-field">
  <label class="form-label" for="email">Email address</label>
  <input
    class="form-input"
    type="email"
    id="email"
    placeholder="name@example.com"
    aria-describedby="email-help"
  />
  <div class="form-help" id="email-help">We never share your email.</div>
</div>

<select class="form-input" id="state">
  <option value="">Choose…</option>
  <option value="1">One</option>
</select>
<textarea class="form-input" rows="4"></textarea>
<input class="form-input lg" type="text" />
```

`form-input` styles input, select and textarea alike; sizes `sm` / `lg`; `plaintext` for read-only text. `form-field` is a grid wrapper that stacks label, control and help, and switches to two columns when a `check-input` is a direct child.

```html
<!-- Floating label: label first -->
<div class="form-floating">
  <label for="floating-email">Email address</label>
  <input
    type="email"
    class="form-input"
    id="floating-email"
    placeholder="name@example.com"
  />
</div>

<!-- Checkbox, radio, switch -->
<label class="form-check">
  <input class="check-input" type="checkbox" checked />
  Remember me
</label>
<label class="form-check">
  <input class="check-input" type="radio" name="plan" />
  Monthly
</label>
<label class="form-check">
  <input class="check-input" type="checkbox" role="switch" />
  Notifications
</label>

<!-- Input group and adornments -->
<div class="input-group">
  <span class="input-addon">@</span>
  <input type="text" class="form-input" aria-label="Username" />
</div>
<div class="form-input">
  <span class="input-adorn"
    ><svg class="icon" aria-hidden="true">
      <use href="#search-outline"></use></svg
  ></span>
  <input
    type="text"
    class="ghost-input"
    aria-label="Search"
    placeholder="Search…"
  />
</div>

<!-- Validation -->
<form data-cx-validate novalidate>
  <input type="text" class="form-input" required />
  <div class="invalid-feedback">Required.</div>
  <div class="valid-feedback">Looks good.</div>
</form>
```

Static validation states: `is-valid` / `is-invalid` on the control. Range: `<input type="range" class="form-range">`. One field style per form: regular or floating.

### Selection and special inputs

```html
<!-- Combobox (Figma dropdown with selection) -->
<div
  class="form-input combobox"
  data-cx-toggle="combobox"
  data-cx-name="option"
>
  <input
    type="text"
    class="combobox-value"
    placeholder="Select an item…"
    autocomplete="off"
  />
</div>
<div class="menu" role="listbox">
  <button class="menu-item" type="button" role="option" data-cx-value="1">
    Option one
  </button>
  <button class="menu-item" type="button" role="option" data-cx-value="2">
    Option two
  </button>
</div>

<!-- Datepicker -->
<input
  type="text"
  class="form-input"
  id="date"
  data-cx-toggle="datepicker"
  placeholder="Choose date…"
/>

<!-- One-time code -->
<div class="form-otp" data-cx-otp role="group" aria-label="Verification code">
  <input type="text" class="form-input" aria-label="Digit 1" />
  <input type="text" class="form-input" aria-label="Digit 2" />
</div>

<!-- Chip input -->
<div class="form-input chip-input" data-cx-chips>
  <span class="chip" data-cx-chip-value="JavaScript">JavaScript</span>
  <input type="text" class="ghost-input" placeholder="Add skill…" />
</div>

<!-- Password strength -->
<div class="strength" data-cx-strength>
  <div class="strength-segment"></div>
  <div class="strength-segment"></div>
  <div class="strength-segment"></div>
  <div class="strength-segment"></div>
</div>
```

## Menu (Figma dropdown)

```html
<button
  type="button"
  class="button primary caret"
  data-cx-toggle="menu"
  aria-expanded="false"
>
  Actions
</button>
<div class="menu">
  <h6 class="menu-header">Section</h6>
  <a class="menu-item" href="#">Copy</a>
  <button class="menu-item active" type="button" aria-current="true">
    Paste
  </button>
  <hr class="menu-divider" />
  <button class="menu-item context danger" type="button">Delete</button>
</div>
```

The `.menu` is the next sibling of the toggle. `caret` adds the indicator. Rich items: `menu-item-icon`, `menu-item-content` + `menu-item-description`, `menu-item-check`. Modifiers: `scrollable`, `translucent`, `context {ctx}`.

## Navigation

```html
<nav class="navbar md:navbar-expand bg-even" aria-label="Main navigation">
  <div class="container fluid">
    <a class="navbar-brand" href="/">Chassis</a>
    <button
      class="button icon-only navbar-toggler"
      type="button"
      data-cx-toggle="drawer"
      data-cx-target="#nav-drawer"
      aria-controls="nav-drawer"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <svg class="icon navbar-toggler-icon" aria-hidden="true">
        <use href="#bars-outline"></use>
      </svg>
    </button>
    <dialog
      class="drawer drawer-end"
      id="nav-drawer"
      aria-labelledby="nav-drawer-title"
      tabindex="-1"
    >
      <div class="drawer-header">
        <h2 class="drawer-title" id="nav-drawer-title">Menu</h2>
        <button
          type="button"
          class="close-button"
          data-cx-dismiss="drawer"
          aria-label="Close"
        ></button>
      </div>
      <div class="drawer-body">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="/">Home</a>
          </li>
          <li class="nav-item"><a class="nav-link" href="/docs">Docs</a></li>
        </ul>
      </div>
    </dialog>
  </div>
</nav>
```

Below the `{bp}:navbar-expand` breakpoint the links live in the drawer; above it they flow inline and the toggler hides. Colored: `navbar context primary solid`.

```html
<!-- Tabs -->
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item" role="presentation">
    <button
      class="nav-link active"
      id="tab-1"
      data-cx-toggle="tab"
      data-cx-target="#pane-1"
      type="button"
      role="tab"
      aria-controls="pane-1"
      aria-selected="true"
    >
      Home
    </button>
  </li>
  <li class="nav-item" role="presentation">
    <button
      class="nav-link"
      id="tab-2"
      data-cx-toggle="tab"
      data-cx-target="#pane-2"
      type="button"
      role="tab"
      aria-controls="pane-2"
      aria-selected="false"
    >
      Profile
    </button>
  </li>
</ul>
<div class="tab-content">
  <div
    class="tab-pane fade show active"
    id="pane-1"
    role="tabpanel"
    aria-labelledby="tab-1"
    tabindex="0"
  >
    …
  </div>
  <div
    class="tab-pane fade"
    id="pane-2"
    role="tabpanel"
    aria-labelledby="tab-2"
    tabindex="0"
  >
    …
  </div>
</div>
```

Nav styles: plain `nav`, `nav-tabs`, `nav-segments` (Figma segment control), `nav-underline`; `flex-column` for vertical; sizes `sm` / `lg`; `nav-fill`, `nav-justified`. Overflowing navs: wrap in `<div class="nav-overflow" data-cx-toggle="nav-overflow">`.

```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="/">Home</a></li>
    <li class="breadcrumb-item" aria-current="page">Library</li>
  </ol>
</nav>

<nav aria-label="Pagination">
  <ul class="pagination">
    <li>
      <a class="pagination-link" href="#" aria-label="Previous"
        ><svg class="icon directional-icon" aria-hidden="true">
          <use href="#chevron-left-solid"></use></svg
      ></a>
    </li>
    <li class="active" aria-current="page">
      <a class="pagination-link" href="#">1</a>
    </li>
    <li><a class="pagination-link" href="#">2</a></li>
    <li class="disabled">
      <a class="pagination-link" aria-disabled="true">Next</a>
    </li>
  </ul>
</nav>

<ol class="stepper horizontal">
  <li class="stepper-item">Account</li>
  <li class="stepper-item active" aria-current="step">Profile</li>
  <li class="stepper-item">Review</li>
</ol>
```

Pagination modifiers: `bordered`, `grouped`, `sm`, `lg`. Stepper: vertical by default; `horizontal`, or `md:horizontal` inside a `contains-inline` ancestor; `stepper-item context success` for completed steps.

## Card

```html
<div class="card">
  <img class="card-image-top" src="…" alt="" />
  <div class="card-header">Featured</div>
  <div class="card-body">
    <h3 class="card-title">Card title</h3>
    <p class="card-subtitle">Card subtitle</p>
    <p>Supporting text.</p>
    <a href="#" class="card-link">Card link</a>
    <a href="#" class="button primary me-auto">Go somewhere</a>
  </div>
  <div class="card-footer fg-subtle">2 days ago</div>
</div>
```

`card-body` is the padded content region and is a flex column: a button inside it stretches unless it gets `me-auto`. Images: `card-image-top`, `card-image-bottom`, `card-image-start`, `card-image-end`, `card-overlay`. Sizes `sm` / `lg`; color `card context {ctx}`; `card-group` for equal-height rows; `card-header-tabs` / `card-header-segments` for a nav in the header. There is no `card-content` and no `card-text`.

## Dialogs: modal, alert, drawer

```html
<button
  type="button"
  class="button primary"
  data-cx-toggle="dialog"
  data-cx-target="#confirm"
>
  Open
</button>

<dialog class="modal dialog" id="confirm" aria-labelledby="confirm-title">
  <div class="modal-header">
    <h2 class="modal-title" id="confirm-title">Modal title</h2>
    <button
      type="button"
      class="close-button"
      data-cx-dismiss="dialog"
      aria-label="Close"
    ></button>
  </div>
  <div class="modal-body"><p>Modal content.</p></div>
  <div class="modal-footer">
    <button type="button" class="button primary">Take action</button>
    <button type="button" class="button default" data-cx-dismiss="dialog">
      Close
    </button>
  </div>
</dialog>
```

The three regions are direct children of the `<dialog>`; there is no `modal-dialog` or `modal-content`. Sizes `sm` `md` `lg` `xl`, `fullscreen` (and `max-md:fullscreen`), `scrollable`. A link trigger uses `href="#confirm"` instead of `data-cx-target`. Static backdrop: `data-cx-backdrop="static"`, no Escape: `data-cx-keyboard="false"`.

```html
<!-- Alert: a decision-forcing dialog, not an inline message -->
<dialog
  class="alert dialog"
  id="delete"
  role="alertdialog"
  aria-labelledby="delete-title"
  aria-describedby="delete-body"
  data-cx-backdrop="static"
  data-cx-keyboard="false"
>
  <svg class="icon icon-danger alert-icon" aria-hidden="true">
    <use href="#exclamation-triangle-solid"></use>
  </svg>
  <div class="alert-body">
    <h2 class="alert-title" id="delete-title">Delete file?</h2>
    <p id="delete-body">This action cannot be undone.</p>
  </div>
  <div class="alert-footer">
    <button type="button" class="button danger">Delete</button>
    <button type="button" class="button default" data-cx-dismiss="dialog">
      Cancel
    </button>
  </div>
</dialog>

<!-- Drawer (side panel); placement class required -->
<dialog class="drawer drawer-end" id="filters" aria-labelledby="filters-title">
  <div class="drawer-header">
    <h2 class="drawer-title" id="filters-title">Filters</h2>
    <button
      type="button"
      class="close-button"
      data-cx-dismiss="drawer"
      aria-label="Close"
    ></button>
  </div>
  <div class="drawer-body">…</div>
  <div class="drawer-footer">
    <button type="button" class="button primary">Apply</button>
  </div>
</dialog>
<button
  type="button"
  class="button default"
  data-cx-toggle="drawer"
  data-cx-target="#filters"
>
  Filters
</button>
```

Drawer placements: `drawer-start`, `drawer-end`, `drawer-top`, `drawer-bottom`; `sheet` for a bottom sheet, `drawer-fit-content`, `translucent`.

## Accordion and collapse

```html
<div class="accordion" data-cx-accordion>
  <details name="faq" open>
    <summary><span class="accordion-title">Item one</span></summary>
    <div class="accordion-body"><p>Shown by default.</p></div>
  </details>
  <details name="faq">
    <summary><h3 class="accordion-title">Item two</h3></summary>
    <div class="accordion-body"><p>Hidden by default.</p></div>
  </details>
</div>

<button
  class="button primary"
  type="button"
  data-cx-toggle="collapse"
  data-cx-target="#more"
  aria-expanded="false"
  aria-controls="more"
>
  More
</button>
<div class="collapse" id="more"><div class="card card-body">…</div></div>
```

Accordion modifiers: `flush`, `caret-end`, `sm` / `lg`, `context {ctx} [solid|smooth|outline]`. Same `name` groups items so one is open at a time.

## List

```html
<ul class="list">
  <li class="list-item active" aria-current="true">An active item</li>
  <li class="list-item">A second item</li>
  <li class="list-item disabled" aria-disabled="true">A disabled item</li>
</ul>

<div class="list">
  <a href="#" class="list-item list-action">Link item</a>
  <button type="button" class="list-item list-action">Button item</button>
</div>
```

Modifiers on the list: `flush`, `horizontal`, `numbered` (with `<ol>`), `outline`, `plain`. `list-item context {ctx}` colors one item. There is no `list-group`.

## Table

```html
<div class="table-responsive">
  <table class="table striped hoverable">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Status</th>
        <th scope="col" class="text-end">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Alpha</th>
        <td><span class="badge success">Active</span></td>
        <td class="text-end">$120</td>
      </tr>
      <tr class="active">
        <th scope="row">Beta</th>
        <td>…</td>
        <td class="text-end">$80</td>
      </tr>
    </tbody>
  </table>
</div>
```

Modifiers: `striped`, `striped-columns`, `bordered`, `borderless`, `hoverable`, `sticky-header`, `sticky-column`, `caption-top`, `align-middle`, `context {ctx}`. `active` on a row or cell; `table-divider` on a `<tbody>` or `<tfoot>`.

## Feedback

```html
<!-- Inline message (Figma "alert") -->
<div class="notification success fade show" role="status">
  <svg class="icon notification-icon" aria-hidden="true">
    <use href="#check-circle-solid"></use>
  </svg>
  <p>Saved successfully.</p>
  <button
    type="button"
    class="close-button"
    data-cx-dismiss="notification"
    aria-label="Close"
  ></button>
</div>
<div class="notification danger solid" role="alert">
  <p>The upload failed.</p>
</div>

<!-- Transient toast (Figma "notification") -->
<div class="toast-container position-fixed bottom-0 end-0 p-md">
  <div class="toast" role="status">
    <div class="toast-header">
      <strong class="me-auto">Chassis</strong>
      <small>11 mins ago</small>
      <button
        type="button"
        class="close-button"
        data-cx-dismiss="toast"
        aria-label="Close"
      ></button>
    </div>
    <div class="toast-body">Your changes were saved.</div>
  </div>
</div>

<!-- Tooltip and popover -->
<button
  type="button"
  class="button default"
  data-cx-toggle="tooltip"
  data-cx-placement="top"
  title="Tooltip text"
>
  Hover me
</button>
<button
  type="button"
  class="button default"
  data-cx-toggle="popover"
  data-cx-title="Popover title"
  data-cx-content="Body content."
>
  Popover
</button>

<!-- Progress, spinner, skeleton -->
<div
  class="progress"
  role="progressbar"
  aria-label="Upload"
  aria-valuenow="60"
  aria-valuemin="0"
  aria-valuemax="100"
>
  <div class="progress-bar" style="width: 60%"></div>
</div>
<div class="spinner spinner-primary" role="status">
  <span class="visually-hidden">Loading…</span>
</div>
<p aria-hidden="true"><span class="skeleton w-6/12"></span></p>
```

Notification takes `notification-title` for a heading. The `progress-bar` width is the one sanctioned inline style; colored bars use `bg-{ctx}`, `striped`, `animated`. Spinners: `spinner-{size}`, `spinner-{ctx}`, `spinner-grow` / `spinner-border`. Skeletons size with width and font utilities; `skeleton-glow` / `skeleton-wave` animate.

## Badge, chip, avatar

```html
<span class="badge primary">New</span>
<span class="badge success circle">24</span>
<span class="badge neutral smooth sm">Draft</span>

<span class="chip primary"
  >Filter
  <button
    type="button"
    class="close-button"
    data-cx-dismiss="chip"
    aria-label="Remove"
  ></button
></span>
<button
  type="button"
  class="chip default"
  data-cx-toggle="chip"
  aria-pressed="false"
>
  Toggle
</button>

<span class="avatar">CX</span>
<span class="avatar lg"
  ><img class="avatar-image" src="/avatar.jpg" alt="Jane Doe"
/></span>
<div class="avatar-stack">
  <span class="avatar"><img class="avatar-image" src="…" alt="…" /></span>
  <span class="avatar">+5</span>
</div>
```

Badge styles: solid (none), `smooth`, `outline`; `circle`; `sm` / `lg`; `badge-adaptive` inside buttons. Chip: `smooth`, `outline`, `active`, `sm` / `lg`. Avatar sizes `2xs` … `2xl`, `smooth {ctx}`.

## Carousel

```html
<div id="hero" class="carousel">
  <div class="d-flex justify-content-between align-items-center">
    <div>
      <button
        class="button sm icon-only"
        type="button"
        data-cx-target="#hero"
        data-cx-slide="prev"
      >
        <svg class="icon directional-icon" aria-hidden="true">
          <use href="#chevron-left-solid"></use></svg
        ><span class="visually-hidden">Previous</span>
      </button>
      <button
        class="button sm icon-only"
        type="button"
        data-cx-target="#hero"
        data-cx-slide="next"
      >
        <svg class="icon directional-icon" aria-hidden="true">
          <use href="#chevron-right-solid"></use></svg
        ><span class="visually-hidden">Next</span>
      </button>
    </div>
    <ol class="carousel-indicators">
      <li>
        <button
          type="button"
          data-cx-target="#hero"
          data-cx-slide-to="0"
          class="active"
          aria-current="true"
          aria-label="Slide 1"
        ></button>
      </li>
      <li>
        <button
          type="button"
          data-cx-target="#hero"
          data-cx-slide-to="1"
          aria-label="Slide 2"
        ></button>
      </li>
    </ol>
  </div>
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="…" class="d-block w-100" alt="…" />
    </div>
    <div class="carousel-item">
      <img src="…" class="d-block w-100" alt="…" />
    </div>
  </div>
</div>
```

Controls are ordinary buttons with `data-cx-slide`; `carousel-fade`, `carousel-auto` + `data-cx-autoplay`, `carousel-control-play-pause`. There are no `carousel-control-prev/next` classes.

## Icons

Chassis Icons (`@chassis-ui/icons`) ship an SVG sprite, an icon font and single SVGs; names are `{name}-{style}` with `outline` or `solid`. Chassis CSS styles any of them through `.icon`:

```html
<svg class="icon icon-lg icon-primary" aria-hidden="true">
  <use href="/assets/icons/chassis-icons.svg#home-solid"></use>
</svg>
<i class="icon cx-home-solid" aria-hidden="true"></i>
<svg class="icon" role="img" aria-label="Save">
  <use href="/assets/icons/chassis-icons.svg#save-outline"></use>
</svg>
```

Size: `icon-{size}` (`3xs` … `4xl`) or `icon-adaptive`; color: `icon-{ctx}`, `icon-main` / `icon-subtle` / `icon-slight`, `{ctx}-icon-main`; both cascade from an ancestor. Icons that mirror in RTL take `directional-icon`. A Figma `Icon Asset` names the glyph; resolve it to a Chassis Icons name, and fall back to the downloaded SVG only for icons outside the set.

## Composition rules

- One color per root; one size per `button-group`; one field style per form.
- Hidden Figma sub-layers (Back Button, Title Badge, Filters row, Empty state) are omitted, not hidden.
- Figma components with no CSS counterpart are composed from primitives and reported as Composed.
- `<button type="button">` for actions, `<a href>` for navigation, `<dialog>` for overlays.
