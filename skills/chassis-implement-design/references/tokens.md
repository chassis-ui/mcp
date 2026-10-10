# Token Translation — Figma variables → Chassis CSS classes

`get_variable_defs` returns the variables and text styles a node uses as `{ "name": "value" }`, with the names of `cx.tokens.MAIN`. It does not say which property a variable is on: that is in the code block of `get_design_context`, where a bound property reads `gap-[var(--space\/context\/medium,16px)]` ([patterns.md](./patterns.md#reading-the-figma-output)). This file turns each name into a class. Two facts drive every row:

- **Figma uses long names, CSS uses short names.** Translate the last segment with the table below before looking up a class.
- **Context tokens beat unit tokens.** `space/context/medium` has a class (`p-md`); `space/unit/16` has none. A unit, level or component-scoped token on a surface that is not that component means the design needs a context token: ask rather than emit a pixel value.

## Size name translation

| Figma     | CSS             | Figma     | CSS   |
| --------- | --------------- | --------- | ----- |
| `zero`    | `zero` (or `0`) | `large`   | `lg`  |
| `4xsmall` | `4xs`           | `xlarge`  | `xl`  |
| `3xsmall` | `3xs`           | `2xlarge` | `2xl` |
| `2xsmall` | `2xs`           | `3xlarge` | `3xl` |
| `xsmall`  | `xs`            | `4xlarge` | `4xl` |
| `small`   | `sm`            | `5xlarge` | `5xl` |
| `medium`  | `md`            | `6xlarge` | `6xl` |

`full`, the last step of the radius scale, keeps its name: `rounded-full` (a pill) or `rounded-circle`. Component sizes follow the same table, but `medium` is the default and is not written: `size=small` → `sm`, `size=large` → `lg`, `size=medium` → nothing.

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
| `cue-main`, `cue-slight`                                      | built in                                  | built in                                                   | Checked states of inputs; no utility                                                |
| `color/primitive/*`, `color/base/*`                           | ask                                       | ask                                                        | A primitive on a surface means a missing context token                              |
| `color/{component}/*` (`color/button/*`)                      | built in                                  | built in                                                   | Applied by the component class                                                      |

A glyph whose fill is bound to an `fg-*` role takes the `icon-*` class of the same emphasis (`fg-subtle` → `icon-subtle`): an `fg-*` class does not color an `.icon`. Transparent: `bg-transparent`, `border-transparent`. Reset to inherited: `fg-reset`, `bg-reset`, `border-reset`, `icon-reset`.

## Typography

Text in Figma is a text style named `font/{family}/{size}/{weight}`, a context style (`font/context/*`), an HTML style (`font/html/*`) or the style of a component.

| Figma text style                                                    | Classes                                                                                                     |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `font/text/{size}/normal`                                           | `font-{size}` (text is the body family; `normal` is the default)                                            |
| `font/text/{size}/{weight}`                                         | `font-{size} font-{weight}`                                                                                 |
| `font/display/{size}/{weight}`                                      | `font-display font-{size} font-{weight}`                                                                    |
| `font/code/{size}/{weight}`                                         | `font-code font-{size} font-{weight}` (sizes `sm` `md` `lg`)                                                |
| `font/html/h1` … `font/html/h6`                                     | `<h1>` … `<h6>`, or `h1` … `h6` on another element                                                          |
| `font/html/code`                                                    | `<code>` / `font-monospace`                                                                                 |
| `font/html/blockquote`, `font/html/cite`                            | `blockquote`, `attribution`                                                                                 |
| `font/html/body`, `paragraph`, `list`                               | nothing: the page default, `<p>`, `<ul>` / `<ol>`                                                           |
| `font/context/jumbo`, `hero`, `heading`, `lead`                     | `font-jumbo`, `font-hero`, `font-heading`, `font-lead`                                                      |
| `font/context/title/medium`, `/small`, `/large`                     | `font-title`, `font-title-sm`, `font-title-lg`                                                              |
| `font/context/body/medium`, `/small`, `/large`                      | `font-body`, `font-body-sm`, `font-body-lg`                                                                 |
| `font/context/label/medium`, `/small`, `/large`                     | `font-label`, `font-label-sm`, `font-label-lg`                                                              |
| `font/context/highlight/*`, `expired/*`, `link/*`, `code/*`         | no class in `@chassis-ui/css` 0.7: ask                                                                      |
| `font/{component}/*` (`font/button/medium`, `font/table/head-text`) | nothing: the component class sets it; of a composed component, [its parts](#tokens-of-a-composed-component) |

A style with no class is asked about, not rebuilt from its parts; the style of a composed component is the one exception ([Tokens of a composed component](#tokens-of-a-composed-component)). Sizes: `2xs` `xs` `sm` `md` `lg` `xl` `2xl` `3xl` `4xl` `5xl` (from `2xsmall` … `5xlarge`). Weights keep their names: `font-elegant`, `font-normal`, `font-strong`, `font-mass`. `typography/*` variables (`typography/fontSize/text/medium`) are the parts of a text style; translate the style, not the parts.

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

The glyph sizes of Figma go to `6xlarge`; `5xlarge` and `6xlarge` have no class in `@chassis-ui/css` 0.7: ask.

## Border radius — `borderRadius/context/{size}`

`rounded-{size}` with `xs` `sm` `md` `lg` `xl` `2xl` `3xl` (from `xsmall` … `3xlarge`); `rounded-zero`; `full` → `rounded-full` (pills) or `rounded-circle` (avatars, dots); `4xlarge` has no class in `@chassis-ui/css` 0.7: ask; one side with `rounded-top-{size}`, `rounded-bottom-`, `rounded-start-`, `rounded-end-`. `rounded` alone is the default radius. `borderRadius/{component}/*` is built in.

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

`shadow/context/idle`, `disabled`, `hover`, `press`, `focus` and `highlight` are the states of an interactive component, which its class applies; on another surface, and for `shadow/glow/{ctx}`, there is no class: ask.

## Grid and breakpoints — `grid/*`

`grid/breakpoint/{size}` are the breakpoints (`sm:` … `2xl:`), `grid/container/{size}` the widths of `container`, `grid/margin/*` the page margin that `container` applies, `grid/gutter/*` the default gap of `grid`, `grid/columns/*` its column count. None is a utility: use `container`, `grid` and `col-span-{n}`.

## Collections and modes

| Figma collection | Modes                                               | In code                                                                                             |
| ---------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `brand`          | `default`, `chassis`, `sinefil`, `demo-a`, `demo-b` | The token build the project compiles (`@chassis-ui/tokens`, one brand). Never a class or attribute. |
| `theme`          | `light`, `dark`                                     | `data-cx-theme="light"` or `"dark"` on `<html>` or a subtree; absent means system preference        |
| `app`            | `docs`, `demo`                                      | The token build. A design in either mode maps to the same classes.                                  |
| `system`         | `base`                                              | Constants; nothing in markup                                                                        |

`figma/switch/{brand,theme,app}/mode-n` are BOOLEAN variables that are `true` in the n-th mode of their collection and gate the visibility of a layer: conditional markup, see patterns.md → Theme-conditional assets. There is no platform collection, no high-contrast theme and no `screen` collection in Figma: the screen sizes exist only in the token build.

## Tokens of a composed component

A component that the family table of components.md composes from primitives (`Section Block`, `Section Header`, `Section Footer`, `Page Title`, `Chat Message`) has no class, so nothing applies its own tokens: `font/section/*`, `font/page/*`, `color/section/*`, `color/page/*`, `color/message/*`, `space/page/*`, `borderRadius/section/main`, `borderWidth/section/main`, `shadow/section/main`, `shadow/message/main`. Each is an alias of a text style or a context token in the token build. Do not ask about it: write the class of what it resolves to, and name the token and the class in a Flagged line, because the class no longer follows the token if a brand points it elsewhere.

- **A text style.** `get_variable_defs` lists it with its parts: `Font(family: "typography/fontFamily/text", style: typography/fontWeight/text/strong, size: typography/fontSize/text/medium, …)`. The last segment of `size` is the size and the last segment of `style` is the weight, so that style is `font-md font-strong`; it is what `font/section/header-medium` returns.
- **A color, space, radius, border or shadow token.** The context token of the same namespace that has the same value in what `get_variable_defs` returned: `color/section/fg-medium` `#171717` is `color/context/default/fg-main`, so `fg-main`, which the checklist below does not write where it is the inherited default; `space/page/medium-padding-x` `24` is `space/context/xlarge`, so `px-xl`. When no context token of the response has the value, the context step nearest to it, and the Flagged line says so.

## Checklist per styled property

- Bound to a `*/context/*` variable or a `font/*` style → translate and emit the class, unless the element inherits that value already (`fg-main` on text in the `default` context, where the page's `body` sets it): a class that restates the inherited default is not written.
- Bound to a `*/{component}/*` token → emit the component; do not repeat the style. When the component is composed, no class carries the style: [Tokens of a composed component](#tokens-of-a-composed-component).
- Bound to a unit, level or primitive token, or unbound → ask; emit nothing until answered. When no one can answer, the context step nearest the resolved value, with a Flagged line that says so. The base values of the steps, in px: `space/context/*` is the Spacing scale of css-classes.md (section Scales, in rem: `md` 1rem is 16); `size/context/*` is `2xs` 16, `xs` 24, `sm` 32, `md` 40, `lg` 48, `xl` 56, `2xl` 64. A value no step is near (a width of 256) gets no class and a Flagged line.
