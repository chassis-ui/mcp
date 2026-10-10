# Chassis CSS Class Catalog

<!-- AUTO-GENERATED from @chassis-ui/css 0.7.2 by build/generate-css-classes.js. Do not edit; run `pnpm generate:css-classes`. -->

Every class below exists in `dist/css/chassis.css` of `@chassis-ui/css` 0.7.2. A class that is not here does not exist. Placeholders stand for a dimension of a family:

- `{ctx}` — a context color: `default` `alternate` `primary` `secondary` `neutral` `success` `danger` `warning` `info` `black` `white`
- `{size}` — a step of the size scale: `zero` `4xs` `3xs` `2xs` `xs` `sm` `md` `lg` `xl` `2xl` `3xl` `4xl` `5xl` `6xl`
- `{level}` — an opacity level: `05` `10` `20` `30` `40` `50` `60` `70` `80` `90` `95`
- `{n}` — a number (grid lines, spans, twelfths)

When a template lists fewer values after it, only those exist. The bracket before a list names the variant prefixes those classes take: `sm:`–`2xl:` are the viewport breakpoints, `@sm:`–`@2xl:` the container-query breakpoints, `max-sm:`–`max-2xl:` the narrower-than variants, `print:`, `dark:` (system preference only in this build) and `hover:` their media states. Write the prefix before the class, with a colon: `md:d-flex`, `@lg:col-span-6`.

## Scales

### Breakpoints

| Name  | Prefix | Min width |
| ----- | ------ | --------- |
| `xs`  | none   | 0         |
| `sm`  | `sm:`  | 36rem     |
| `md`  | `md:`  | 48rem     |
| `lg`  | `lg:`  | 64rem     |
| `xl`  | `xl:`  | 80rem     |
| `2xl` | `2xl:` | 96rem     |

### Spacing

The values of the default tokens (`--cx-space-*`); a project with its own tokens has other values under the same names.

`zero` 0rem · `4xs` 0.0625rem · `3xs` 0.125rem · `2xs` 0.25rem · `xs` 0.5rem · `sm` 0.75rem · `md` 1rem · `lg` 1.25rem · `xl` 1.5rem · `2xl` 1.75rem · `3xl` 2rem · `4xl` 2.25rem · `5xl` 2.5rem · `6xl` 3rem

## Utilities and helpers

### Display

- [sm:–2xl:, @sm:–@2xl:, print:, dark:] `d-block`, `d-flex`, `d-grid`, `d-inline`, `d-inline-block`, `d-inline-flex`, `d-inline-grid`, `d-none`, `d-table`, `d-table-cell`, `d-table-row`

### Flex

- [sm:–2xl:, @sm:–@2xl:] `align-content-around`, `align-content-between`, `align-content-center`, `align-content-end`, `align-content-start`, `align-content-stretch`, `align-items-baseline`, `align-items-center`, `align-items-end`, `align-items-start`, `align-items-stretch`, `align-self-auto`, `align-self-baseline`, `align-self-center`, `align-self-end`, `align-self-start`, `align-self-stretch`, `flex-column`, `flex-column-reverse`, `flex-fill`, `flex-grow-0`, `flex-grow-1`, `flex-nowrap`, `flex-row`, `flex-row-reverse`, `flex-shrink-0`, `flex-shrink-1`, `flex-wrap`, `flex-wrap-reverse`, `justify-content-around`, `justify-content-between`, `justify-content-center`, `justify-content-end`, `justify-content-evenly`, `justify-content-start`, `justify-items-center`, `justify-items-end`, `justify-items-start`, `justify-items-stretch`, `justify-self-auto`, `justify-self-center`, `justify-self-end`, `justify-self-start`, `justify-self-stretch`, `order-{n}` ({n}: 1 2 3 4 5), `order-0`, `order-first`, `order-last`, `place-content-around`, `place-content-between`, `place-content-center`, `place-content-end`, `place-content-evenly`, `place-content-start`, `place-content-stretch`, `place-items-center`, `place-items-end`, `place-items-start`, `place-items-stretch`, `place-self-auto`, `place-self-center`, `place-self-end`, `place-self-start`, `place-self-stretch`

### Grid

- [sm:–2xl:, @sm:–@2xl:] `auto-cols-auto`, `auto-cols-fr`, `auto-cols-max`, `auto-cols-min`, `auto-rows-auto`, `auto-rows-fr`, `auto-rows-max`, `auto-rows-min`, `col-auto`, `col-end-{n}`, `col-end-auto`, `col-span-{n}` ({n}: 1 2 3 4 5 6 7 8 9 10 11 12), `col-span-full`, `col-start-{n}` ({n}: 1 2 3 4 5 6 7 8 9 10 11 12), `col-start-auto`, `grid-cols-{n}` ({n}: 1 2 3 4 5 6 7 8 9 10 11 12), `grid-cols-none`, `grid-cols-subgrid`, `grid-flow-col`, `grid-flow-col-dense`, `grid-flow-dense`, `grid-flow-row`, `grid-flow-row-dense`, `grid-rows-{n}` ({n}: 1 2 3 4 5 6), `grid-rows-none`, `grid-rows-subgrid`, `row-auto`, `row-end-{n}` ({n}: 1 2 3 4 5 6 7), `row-end-auto`, `row-span-{n}` ({n}: 1 2 3 4 5 6), `row-start-{n}` ({n}: 1 2 3 4 5 6), `row-start-auto`
- [no variants] `grid`, `grid-fill`

### Gap

- [sm:–2xl:, @sm:–@2xl:] `column-gap-{size}`, `column-gap-0`, `gap-{size}`, `gap-0`, `row-gap-{size}`, `row-gap-0`

### Vertical align

- [no variants] `align-baseline`, `align-bottom`, `align-middle`, `align-text-bottom`, `align-text-top`, `align-top`

### Space between children

- [sm:–2xl:, @sm:–@2xl:] `space-x-{size}`, `space-x-0`, `space-y-{size}`, `space-y-0`

### Divide

- [sm:–2xl:, @sm:–@2xl:] `divide-x`, `divide-x-0`, `divide-y`, `divide-y-0`

### Padding

- [sm:–2xl:] `p-{size}`, `p-0`, `pb-{size}`, `pb-0`, `pe-{size}`, `pe-0`, `ps-{size}`, `ps-0`, `pt-{size}`, `pt-0`, `px-{size}`, `px-0`, `py-{size}`, `py-0`

### Margin

- [sm:–2xl:] `-m-{size}`, `-mb-{size}`, `-me-{size}`, `-ms-{size}`, `-mt-{size}`, `-mx-{size}`, `-my-{size}`, `m-{size}`, `m-0`, `m-auto`, `mb-{size}`, `mb-0`, `mb-auto`, `me-{size}`, `me-0`, `me-auto`, `ms-{size}`, `ms-0`, `ms-auto`, `mt-{size}`, `mt-0`, `mt-auto`, `mx-{size}`, `mx-0`, `mx-auto`, `my-{size}`, `my-0`, `my-auto`

### Sizing

- [no variants] `dvh-100`, `dvh-25`, `dvh-50`, `dvh-75`, `h-{size}` ({size}: 2xs xs sm md lg xl 2xl), `h-100`, `h-25`, `h-50`, `h-75`, `h-auto`, `max-h-{size}` ({size}: 2xs xs sm md lg xl 2xl), `max-h-100`, `max-h-auto`, `max-w-{size}` ({size}: 2xs xs sm md lg xl 2xl), `max-w-100`, `max-w-auto`, `min-h-{size}` ({size}: 2xs xs sm md lg xl 2xl), `min-h-100`, `min-h-auto`, `min-vh-100`, `min-vh-25`, `min-vh-50`, `min-vh-75`, `min-vw-100`, `min-vw-25`, `min-vw-50`, `min-vw-75`, `min-w-{size}` ({size}: 2xs xs sm md lg xl 2xl), `min-w-100`, `min-w-auto`, `vh-100`, `vh-25`, `vh-50`, `vh-75`, `vw-100`, `vw-25`, `vw-50`, `vw-75`, `w-{size}` ({size}: 2xs xs sm md lg xl 2xl), `w-25`, `w-50`, `w-75`
- [sm:–2xl:, @sm:–@2xl:] `w-{n}/12` ({n}: 1 2 3 4 5 6 7 8 9 10 11), `w-100`, `w-auto`

### Foreground color

- [no variants] `{ctx}-fg-active`, `{ctx}-fg-disabled`, `{ctx}-fg-highlight`, `{ctx}-fg-hover`, `{ctx}-fg-idle`, `{ctx}-fg-inverse`, `{ctx}-fg-main`, `{ctx}-fg-press`, `{ctx}-fg-slight`, `{ctx}-fg-solid`, `{ctx}-fg-subtle`, `fg-{ctx}`, `fg-{ctx}-contrast`, `fg-a11y`, `fg-active`, `fg-contrast`, `fg-disabled`, `fg-highlight`, `fg-hover`, `fg-idle`, `fg-inverse`, `fg-main`, `fg-opacity-{level}`, `fg-opacity-a11y`, `fg-opacity-slight`, `fg-opacity-solid`, `fg-opacity-subtle`, `fg-opacity-zero`, `fg-press`, `fg-reset`, `fg-slight`, `fg-solid`, `fg-subtle`

### Background color

- [no variants] `{ctx}-bg-active`, `{ctx}-bg-disabled`, `{ctx}-bg-even`, `{ctx}-bg-evident`, `{ctx}-bg-highlight`, `{ctx}-bg-hover`, `{ctx}-bg-idle`, `{ctx}-bg-inverse`, `{ctx}-bg-main`, `{ctx}-bg-press`, `{ctx}-bg-solid`, `bg-{ctx}`, `bg-{ctx}-contrast`, `bg-a11y`, `bg-active`, `bg-contrast`, `bg-disabled`, `bg-even`, `bg-evident`, `bg-gradient`, `bg-highlight`, `bg-hover`, `bg-idle`, `bg-inverse`, `bg-main`, `bg-opacity-{level}`, `bg-opacity-main`, `bg-opacity-slight`, `bg-opacity-solid`, `bg-opacity-subtle`, `bg-opacity-zero`, `bg-press`, `bg-reset`, `bg-solid`, `bg-transparent`

### Dim (backdrop) color

- [no variants] `{ctx}-dim-main`, `{ctx}-dim-slight`, `{ctx}-dim-subtle`, `dim-main`, `dim-slight`, `dim-subtle`

### Border

- [no variants] `{ctx}-border-main`, `{ctx}-border-subtle`, `border`, `border-{ctx}`, `border-{size}` ({size}: zero sm md lg xl 2xl), `border-0`, `border-bottom`, `border-bottom-0`, `border-end`, `border-end-0`, `border-main`, `border-opacity-{level}`, `border-opacity-main`, `border-opacity-solid`, `border-opacity-subtle`, `border-opacity-zero`, `border-reset`, `border-start`, `border-start-0`, `border-style-dashed`, `border-style-inherit`, `border-style-none`, `border-style-solid`, `border-subtle`, `border-top`, `border-top-0`, `border-transparent`

### Border radius

- [no variants] `rounded`, `rounded-{size}` ({size}: zero xs sm md lg xl 2xl 3xl), `rounded-bottom`, `rounded-bottom-{size}` ({size}: zero xs sm md lg xl 2xl 3xl), `rounded-bottom-circle`, `rounded-bottom-full`, `rounded-circle`, `rounded-end`, `rounded-end-{size}` ({size}: zero xs sm md lg xl 2xl 3xl), `rounded-end-circle`, `rounded-end-full`, `rounded-full`, `rounded-start`, `rounded-start-{size}` ({size}: zero xs sm md lg xl 2xl 3xl), `rounded-start-circle`, `rounded-start-full`, `rounded-top`, `rounded-top-{size}` ({size}: zero xs sm md lg xl 2xl 3xl), `rounded-top-circle`, `rounded-top-full`

### Shadow

- [no variants] `shadow`, `shadow-{size}` ({size}: sm lg), `shadow-emboss`, `shadow-inset`, `shadow-none`
- [hover:] `shadow-{ctx}`, `shadow-{level}`

### Opacity

- [no variants] `cue-opacity-{level}`, `cue-opacity-slight`, `cue-opacity-solid`, `cue-opacity-zero`, `opacity-{level}`, `opacity-solid`, `opacity-zero`

### Typography

- [no variants] `attribution`, `blockquote`, `bulletless`, `font-body`, `font-body-{size}` ({size}: sm lg), `font-code`, `font-display`, `font-elegant`, `font-heading`, `font-hero`, `font-html`, `font-icon`, `font-initials`, `font-jumbo`, `font-label`, `font-label-{size}` ({size}: sm lg), `font-lead`, `font-mass`, `font-monospace`, `font-normal`, `font-strong`, `font-text`, `font-title`, `font-title-{size}` ({size}: sm lg), `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `inline`, `text-{size}` ({size}: sm lg), `text-bold`, `text-bolder`, `text-break`, `text-capitalize`, `text-decoration`, `text-decoration-{ctx}`, `text-decoration-{n}` ({n}: 1 2 3 4), `text-decoration-none`, `text-italic`, `text-lh-{size}` ({size}: sm md lg), `text-lh-1`, `text-light`, `text-lighter`, `text-line-through`, `text-lowercase`, `text-mark`, `text-medium`, `text-normal`, `text-nowrap`, `text-regular`, `text-semibold`, `text-truncate`, `text-underline`, `text-uppercase`, `text-wrap`, `underline-offset-{n}` ({n}: 1 2 3), `underline-offset-0`
- [sm:–2xl:] `font-{size}` ({size}: 2xs xs sm md lg xl 2xl 3xl 4xl 5xl)
- [sm:–2xl:, @sm:–@2xl:] `text-center`, `text-end`, `text-start`
- [hover:] `text-decoration-opacity-{level}`, `text-decoration-opacity-slight`, `text-decoration-opacity-solid`, `text-decoration-opacity-subtle`, `text-decoration-opacity-zero`

### Icon

- [no variants] `{ctx}-icon-main`, `{ctx}-icon-slight`, `{ctx}-icon-subtle`, `icon`, `icon-{ctx}`, `icon-adaptive`, `icon-addon`, `icon-link`, `icon-link-hover`, `icon-main`, `icon-only`, `icon-opacity-{level}`, `icon-opacity-slight`, `icon-opacity-solid`, `icon-opacity-subtle`, `icon-opacity-zero`, `icon-reset`, `icon-slight`, `icon-stepper`, `icon-subtle`
- [sm:–2xl:] `icon-{size}` ({size}: 3xs 2xs xs sm md lg xl 2xl 3xl 4xl)

### Link

- [no variants] `link`, `link-{ctx}`, `stretched-link`
- [hover:] `link-opacity-{level}`, `link-opacity-slight`, `link-opacity-solid`, `link-opacity-subtle`, `link-opacity-zero`

### Position

- [no variants] `bottom-0`, `bottom-100`, `bottom-25`, `bottom-50`, `bottom-75`, `bottom-auto`, `end-0`, `end-100`, `end-25`, `end-50`, `end-75`, `end-auto`, `fixed-bottom`, `fixed-top`, `position-absolute`, `position-fixed`, `position-relative`, `position-static`, `position-sticky`, `start-0`, `start-100`, `start-25`, `start-50`, `start-75`, `start-auto`, `sticky-column`, `sticky-header`, `top-0`, `top-100`, `top-25`, `top-50`, `top-75`, `top-auto`, `translate-middle`, `translate-middle-x`, `translate-middle-y`, `z-{n}` ({n}: 1 2 3 4 5), `z-0`, `z-n1`
- [sm:–2xl:] `sticky-bottom`, `sticky-top`

### Overflow, object fit, float, interaction

- [no variants] `contains-inline`, `contains-size`, `overflow-auto`, `overflow-hidden`, `overflow-scroll`, `overflow-visible`, `overflow-x-auto`, `overflow-x-hidden`, `overflow-x-scroll`, `overflow-x-visible`, `overflow-y-auto`, `overflow-y-hidden`, `overflow-y-scroll`, `overflow-y-visible`, `pointer-event-auto`, `pointer-event-none`, `user-select-all`, `user-select-auto`, `user-select-none`
- [sm:–2xl:, @sm:–@2xl:] `float-end`, `float-none`, `float-start`, `object-fit-contain`, `object-fit-cover`, `object-fit-fill`, `object-fit-none`, `object-fit-scale`

### Ratio

- [no variants] `ratio-16x9`, `ratio-1x1`, `ratio-21x9`, `ratio-4x3`, `ratio-auto`

### Context

- [no variants] `context`

### Helpers

- [no variants] `caret`, `caret-before`, `caret-end`, `caret-start`, `caret-up`, `clearfix`, `directional-icon`, `focus-ring`, `focus-ring-{ctx}`, `last-mb-0`, `last-mb-reset`, `visually-hidden`, `visually-hidden-focusable`, `vr`
- [sm:–2xl:] `hstack`, `vstack`

### Other

- `caption-top`, `striped-columns`, `submenu-back`, `submenu-stacked`

## Components

For each component: the root class, its subpart classes (a subpart that takes variant prefixes says so: `navbar-expand` (takes `sm:` … `xl:`) exists as `md:navbar-expand`), the modifiers that appear on the root in the stylesheet, and whether a context color (`primary`, `danger`, …) is written directly on the root ("direct color"). A component without a direct color takes `context {ctx}` instead. State classes such as `active`, `disabled` and `show` are listed where the stylesheet styles them.

### Layout

- `container` — modifiers `2xl`, `fluid`, `lg`, `md`, `sm`, `xl`

### Actions

- `button` — subparts `button-check`, `button-group`, `button-toolbar`; modifiers `active`, `disabled`, `icon-only`, `lg`, `link`, `outline`, `show`, `sm`, `smooth`; direct color
- `button-group` — subparts `button-group-vertical`; modifiers `lg`, `sm`
- `close-button` — modifiers `disabled`, `lg`, `sm`

### Forms

- `form-field`
- `form-label`
- `col-form-label` — modifiers `lg`, `sm`
- `form-input` — modifiers `disabled`, `is-invalid`, `is-valid`, `lg`, `plaintext`, `sm`
- `form-help`
- `form-floating`
- `form-check` — modifiers `lg`, `reverse`, `sm`
- `check-input` — modifiers `is-invalid`, `is-valid`, `lg`, `sm`; direct color
- `form-card`
- `form-caret` — modifiers `disabled`
- `input-group` — modifiers `lg`, `sm`, `vertical`
- `input-addon`
- `input-adorn`
- `form-range` — modifiers `is-invalid`, `is-valid`
- `form-otp` — subparts `form-otp-separator`; modifiers `is-invalid`, `is-valid`
- `combobox` — subparts `combobox-no-results`, `combobox-placeholder`, `combobox-search`, `combobox-search-input`, `combobox-value`; modifiers `disabled`, `is-invalid`, `is-valid`
- `datepicker` — subparts `datepicker-arrow`, `datepicker-arrow-next`, `datepicker-arrow-prev`, `datepicker-column`, `datepicker-content`, `datepicker-controls`, `datepicker-date`, `datepicker-date-btn`, `datepicker-dates`, `datepicker-dates-row`, `datepicker-grid`, `datepicker-header`, `datepicker-header-content`, `datepicker-month`, `datepicker-months`, `datepicker-months-month`, `datepicker-week`, `datepicker-week-day`, `datepicker-week-number`, `datepicker-week-numbers`, `datepicker-week-numbers-content`, `datepicker-week-numbers-title`, `datepicker-wrapper`, `datepicker-year`, `datepicker-years`, `datepicker-years-year`
- `chip-input` — modifiers `disabled`
- `strength` — subparts `strength-bar`, `strength-segment`, `strength-text`
- `valid-feedback`
- `invalid-feedback`
- `valid-tooltip`
- `invalid-tooltip`
- `validation-icons`
- `ghost-input` — modifiers `is-invalid`, `is-valid`

### Navigation

- `navbar` — subparts `navbar-brand`, `navbar-expand` (takes sm:–2xl:), `navbar-nav`, `navbar-text`, `navbar-toggler`, `navbar-toggler-icon`; modifiers `translucent`
- `nav` — subparts `nav-fill`, `nav-item`, `nav-justified`, `nav-link`, `nav-overflow`, `nav-segments`, `nav-tabs`, `nav-underline`; modifiers `lg`, `sm`
- `nav-overflow` — subparts `nav-overflow-item`
- `breadcrumb` — subparts `breadcrumb-item`
- `pagination` — subparts `pagination-link`; modifiers `bordered`, `grouped`, `lg`, `sm`
- `stepper` — subparts `stepper-item`, `stepper-overflow`; modifiers `context`, `horizontal`
- `menu` — subparts `menu-divider`, `menu-header`, `menu-image`, `menu-item`, `menu-item-check`, `menu-item-content`, `menu-item-description`, `menu-item-icon`, `menu-text`; modifiers `context`, `scrollable`, `show`, `translucent`

### Surfaces

- `card` — subparts `card-body`, `card-footer`, `card-group`, `card-header`, `card-header-segments`, `card-header-tabs`, `card-image`, `card-image-bottom`, `card-image-end` (takes sm:–2xl:), `card-image-start` (takes sm:–2xl:), `card-image-top`, `card-link`, `card-overlay`, `card-subtitle`, `card-title`; modifiers `lg`, `sm`
- `accordion` — subparts `accordion-body`, `accordion-title`; modifiers `caret-end`, `context`, `flush`, `lg`, `sm`
- `collapse` — subparts `collapse-horizontal`
- `list` — subparts `list-action`, `list-item`; modifiers `flush`, `horizontal`, `numbered`, `outline`, `plain`
- `table` — subparts `table-divider`, `table-responsive` (takes max-sm:–max-2xl:); modifiers `bordered`, `borderless`, `caption-top`, `context`, `hoverable`, `sticky-column`, `sticky-header`, `striped`, `striped-columns`
- `dialog` — subparts `dialog-open`, `dialog-static`; modifiers `instant`, `nonmodal`, `scrollable`, `translucent`
- `modal` — subparts `modal-body`, `modal-footer`, `modal-header`, `modal-title`; modifiers `fullscreen`, `lg`, `md`, `scrollable`, `sm`, `xl`
- `drawer` — subparts `drawer-body`, `drawer-bottom`, `drawer-end`, `drawer-fit-content`, `drawer-footer`, `drawer-header`, `drawer-start`, `drawer-title`, `drawer-top`; modifiers `hiding`, `sheet`, `translucent`
- `alert` — subparts `alert-body`, `alert-code`, `alert-footer`, `alert-icon`, `alert-title`

### Feedback

- `notification` — subparts `notification-icon`, `notification-title`; modifiers `solid`; direct color
- `toast` — subparts `toast-body`, `toast-container`, `toast-footer`, `toast-header`; modifiers `showing`, `translucent`
- `tooltip` — subparts `tooltip-arrow`, `tooltip-inner`; modifiers `show`
- `popover` — subparts `popover-arrow`, `popover-body`, `popover-header`
- `progress` — subparts `progress-bar`, `progress-stacked`
- `spinner` — subparts `spinner-{ctx}`, `spinner-{size}` ({size}: 3xs 2xs xs sm md lg xl 2xl 3xl 4xl), `spinner-adaptive`, `spinner-border`, `spinner-grow`, `spinner-opacity-slight`, `spinner-opacity-subtle`, `spinner-transparent`
- `skeleton` — subparts `skeleton-{ctx}`, `skeleton-glow`, `skeleton-wave`

### Data

- `badge` — subparts `badge-adaptive`; modifiers `circle`, `lg`, `outline`, `sm`, `smooth`; direct color
- `chip` — subparts `chip-input`; modifiers `active`, `disabled`, `lg`, `outline`, `show`, `sm`, `smooth`; direct color
- `avatar` — subparts `avatar-image`, `avatar-stack`; modifiers `2xl`, `2xs`, `disabled`, `lg`, `md`, `sm`, `smooth`, `xl`, `xs`; direct color
- `carousel` — subparts `carousel-auto`, `carousel-center`, `carousel-control-play-pause`, `carousel-fade`, `carousel-icon-pause`, `carousel-icon-play`, `carousel-indicators`, `carousel-inner`, `carousel-item`, `carousel-overlay`, `carousel-playing`
- `tab-content`
- `tab-pane`
- `figure` — subparts `figure-caption`
- `image` — modifiers `fluid`, `thumbnail`

## JavaScript data attributes

Plugins initialize from markup. `data-cx-toggle` values: `button`, `chip`, `collapse`, `combobox`, `datepicker`, `dialog`, `drawer`, `menu`, `nav-overflow`, `popover`, `tab`, `toggler`, `tooltip`.

Attribute names that appear literally in the plugin code: `data-cx-accordion`, `data-cx-autoplay`, `data-cx-chips`, `data-cx-clone`, `data-cx-datepicker-display`, `data-cx-dismiss`, `data-cx-inline`, `data-cx-interval`, `data-cx-original-title`, `data-cx-otp`, `data-cx-overflow-icon`, `data-cx-pause-label`, `data-cx-placement`, `data-cx-play-label`, `data-cx-slide`, `data-cx-slide-to`, `data-cx-spy`, `data-cx-strength`, `data-cx-target`, `data-cx-theme`, `data-cx-toggle`, `data-cx-value`. A plugin also reads each of its options as `data-cx-{option}` on the element (for example `data-cx-backdrop`, `data-cx-keyboard`, `data-cx-placement`, `data-cx-content`, `data-cx-title`); the options of each plugin are in components.md and on its docs page.

## Tailwind entry

`@chassis-ui/css/tailwind` emits 1466 Chassis utilities as Tailwind `@utility` rules under the same names as above, so every Tailwind variant applies to them (`dark:`, `light:`, `hover:`, `sm:`–`2xl:`, `@sm:`–`@2xl:`, `print:`). Components stay plain CSS. These names are excluded from Tailwind core because they are Chassis classes: `caption-top`, `collapse`, `container`, `grid`, `inline`, `list-item`, `outline`, `static`, `table`. The grid placement classes (`col-span-*`, `col-start-*`, `row-span-*`, …) are Tailwind core's own there, with the same declarations as the regular build.
