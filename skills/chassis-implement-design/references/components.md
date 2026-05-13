# Component Catalog — Figma → Chassis CSS HTML

For each Chassis component family, the canonical Chassis CSS HTML pattern. Use these as the **emit target** when translating a Figma instance to code.

> **Variant translation:** Figma component variants (`size=small`, `context=primary`, `style=outline`, `state=disabled`) become **space-separated modifiers** on the base class (`button primary outline small`).
>
> **Asset translation:** Children whose name ends in `Asset` are **lifted** — their TEXT property becomes the inner content of the parent semantic element. Asset wrappers do not become DOM nodes.

## Buttons

### Solid / smooth / outline

```html
<button class="button primary">Primary</button>
<button class="button secondary">Secondary</button>
<button class="button success large">Save</button>
<button class="button danger small">Delete</button>
<button class="button primary outline">Outline</button>
<button class="button primary smooth">Smooth</button>
<button class="button" disabled>Disabled</button>
```

### Link

```html
<a class="button link primary" href="/learn-more">Learn more</a>
```

### Icon-only

```html
<button class="button primary" aria-label="Settings">
  <svg class="icon" aria-hidden="true"><use href="#icon-settings"></use></svg>
</button>
```

### Button group

```html
<div class="button-group" role="group" aria-label="Actions">
  <button class="button primary">Save</button>
  <button class="button secondary">Cancel</button>
</div>
```

> **Don't mix sizes within a single group.** All children should share the same `small` / default / `large`.

## Forms

### Regular form (label + control stacked)

> **Chassis uses `form-input` and `form-help` classes** instead of `form-control` and `form-text` for input fields.

```html
<form>
  <div class="mb-medium">
    <label for="email" class="form-label">Email</label>
    <input
      type="email"
      id="email"
      class="form-input"
      placeholder="you@example.com"
    />
    <small class="form-help">We'll never share it.</small>
  </div>
</form>
```

### Floating label

```html
<div class="form-floating mb-medium">
  <input
    type="email"
    id="email"
    class="form-input"
    placeholder="you@example.com"
  />
  <label for="email">Email</label>
</div>
```

### Select

```html
<select class="form-select">
  <option selected>Choose…</option>
  <option value="1">One</option>
</select>
```

### Checkbox / radio

```html
<div class="form-check">
  <input type="checkbox" id="agree" class="form-check-input" />
  <label for="agree" class="form-check-label">I agree</label>
</div>
<div class="form-check form-switch">
  <input type="checkbox" id="notify" class="form-check-input" role="switch" />
  <label for="notify" class="form-check-label">Notifications</label>
</div>
```

### Validation

```html
<input class="form-control is-invalid" />
<div class="invalid-feedback">Required.</div>
```

> **Don't mix form styles within a single form.** Pick `regular`, `floating`, **or** `outline` consistently.

## Cards

```html
<div class="card">
  <img class="card-img-top" src="…" alt="" />
  <div class="card-body">
    <h5 class="card-title">Title</h5>
    <h6 class="card-subtitle">Subtitle</h6>
    <p>Card body content.</p>
    <a href="#" class="button primary small">Action</a>
  </div>
  <div class="card-footer fg-subtle">2 days ago</div>
</div>
```

## Tables

```html
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
  </tbody>
</table>
```

> Variants: `striped`, `striped-columns`, `bordered`, `borderless`, `hoverable`. Color contexts on rows/cells: `table-primary`, `table-success`, etc.

`<tr>` and `<td>` Elements can take `active` class.

```
<tbody>
  <tr class="active">
    ...
  </tr>
  <tr>
    <th scope="row">2</th>
    <td>Jacob</td>
    <td class="active">Thornton</td>
    <td>@fat</td>
  </tr>
  <tr>
    ...
  </tr>
</tbody>
```

`<tbody>` and `<tfoot>` elements can take `table-divider` class.

```
<tbody class="table-divider">
  ...
</tbody>
<tfoot class="table-divider">
  ...
</tfoot>
```
## Navigation

### Navbar

```html
<nav class="navbar">
  <div class="container">
    <a class="navbar-brand" href="/">
      <svg class="icon"><use href="#icon-logo"></use></svg>
      <span>Chassis</span>
    </a>
    <button
      class="navbar-toggler"
      data-cx-toggle="collapse"
      data-cx-target="#nav-main"
      aria-controls="nav-main"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="nav-main">
      <ul class="navbar-nav">
        <li class="nav-item"><a class="nav-link active" href="/">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="/docs">Docs</a></li>
      </ul>
    </div>
  </div>
</nav>
```

### Tabs / pills

```html
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item">
    <button
      class="nav-link active"
      data-cx-toggle="tab"
      data-cx-target="#tab-1"
    >
      Tab 1
    </button>
  </li>
  <li class="nav-item">
    <button class="nav-link" data-cx-toggle="tab" data-cx-target="#tab-2">
      Tab 2
    </button>
  </li>
</ul>
```

### Breadcrumb

```html
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a href="/">Home</a></li>
  <li class="breadcrumb-item"><a href="/docs">Docs</a></li>
  <li class="breadcrumb-item active" aria-current="page">CSS</li>
</ol>
```

### Pagination

```html
<ul class="pagination">
  <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
  <li class="page-item active"><a class="page-link" href="#">1</a></li>
  <li class="page-item"><a class="page-link" href="#">2</a></li>
  <li class="page-item"><a class="page-link" href="#">Next</a></li>
</ul>
```

### Dropdown

```html
<div class="dropdown">
  <button
    class="button primary dropdown-toggle"
    data-cx-toggle="dropdown"
    aria-expanded="false"
  >
    Menu
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><hr class="dropdown-divider" /></li>
    <li><a class="dropdown-item" href="#">Other</a></li>
  </ul>
</div>
```

## Surfaces

### Modal

```html
<button class="button primary" data-cx-toggle="modal" data-cx-target="#confirm">
  Open
</button>

<div
  class="modal"
  id="confirm"
  tabindex="-1"
  aria-labelledby="confirm-title"
  aria-hidden="true"
>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="confirm-title">Confirm</h5>
        <button
          class="close-button"
          data-cx-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">Are you sure?</div>
      <div class="modal-footer">
        <button class="button secondary" data-cx-dismiss="modal">Cancel</button>
        <button class="button danger">Delete</button>
      </div>
    </div>
  </div>
</div>
```

### Offcanvas (drawer)

```html
<div
  class="offcanvas offcanvas-end"
  id="filters"
  tabindex="-1"
  aria-labelledby="filters-title"
>
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="filters-title">Filters</h5>
    <button
      class="close-button"
      data-cx-dismiss="offcanvas"
      aria-label="Close"
    ></button>
  </div>
  <div class="offcanvas-body">…</div>
</div>
```

### Tooltip / popover

```html
<button
  class="button primary"
  data-cx-toggle="tooltip"
  data-cx-placement="top"
  title="Hint"
>
  Hover me
</button>

<button
  class="button primary"
  data-cx-toggle="popover"
  data-cx-content="Body text"
  data-cx-title="Title"
>
  Popover
</button>
```

## Feedback

### Alert

```html
<div class="alert success" role="alert">
  Saved successfully.
  <button
    class="close-button"
    data-cx-dismiss="alert"
    aria-label="Close"
  ></button>
</div>
```

### Toast

```html
<div class="toast" role="status" aria-live="polite" aria-atomic="true">
  <div class="toast-header">
    <strong class="me-auto">Notice</strong>
    <button
      class="close-button"
      data-cx-dismiss="toast"
      aria-label="Close"
    ></button>
  </div>
  <div class="toast-body">Your changes were saved.</div>
</div>
```

### Notification

```html
<div class="notification info">New message arrived.</div>
```

### Progress

```html
<div
  class="progress"
  role="progressbar"
  aria-valuenow="60"
  aria-valuemin="0"
  aria-valuemax="100"
>
  <div class="progress-bar primary" style="width: 60%"></div>
</div>
```

> The inline `style="width:60%"` is the canonical way to express progress; this is not a token violation.

### Skeleton / spinner

```html
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-circle"></div>

<div class="spinner-border" role="status" aria-label="Loading"></div>
```

## Communication

### Badge / chip

```html
<span class="badge primary">New</span>
<span class="badge success">Active</span>

<span class="chip primary"
  >Filter <button class="close-button" aria-label="Remove"></button
></span>
```

### Avatar

```html
<span class="avatar">
  <img class="avatar-image" src="/avatar.jpg" alt="Jane Doe" />
</span>
<span class="avatar large">JD</span>
```

### List

```html
<ul class="list-group">
  <li class="list-item active">Item 1</li>
  <li class="list-item">Item 2</li>
  <li class="list-item disabled">Item 3</li>
</ul>
```

## Overlays & containers

### Accordion

Accordions use html `<details>` element.

```html
<div class="accordion">
<details name="example" open>
  <summary>
    <span class="accordion-title">Accordion Item #1</span>
  </summary>
  <div class="accordion-body">
    <p>This is the <b>first item's body</b>, shown by default. It will automatically close when another item is opened by clicking its summary element.</p>
  </div>
</details>
<details name="example">
  <summary>
    <span class="accordion-title">Accordion Item #2</span>
  </summary>
  <div class="accordion-body">
    <p>This is the <b>second item's body</b>. It is hidden by default and will open when its summary element is clicked.</p>
  </div>
</details>
<details name="example">
  <summary>
    <span class="accordion-title">Accordion Item #3</span>
  </summary>
  <div class="accordion-body">
    <p>This is the <b>third item's body</b>. It is hidden by default and will open when its summary element is clicked.</p>
  </div>
</details>
</div>```

### Carousel

```html
<div class="carousel slide" id="hero-carousel" data-cx-ride="carousel">
  <div class="carousel-indicators">
    <button
      data-cx-target="#hero-carousel"
      data-cx-slide-to="0"
      class="active"
      aria-label="Slide 1"
    ></button>
    <button
      data-cx-target="#hero-carousel"
      data-cx-slide-to="1"
      aria-label="Slide 2"
    ></button>
  </div>
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="…" class="d-block w-100" alt="" />
    </div>
    <div class="carousel-item">
      <img src="…" class="d-block w-100" alt="" />
    </div>
  </div>
  <button
    class="carousel-control-prev"
    data-cx-target="#hero-carousel"
    data-cx-slide="prev"
  >
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button
    class="carousel-control-next"
    data-cx-target="#hero-carousel"
    data-cx-slide="next"
  >
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>
```

## Icons

Chassis ships an icon system via `@chassis-ui/icons` (sprite at `/icons/sprite.svg` or per-icon imports). Translation rules:

1. If the Figma layer is a Chassis icon instance (look for `Icon Asset`, `*-icon` child, or component name matching a known icon family), **don't** use the localhost SVG download.
2. Resolve the icon slug from the component name and emit:
   ```html
   <svg class="icon" aria-hidden="true">
     <use href="/icons/sprite.svg#icon-{slug}"></use>
   </svg>
   ```
   Or, for accessible icons:
   ```html
   <svg class="icon danger 2xlarge" role="img" aria-label="Save">
     <use href="/icons/sprite.svg#icon-save"></use>
   </svg>
   ```
   Usage with `<span>` element.
   ```
   <span class="icon icon-info-circle-solid"></span>
   ```
3. Size with utility (`icon icon-large`) or wrapping context. Color via `fg-{role}` on a parent or directly on the svg.
4. If the icon is **not** in `@chassis-ui/icons`, fall back to the localhost SVG and flag in the deliverable summary.

## Composition rules

- **Don't reveal hidden Figma sub-layers** (Back Button, Title Badge, Subtitle Action, Filters row, Aside, Empty states, etc.) unless the source explicitly shows them.
- **Don't mix button sizes within an action group.**
- **Don't mix form styles** (regular vs floating vs outline) within a single form.
- **Don't combine** multiple context modifiers on one component (`button primary success` is invalid — pick one).
- **Always emit semantic HTML** for the role; never reach for `<div role="button">` when `<button>` will do.
