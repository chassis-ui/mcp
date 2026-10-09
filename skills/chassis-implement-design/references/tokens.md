# Token Translation — Figma variables → Chassis CSS classes

`get_variable_defs` returns Chassis Figma variable names. This file turns each into a class. Two facts drive every row:

- **Figma uses long names, CSS uses short names.** Translate the last segment with the table below before looking up a class.
- **Context tokens beat unit tokens.** `space/context/medium` has a class (`p-md`); `space/unit/16` has none. A unit, level or component-scoped token on a surface that is not that component means the design needs a context token: ask rather than emit a pixel value.

## Size name translation

| Figma            | CSS                       | Figma     | CSS   |
| ---------------- | ------------------------- | --------- | ----- |
| `zero`           | `zero` (or `0`)           | `large`   | `lg`  |
| `4xsmall`        | `4xs`                     | `xlarge`  | `xl`  |
| `3xsmall`        | `3xs`                     | `2xlarge` | `2xl` |
| `2xsmall`        | `2xs`                     | `3xlarge` | `3xl` |
| `xsmall`         | `xs`                      | `4xlarge` | `4xl` |
| `small`          | `sm`                      | `5xlarge` | `5xl` |
| `medium`         | `md`                      | `6xlarge` | `6xl` |
| `round` (radius) | `full` (pill) or `circle` |           |       |

Component sizes follow the same table, but `medium` is the default and is not written: `size=small` → `sm`, `size=large` → `lg`, `size=medium` → nothing.

## Colors — `color/context/{ctx}/{role}-{emphasis}`

Contexts: `default`, `alternate`, `primary`, `secondary`, `neutral`, `success`, `danger`, `warning`, `info`, `black`, `white`. The `default` context drops its prefix in the class name; every other context keeps it.

| Figma role                                                    | On the `default` context                  | On another context                                         | Notes                                                                               |
| ------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `fg-main`, `fg-subtle`, `fg-slight`                           | `fg-main`, `fg-subtle`, `fg-slight`       | `{ctx}-fg-main`, `{ctx}-fg-subtle`, `{ctx}-fg-slight`      | Text                                                                                |
| `fg-highlight`, `fg-solid`, `fg-inverse`                      | `fg-highlight`, `fg-solid`, `fg-inverse`  | `{ctx}-fg-highlight`, `{ctx}-fg-solid`, `{ctx}-fg-inverse` |                                                                                     |
| `fg-idle`, `fg-hover`, `fg-press`, `fg-active`, `fg-disabled` | `fg-idle` …                               | `{ctx}-fg-idle` …                                          | Interactive states; usually built into the component, rarely a utility              |
| `bg-main`, `bg-even`, `bg-evident`                            | `bg-main`, `bg-even`, `bg-evident`        | `{ctx}-bg-main`, `{ctx}-bg-even`, `{ctx}-bg-evident`       | Surfaces                                                                            |
| `bg-highlight`, `bg-solid`, `bg-inverse`                      | `bg-highlight`, `bg-solid`, `bg-inverse`  | `{ctx}-bg-highlight` …                                     |                                                                                     |
| `base-color`                                                  | `bg-default`                              | `bg-{ctx}`                                                 | The context's own hue as a background; `fg-{ctx}` as text                           |
| `contrast-color`                                              | `fg-default-contrast`                     | `fg-{ctx}-contrast`, `bg-{ctx}-contrast`                   | Text on the base color                                                              |
| `border-main`, `border-subtle`                                | `border-main`, `border-subtle`            | `{ctx}-border-main`, `{ctx}-border-subtle`                 | A bare `border` is already `border-main`; `border-{ctx}` colors with the base color |
| `icon-main`, `icon-subtle`, `icon-slight`                     | `icon-main`, `icon-subtle`, `icon-slight` | `{ctx}-icon-main` …                                        | On the `.icon` element or any ancestor; `icon-{ctx}` uses the base color            |
| `link-*`                                                      | `link`                                    | `link-{ctx}`                                               | Colored links with hover states                                                     |
| `dim-main`, `dim-subtle`, `dim-slight`                        | `dim-main` …                              | `{ctx}-dim-main` …                                         | Backdrops                                                                           |
| `cue-*`                                                       | built in                                  | built in                                                   | Checked states of inputs; no utility                                                |
| `color/primitive/*`, `color/base/*`                           | ask                                       | ask                                                        | A primitive on a surface means a missing context token                              |
| `color/{component}/*` (`color/button/*`)                      | built in                                  | built in                                                   | Applied by the component class                                                      |

Transparent: `bg-transparent`, `border-transparent`. Reset to inherited: `fg-reset`, `bg-reset`, `border-reset`, `icon-reset`.

## Typography

Text in Figma is a text style named `font/{family}/{size}/{weight}` or a context style.

| Figma text style                                               | Classes                                                          |
| -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `font/text/{size}/normal`                                      | `font-{size}` (text is the body family; `normal` is the default) |
| `font/text/{size}/{weight}`                                    | `font-{size} font-{weight}`                                      |
| `font/display/{size}/{weight}`                                 | `font-display font-{size} font-{weight}`                         |
| `font/code/{size}/{weight}`                                    | `font-code font-{size} font-{weight}` (sizes `sm` `md` `lg`)     |
| `font/html/h1` … `font/html/h6`                                | `<h1>` … `<h6>`, or `h1` … `h6` on another element               |
| `font/html/lead`, `font/html/code`                             | `font-lead`, `<code>` / `font-monospace`                         |
| `font/context/jumbo`, `hero`, `heading`, `lead`                | `font-jumbo`, `font-hero`, `font-heading`, `font-lead`           |
| `font/context/title`, `title-small`, `title-large`             | `font-title`, `font-title-sm`, `font-title-lg`                   |
| `font/context/body`, `body-small`, `body-large`                | `font-body`, `font-body-sm`, `font-body-lg`                      |
| `font/context/label`, `label-small`, `label-large`             | `font-label`, `font-label-sm`, `font-label-lg`                   |
| `font/{component}/*` (`font/button/medium`, `font/card/title`) | nothing: the component class sets it                             |

Sizes: `2xs` `xs` `sm` `md` `lg` `xl` `2xl` `3xl` `4xl` `5xl` (from `2xsmall` … `5xlarge`). Weights keep their names: `font-elegant`, `font-normal`, `font-strong`, `font-mass`. `typography/*` variables (`typography/fontSize/text/medium`) are the parts of a text style; translate the style, not the parts.

## Spacing — `space/context/{size}`

| Property in Figma                             | Class                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Auto-layout padding                           | `p-{size}`, `px-` `py-` `pt-` `pb-` `ps-` `pe-`                                        |
| Auto-layout item spacing                      | `gap-{size}` on the flex or grid parent; `row-gap-`, `column-gap-` for one axis        |
| Spacing between stacked siblings outside flex | `space-y-{size}`, `space-x-{size}`                                                     |
| Margin                                        | `m-{size}`, `mt-` … `mx-` `my-`; negative `-m-{size}`; `mx-auto`, `ms-auto`, `me-auto` |
| `space/unit/{n}`                              | none; find the context step that matches, else ask                                     |
| `space/{component}/*`                         | built into the component class                                                         |

All take the breakpoint prefixes; gaps also take `@md:` container prefixes.

## Sizing — `size/context/{size}`

| Figma                           | Class                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| A component's `size` variant    | `sm` / `lg` modifier on the component                                                           |
| `size/context/{size}` on a box  | `w-{size}`, `h-{size}`, `min-w-`, `max-w-`, `min-h-`, `max-h-` (`2xs` … `2xl`)                  |
| Fill container / fixed fraction | `w-100`, `w-auto`, `w-{n}/12`, `w-25` `w-50` `w-75`, `h-100`, `vh-100`, `min-vh-100`            |
| `size/icon/glyph/{size}`        | `icon-{size}` on the icon or an ancestor (`3xs` … `4xl`); `icon-adaptive` follows the text size |
| `size/{component}/*`            | built in                                                                                        |

## Border radius — `borderRadius/context/{size}`

`rounded-{size}` with `xs` `sm` `md` `lg` `xl` `2xl` `3xl`; `rounded-zero`; `round` → `rounded-full` (pills) or `rounded-circle` (avatars, dots); one side with `rounded-top-{size}`, `rounded-bottom-`, `rounded-start-`, `rounded-end-`. `rounded` alone is the default radius. `borderRadius/{component}/*` is built in.

## Border width — `borderWidth/context/{size}`

`border` sets the default width and `border-main` color. Width: `border-{size}` with `sm` `md` `lg` `xl` `2xl`, `border-zero` / `border-0`. Sides: `border-top`, `border-bottom`, `border-start`, `border-end`, each with a `-0` form. Style: `border-style-dashed`, `border-style-none`. Color: see colors. Order on the element: `border border-md border-primary`.

## Opacity

| Figma                                               | Class                                                                                                |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `opacity/level/{n}` on a layer                      | `opacity-{n}` (`05` `10` … `95`), `opacity-zero`, `opacity-solid`                                    |
| `opacity/level/{n}` on a fill                       | `fg-opacity-{n}`, `bg-opacity-{n}`, `border-opacity-{n}`, `icon-opacity-{n}` next to the color class |
| `opacity/context/fg-subtle`, `fg-slight`, `fg-a11y` | `fg-opacity-subtle`, `fg-opacity-slight`, `fg-opacity-a11y`                                          |
| `opacity/context/border-*`, `icon-*`                | `border-opacity-subtle`, `icon-opacity-subtle` …                                                     |
| `opacity/context/dim-*`                             | `dim-*` classes                                                                                      |

## Shadows — `shadow/context/{size}`

| Figma effect style               | Class                                                       |
| -------------------------------- | ----------------------------------------------------------- |
| `shadow/context/small`           | `shadow-sm`                                                 |
| `shadow/context/medium`          | `shadow`                                                    |
| `shadow/context/large`           | `shadow-lg`                                                 |
| `shadow/context/inset`           | `shadow-inset`                                              |
| `shadow/context/none`            | `shadow-none`                                               |
| `shadow/elevation/{ctx}/{level}` | `shadow-{level}` (`05` … `95`), colored with `shadow-{ctx}` |
| `shadow/{component}/*`           | built in                                                    |

## Grid and breakpoints — `grid/*`

`grid/breakpoint/{size}` are the breakpoints (`sm:` … `2xl:`), `grid/container/{size}` the widths of `container`, `grid/margin/*` the page margin that `container` applies, `grid/gutter/*` the default gap of `grid`, `grid/columns/*` its column count. None is a utility: use `container`, `grid` and `col-span-{n}`.

## Collections and modes

| Figma collection | In code                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| Brand            | The token build the project compiles (`@chassis-ui/tokens`, one brand). Never a class or attribute. |
| Theme            | `data-cx-theme="light"` or `"dark"` on `<html>` or a subtree; absent means system preference        |
| App (web/mobile) | The token build. A design in the mobile app mode still maps to the same classes.                    |
| `figma/switch/*` | Layer visibility per mode: conditional markup, see patterns.md → Theme-conditional assets           |

## Checklist per styled property

- Bound to a `*/context/*` variable or a `font/*` style → translate and emit the class.
- Bound to a `*/{component}/*` token → emit the component; do not repeat the style.
- Bound to a unit, level or primitive token, or unbound → ask; emit nothing until answered.
