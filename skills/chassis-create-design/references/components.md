# Chassis Component Catalog

37 documented component families. Group by domain. Always import via `componentKey` (not name) and override text via the [Asset pattern](./patterns.md#asset-override-pattern).

For per-component variants, props, and specs, see the live docs at https://chassis-ui.com/figma/docs/components/{slug}.

## Discovery Workflow

When you need a component:

1. Identify the domain (button, form, surface, feedback, etc.)
2. Identify the type (e.g., for "primary action" → button-solid; for "subtle action" → button-smooth)
3. Use `search_design_system` with the family name (e.g., `"button-smooth"`, `"card"`, `"navbar"`)
4. Confirm `componentKey` matches before importing
5. Read the variants table below for available `size`, `context`, `state`, `has-*` props

## Component Inventory

### Actions & Triggers

| Slug              | Purpose                                                              | See also                                |
| ----------------- | -------------------------------------------------------------------- | --------------------------------------- |
| `button-solid`    | Primary actions — bold, full background fill                         | [Buttons pattern](./patterns.md#buttons) |
| `button-smooth`   | Secondary actions — subtle background                                | [Buttons pattern](./patterns.md#buttons) |
| `button-outline`  | Tertiary actions — bordered, no background                           | [Buttons pattern](./patterns.md#buttons) |
| `button-link`     | Inline / link-style actions                                          | [Buttons pattern](./patterns.md#buttons) |
| `button-group`    | Composite of multiple buttons treated as a single control            |                                         |
| `floating-button` | FAB / floating action button — fixed-position primary action         |                                         |
| `close-button`    | Compact close (X) trigger for modals/drawers/notifications           |                                         |

### Forms

| Slug             | Purpose                                                              | See also                                |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------- |
| `form-regular`   | Standard form fields (text, dropdown, etc.)                          | [Forms pattern](./patterns.md#forms)    |
| `form-floating`  | Material-style fields with floating labels                           | [Forms pattern](./patterns.md#forms)    |
| `form-outline`   | Material-style fields with prominent borders, no background          | [Forms pattern](./patterns.md#forms)    |
| `form-check`     | Checkboxes and radio buttons                                         | [Forms pattern](./patterns.md#forms)    |
| `dropdown`       | Dropdown menu / select-style picker                                  |                                         |
| `date-picker`    | Date/range selection input                                           |                                         |

### Navigation

| Slug                 | Purpose                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `navbar`             | Top navigation bar — logo, nav items, actions                    |
| `breadcrumb`         | Hierarchical path indicator                                      |
| `tab`                | Tabbed switcher between content panels                           |
| `pagination`         | Page-by-page navigation for lists/tables                         |
| `mobile-nav-top`     | Mobile-optimized top navigation                                  |
| `mobile-nav-bottom`  | Mobile bottom-nav bar (tab-bar style)                            |

### Surfaces & Containers

| Slug          | Purpose                                                              |
| ------------- | -------------------------------------------------------------------- |
| `card`        | Content container grouping related info about a single subject       |
| `section`     | Page-section container — large layout block                          |
| `accordion`   | Collapsible content panel                                            |
| `modal`       | Centered overlay dialog                                              |
| `list`        | Vertical/horizontal item list                                        |

### Feedback

| Slug            | Purpose                                                            |
| --------------- | ------------------------------------------------------------------ |
| `alert`         | Inline static alert message                                        |
| `mobile-alert`  | Mobile-optimized alert                                             |
| `notification`  | Transient toast / notification                                     |
| `message`       | Conversational message bubble (chat-style)                         |
| `tooltip`       | Hover/focus tooltip                                                |
| `progress`      | Progress indicator (bar / circular)                                |

### Data Display

| Slug      | Purpose                                                                | See also                            |
| --------- | ---------------------------------------------------------------------- | ----------------------------------- |
| `table`   | Tabular data — built from `Table Head Cell` + `Table Data Cell`        | [Tables pattern](./patterns.md#tables) |
| `chart`   | Data visualization                                                     |                                     |
| `badge`   | Compact status/count label                                             |                                     |
| `chip`    | Compact selectable / removable tag                                     |                                     |
| `carousel`| Slideshow / paginated horizontal content                              |                                     |
| `story`   | Story-style media slide (Instagram-style)                              |                                     |

### Communication

| Slug      | Purpose                            |
| --------- | ---------------------------------- |
| `comment` | Threaded comment / reply unit      |

## Component Selection Quick Reference

| Need                                       | Reach for                                  |
| ------------------------------------------ | ------------------------------------------ |
| Primary action button                      | `button-solid`, context `primary`          |
| Secondary action button                    | `button-smooth` or `button-outline`        |
| Inline link-style action                   | `button-link`                              |
| Floating primary action (mobile/dashboard) | `floating-button`                          |
| Standard text input                        | `form-regular`                             |
| Material-style text input                  | `form-floating` or `form-outline`          |
| Checkbox or radio                          | `form-check`                               |
| Top of page navigation (web)               | `navbar`                                   |
| Top of page navigation (mobile)            | `mobile-nav-top`                           |
| Bottom tab bar (mobile)                    | `mobile-nav-bottom`                        |
| Card listing items                         | `card`                                     |
| Page section wrapper                       | `section`                                  |
| Centered overlay dialog                    | `modal`                                    |
| Toast / transient feedback                 | `notification`                             |
| Inline static feedback                     | `alert` (web) / `mobile-alert` (mobile)    |
| Hover help / contextual hint               | `tooltip`                                  |
| Status counter or label                    | `badge`                                    |
| Selectable/removable tag                   | `chip`                                     |
| Tabular data with sorting / filtering      | `table` (compose via head + data cells)    |
| Bar/line/pie data visualization            | `chart`                                    |

## Shared Variant Conventions

Most Chassis components share these variant axes — confirm per component:

| Variant       | Typical values                                                    |
| ------------- | ----------------------------------------------------------------- |
| `size`        | `small`, `medium` (default), `large`                              |
| `context`     | `default`, `alternate`, `primary`, `secondary`, `success`, `error`, `warning`, `info`, `black`, `white` |
| `state`       | `idle` (default), `hover`, `press`, `disabled`                    |
| `has-*`       | Boolean toggles for optional sub-elements (icons, badges, etc.)   |
| `*-instance`  | Instance-swap props for nested icons / sub-components             |

## Deprecated / Avoid

- **`Dropdown Button @ 0.2`** — DO NOT USE. Replaced by `Dropdown Button` (componentKey `b5c9294f0d6576fd0dbc60c4bcb3feae193f3b18`).

## When a Component Doesn't Exist

If a needed pattern isn't in the catalog:

1. Try composing from existing primitives (e.g., card + buttons + badges)
2. If the gap is significant, **stop and report it** — don't invent a custom component
3. Document the gap in your deliverable as **Blocked: missing component for X**
