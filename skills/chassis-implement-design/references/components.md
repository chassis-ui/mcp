# Components — Figma component → Chassis CSS markup

The emit target for each component of the Chassis UI Figma library (`cx.components.UI`). An instance is named after its component set (`Solid Button`, `Regular Form Field`) unless the designer renamed the layer; [patterns.md](./patterns.md#reading-the-figma-output) says how to tell the component then. Variants become space-separated modifiers (`{root} {color} {style} {size} {state}`); the text of the `<Role> Asset` children and of the plain text layers becomes the text of the elements shown. Snippets are the canonical structure from the Chassis CSS docs for `@chassis-ui/css` 0.7. The full list of subparts and modifiers per component is in css-classes.md → Components.

## Figma component → CSS

| Figma component                                                                 | Chassis CSS                                                                                                                                     |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Solid Button`, `Solid Icon-Button`                                             | `button {ctx}`; an Icon-Button adds `icon-only`                                                                                                 |
| `Smooth Button`, `Smooth Icon-Button`                                           | `button {ctx} smooth`                                                                                                                           |
| `Outline Button`, `Outline Icon-Button`                                         | `button {ctx} outline`                                                                                                                          |
| `Link Button`, `Link Icon-Button`                                               | `button link` (color via `fg-{ctx}` when needed)                                                                                                |
| `Button Group`, `Button Group Item`, `Icon-Button Group Item`                   | `button-group`                                                                                                                                  |
| `Basic Common Toggle`, `Icon-Only Common Toggle`                                | `button` with `data-cx-toggle="button"` and `aria-pressed`                                                                                      |
| `Floating Button`, `Floating Icon-Button`                                       | compose: `button primary lg icon-only position-fixed bottom-0 end-0 m-lg rounded-circle shadow-lg`                                              |
| `Close Button`                                                                  | `close-button`                                                                                                                                  |
| `Regular Form Field` (`Form Label`, `Regular Form Input`, `Form Help`)          | `form-field` + `form-label` + `form-input` + `form-help`                                                                                        |
| `Floating Form Field`, `Floating Form Input`                                    | `form-floating`                                                                                                                                 |
| `Outline Form Field`, `Outline Form Input`                                      | no CSS counterpart; use the markup of the regular field and flag                                                                                |
| `Form Check`, `Check Input`                                                     | `form-check` + `check-input`, a checkbox or a radio by `type`                                                                                   |
| `Basic Switch`, `Material Switch`, `Cupertino Switch`                           | `form-check` + `check-input` with `role="switch"`                                                                                               |
| `Dropdown Menu`, `Dropdown Item`, `Dropdown Button`                             | `menu` opened by `data-cx-toggle="menu"`; a `Dropdown Menu` with `type=searchable` → `combobox`                                                 |
| `Date Picker`                                                                   | `form-input` with `data-cx-toggle="datepicker"`                                                                                                 |
| `Navbar`, `Nav Link`, `Mobile Top Navigation`                                   | `navbar`                                                                                                                                        |
| `Mobile Bottom Navigation`                                                      | compose: `nav nav-segments` in `position-fixed bottom-0 w-100`                                                                                  |
| `Large Breadcrumb`, `Small Breadcrumb`                                          | `breadcrumb`                                                                                                                                    |
| `Nav Tabs` (`Regular Nav Tab Item`, `Fancy Nav Tab Item`)                       | `nav nav-tabs` / `nav-underline` + Tab plugin                                                                                                   |
| `Nav Segments`, `Nav Segment Item`                                              | `nav nav-segments` + Tab plugin                                                                                                                 |
| The pagination sets (`Simple Pagination`, `Advanced Pagination`, …)             | `pagination`                                                                                                                                    |
| The Progress Flows (`Large Chip Progress Flow`, `Small Thumb Progress Flow`, …) | `stepper` + `stepper-item`                                                                                                                      |
| `Full-bleed Card`, `Contained Card`                                             | `card`                                                                                                                                          |
| `Section Block`, `Section Header`, `Section Footer`, `Page Title`               | compose: `<section>` / `<main>` with `container`, spacing and the text style of the heading                                                     |
| `Accordion`, `Accordion Item`                                                   | `accordion` with `<details>`                                                                                                                    |
| `Modal Window`, `Modal Screen`                                                  | `<dialog class="modal dialog">`                                                                                                                 |
| The sets of the page "List" (`Common List Item`, `List Header`, …)              | `list` + `list-item`                                                                                                                            |
| `Alert Window`, `Alert Screen` and their `Mobile` forms                         | `<dialog class="alert dialog">`: a confirm dialog with buttons, not an inline message                                                           |
| `Notification`, `Rich Notification`                                             | `notification {ctx}`, the inline message; `style=solid` → `solid`                                                                               |
| `Chat Message`                                                                  | compose: `d-flex`, `rounded-xl`, `context`                                                                                                      |
| `Tooltip`                                                                       | `data-cx-toggle="tooltip"`; with a title or slot content → `popover`                                                                            |
| The progress bars and indicators (`Progress Bar - 10 Segments`, …)              | `progress` + `progress-bar`; the spinner sets → `spinner`; `Text Skeleton Asset`, `Shape Skeleton Asset` → `skeleton`                           |
| `Data Table`, `Table Row` and the `Table … Cell`s                               | `table`                                                                                                                                         |
| The sets of the pages "Chart", "Story" and "Comment"                            | compose from primitives and flag as Composed                                                                                                    |
| `Solid Badge`, `Smooth Badge`, `Outline Badge`                                  | `badge {ctx}`, with `smooth` or `outline`                                                                                                       |
| `Solid Chip`, `Smooth Chip`, `Outline Chip`                                     | `chip {ctx}`, with `smooth` or `outline`                                                                                                        |
| `Card Carousel`, `Small Carousel`, `Hero Carousel`                              | `carousel`                                                                                                                                      |
| `Common Avatar` (an asset)                                                      | `avatar`                                                                                                                                        |
| CSS-only, no Figma component                                                    | `toast`, `toast-container`, `drawer`, `nav-overflow`, `collapse`, `input-group`, `input-adorn`, `form-otp`, `chip-input`, `strength`, scrollspy |

A component the table does not name has no CSS counterpart: compose it from primitives and report it as Composed.

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

Static validation states: `is-valid` / `is-invalid` on the control. Range: `<input type="range" class="form-range">`. One field style per form: regular or floating. The help icon of a `Form Check` or a `Form Help` (`help` on, "Help Icon") has no part in the stylesheet: compose it beside the label (`d-flex align-items-start gap-sm` and the icon) and flag it.

### Selection and special inputs

```html
<!-- Combobox (Figma Dropdown Menu, type=searchable) -->
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

## Menu (Figma Dropdown Menu)

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

Below the `{bp}:navbar-expand` breakpoint the links live in the drawer; above it they flow inline and the toggler hides. Emit the toggler and the drawer even when the design has only a desktop frame, since the markup serves every width; the breakpoint is the narrowest frame of the design that shows the links inline, `sm:`, `md:`, `lg:` or `xl:`, and `md:` when there is one desktop frame. Colored: `navbar context primary solid`.

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

Nav styles: plain `nav`, `nav-tabs`, `nav-segments` (Figma `Nav Segments`), `nav-underline`; `flex-column` for vertical; sizes `sm` / `lg`; `nav-fill`, `nav-justified`. Overflowing navs: wrap in `<div class="nav-overflow" data-cx-toggle="nav-overflow">`.

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
<!-- Alert (Figma Alert Window): a decision-forcing dialog, not an inline message -->
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
<!-- Inline message (Figma Notification) -->
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

<!-- Transient toast (no Figma component) -->
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

Chassis Icons (`@chassis-ui/icons`) ship an SVG sprite, an icon font and single SVGs; names are `{name}-{style}` with `outline`, `solid` or, for a logo, `brand`. Chassis CSS styles any of them through `.icon`:

```html
<svg class="icon icon-lg icon-primary" aria-hidden="true">
  <use href="/assets/icons/chassis-icons.svg#home-solid"></use>
</svg>
<i class="icon cx-home-solid" aria-hidden="true"></i>
<svg class="icon" role="img" aria-label="Save">
  <use href="/assets/icons/chassis-icons.svg#save-outline"></use>
</svg>
```

Size: `icon-{size}` (`3xs` … `4xl`) or `icon-adaptive`; color: `icon-{ctx}`, `icon-main` / `icon-subtle` / `icon-slight`, `{ctx}-icon-main`; both cascade from an ancestor. Icons that mirror in RTL take `directional-icon`. In Figma an icon is an instance of a glyph component of the library, named in the same form (`pen-solid`, `chevron-down-solid`). The layer carries that name unless the component names it by its role ("Icon", "Icon Start", "Icon End", "Input Icon", "Help Icon"); then the glyph is the one the screenshot shows. `Placeholder Icon` is a placeholder, not a glyph: ask which icon is meant. A logo (`chassis-logo` and the components of the page "Logo", a wordmark) is not a glyph of the sprite: it is an image, downloaded as the response says. The size and the fill of a glyph are not in the code block: their variables are in `get_variable_defs`. Resolve the glyph to a Chassis Icons name, and fall back to the downloaded SVG only for icons outside the set. The names are the `id`s of the symbols of `chassis-icons.svg` in `@chassis-ui/icons` (`node_modules/@chassis-ui/icons/icons/chassis-icons.svg`, or `packages/icons/icons/` of a `chassis-icons` checkout next to the project): check a glyph matched by eye against them, since a role name cannot be checked otherwise. The glyph variables of Figma go to `6xlarge`; `icon-{size}` ends at `4xl`.

## Composition rules

- One color per root; one size per `button-group`; one field style per form.
- Hidden Figma layers (the back button of a modal header, the chip of a page title, a part a boolean turned off or the designer hid) are omitted, not hidden.
- Figma components with no CSS counterpart are composed from primitives and reported as Composed.
- `<button type="button">` for actions, `<a href>` for navigation, `<dialog>` for overlays.
