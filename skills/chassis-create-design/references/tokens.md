# Chassis tokens in Figma

The variables, text styles and effect styles of `cx.tokens.MAIN`, by namespace, as the library has them. Every visual value of a Chassis view comes from here; a value that no token fits is asked about, not hardcoded. The CSS side of the same namespaces is in the `chassis-implement-design` skill; the facts both state are the same.

## Variables and styles

| Namespace                                                                                                                              | Figma object | Found with                                   | Applied with                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------- | --------------------------------------------------------------------------------- |
| `color/*`, `space/*`, `size/*`, `borderRadius/*`, `borderWidth/*`, `opacity/*`, `grid/*`, `typography/*`, `figma/switch/*`, `motion/*` | variable     | `search_design_system`, `entity: "variable"` | `importVariableByKeyAsync`, then `setBoundVariable` or `setBoundVariableForPaint` |
| `font/*`                                                                                                                               | text style   | `search_design_system`, `entity: "style"`    | `importStyleByKeyAsync`, then `setTextStyleIdAsync` on the TEXT node              |
| `shadow/*`                                                                                                                             | effect style | `search_design_system`, `entity: "style"`    | `importStyleByKeyAsync`, then `setEffectStyleIdAsync`                             |

Two rules decide which token: a **context** token (`*/context/*`) before a unit or level token (`space/unit/16`, `opacity/level/50`), because only context tokens change with the theme and the brand; and a **component-scoped** token (`color/button/*`, `space/card/*`, `font/button/*`, `shadow/button/*`) belongs to that component, is already bound inside its instances, and is not bound on a frame of the agent's own. `typography/*` variables are the parts of a text style and are bound only inside styles. The snippets are in [recipes.md → Bind variables and effect styles](./recipes.md#bind-variables-and-effect-styles).

## Collections and modes

| Collection | Modes                                               | Decides                                                                                  |
| ---------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `brand`    | `default`, `chassis`, `sinefil`, `demo-a`, `demo-b` | Font families and weights, base colors, radii: `typography/fontFamily/*`, `color/base/*` |
| `theme`    | `light`, `dark`                                     | The context colors and shadows                                                           |
| `app`      | `docs`, `demo`                                      | Letter spacing, paragraph spacing, text case                                             |
| `system`   | `base`                                              | Constants                                                                                |

The modes are set by the designer in the Appearance panel of a page, frame or instance; the agent reads them (`resolvedVariableModes`) and never sets them ([recipes.md → Read the modes](./recipes.md#read-the-modes)). There is no platform collection, no high-contrast theme and no `screen` collection in Figma: the screen sizes exist only in the token build. A second collection named `app` (modes `docs`, `test`) is bound in some docs frames; it comes from `cx.components.DOC` and is not part of the system.

`figma/switch/{brand,theme,app}/mode-n` are BOOLEAN variables (`mode-1` to `mode-4`, `brand` to `mode-5`) that are `true` in the n-th mode of their collection: a layer whose visibility is bound to `figma/switch/theme/mode-1` shows in light and one bound to `mode-2` in dark, which is how a logo or illustration differs by theme without an instance swap.

## Colors

`color/context/{context}/{role}`: eleven contexts, each with the same 39 roles, so any surface is themed by its context alone.

| Context                                | Use                                                     |
| -------------------------------------- | ------------------------------------------------------- |
| `default`                              | General UI, most common; inverts between light and dark |
| `alternate`                            | A section with the alternate scheme; may not invert     |
| `primary`, `secondary`                 | The brand actions and highlights                        |
| `neutral`                              | Neutral emphasis                                        |
| `danger`, `success`, `warning`, `info` | States and messages                                     |
| `black`, `white`                       | Persistent across themes                                |

| Role group | Roles                                                                                                                                        | For                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| base       | `base-color`, `contrast-color`, `transparent-color`                                                                                          | The context's own hue, what sits on it, a transparent stop                                            |
| `fg-*`     | `fg-main`, `fg-subtle`, `fg-slight`, `fg-active`, `fg-inverse`, `fg-solid`, `fg-highlight`; `fg-idle`, `fg-hover`, `fg-press`, `fg-disabled` | Text and glyph color; the states are for interactive parts                                            |
| `bg-*`     | `bg-main`, `bg-even`, `bg-evident`, `bg-active`, `bg-inverse`, `bg-solid`, `bg-highlight`; `bg-idle`, `bg-hover`, `bg-press`, `bg-disabled`  | Surfaces; `solid` pairs with `fg-solid`, `highlight` with `fg-highlight`, `inverse` with `fg-inverse` |
| `border-*` | `border-main`, `border-subtle`                                                                                                               | Borders and separators; `subtle` is the common one                                                    |
| `icon-*`   | `icon-main`, `icon-subtle`, `icon-slight`                                                                                                    | Icons                                                                                                 |
| `cue-*`    | `cue-main`, `cue-slight`                                                                                                                     | Selection and attention cues                                                                          |
| `link-*`   | `link-main`, `link-hover`, `link-active`, `link-visited`                                                                                     | Links                                                                                                 |
| `dim-*`    | `dim-main`, `dim-subtle`, `dim-slight`                                                                                                       | Backdrops                                                                                             |

Choose the context by meaning, the role by what the element does (text `fg-*`, surface `bg-*`, line `border-*`), the emphasis by hierarchy (`main`, then `subtle`, then `slight`). The other color namespaces are not for surfaces: `color/primitive/*`, `color/base/*` (brand), `color/shadow/*` (the shadow colors, by theme), `color/utility/*`, `color/{component}/*`.

## Spacing

`space/context/{step}`, preferred, with the base values; `space/unit/{n}` for a value outside the scale; `space/{component}/*` belongs to the component.

| Step      | px  | Step      | px  |
| --------- | --- | --------- | --- |
| `zero`    | 0   | `large`   | 20  |
| `4xsmall` | 1   | `xlarge`  | 24  |
| `3xsmall` | 2   | `2xlarge` | 28  |
| `2xsmall` | 4   | `3xlarge` | 32  |
| `xsmall`  | 8   | `4xlarge` | 36  |
| `small`   | 12  | `5xlarge` | 40  |
| `medium`  | 16  | `6xlarge` | 48  |

## Sizing

`size/context/{step}`: `2xsmall` 16, `xsmall` 24, `small` 32, `medium` 40 (the standard control height), `large` 48, `xlarge` 56, `2xlarge` 64. `size/unit/{n}` for other values; `size/icon/glyph/{3xsmall … 6xlarge}` for an icon glyph; `size/{component}/*` belongs to the component. A component's own size is its `size` variant, not a bound variable.

## Border radius

`borderRadius/context/{step}`, with the base brand's values; a brand may override them: `zero` 0, `xsmall` 0.5, `small` 1, `medium` 2, `large` 4, `xlarge` 6, `2xlarge` 8, `3xlarge` 10, `4xlarge` 12, `full` 256 (a pill or circle). There is no `round` and no `2xsmall`. `borderRadius/{component}/*` belongs to the component.

## Border width

`borderWidth/context/{step}`: `zero` 0, `small` 0.5, `medium` 1 (the standard border), `large` 1.5, `xlarge` 2, `2xlarge` 4.

## Opacity

`opacity/context/{role}`, semantic and preferred: `fg-subtle`, `fg-slight`, `fg-a11y`, `border-main`, `border-subtle`, `icon-subtle`, `icon-slight`, `cue-slight`, `dim-main`, `dim-subtle`, `dim-slight`, `transparent-color`. `opacity/level/{level}`, numeric: `zero`, `05`, `10` to `90` in tens, `95`, `solid`.

## Grid

`grid/breakpoint/{step}` gives the page widths a wrapper frame is sized to: `xsmall` 400, `small` 576, `medium` 768, `large` 1024, `xlarge` 1280, `2xlarge` 1536. `grid/container/*`, `grid/margin/*`, `grid/gutter/*` and `grid/columns/*` are the container widths, page margins, gutters and column counts per breakpoint.

## Text styles

`font/*` are text styles, not variables: each binds `fontFamily`, `fontSize`, `fontStyle`, `lineHeight`, `letterSpacing` and `paragraphSpacing` to `typography/*` variables, so one style follows the brand and the app mode: `typography/{fontFamily,fontWeight,fontSize,lineHeight}/{text,display,html,code}/…` are `brand` variables, `typography/{letterSpacing,paragraphSpacing,textCase,textDecoration}/base/…` are `app` variables. Apply the style; never its parts.

| Group                                                       | Styles                                                                                                                                                                                 | Use                                                                                                                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `font/context/*`                                            | `jumbo`, `hero`, `lead`, `heading`; `title`, `body`, `highlight`, `label`, `expired`, `code`, each `/large`, `/medium`, `/small`; `link` with `/large`, `/medium`, `/small`, `/xsmall` | Standalone text by role: a card or section title is `font/context/title/medium`, body copy `font/context/body/medium`, a label `font/context/label/medium` |
| `font/text/{size}/{weight}`, `font/display/{size}/{weight}` | Sizes `2xsmall`, `xsmall`, `small`, `medium`, `large`, `xlarge`, `2xlarge`, `3xlarge`, `4xlarge`, `5xlarge`; weights `normal`, `strong`, `mass`, `elegant`                             | The text and display ramps when no context style fits; `font/text/medium/normal` is what a fresh `Basic Text  Asset` has                                   |
| `font/code/{size}/{weight}`                                 | Sizes `large`, `medium`, `small`; weights `normal`, `strong`                                                                                                                           | Code                                                                                                                                                       |
| `font/html/*`                                               | `h1` to `h6`, `body`, `code`, `paragraph`, `blockquote`, `list`, `cite`                                                                                                                | Content design that mirrors HTML elements                                                                                                                  |
| `font/{component}/*`                                        | For accordion, alert, assist, badge, breadcrumb, button, chip, datepicker, dropdown, form-input, modal, notification, page, section, segment, tab, table                               | Bound inside the components; not applied to other text                                                                                                     |

The weights are names, not numbers: a brand maps `strong` and `mass` to the numeric weights it wants. The text inside a component keeps the style the component gives it unless the design shows otherwise.

## Effect styles

`shadow/*` are effect styles applied with `setEffectStyleIdAsync`; `effects` is never set by hand.

| Group                                | Styles                                                                                                  | Use                                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shadow/context/*`                   | `none`, `small`, `medium`, `large`, `inset`, `idle`, `disabled`, `hover`, `press`, `focus`, `highlight` | `small` for cards and chips, `medium` for dropdowns and popovers, `large` for modals, `inset` for a pressed or active control; the rest are states |
| `shadow/elevation/{context}/{level}` | Levels `05` to `95`                                                                                     | Elevation in a context's color                                                                                                                     |
| `shadow/glow/{context}`              | One per context                                                                                         | A glow                                                                                                                                             |
| `shadow/{component}/*`               | `main`, and the button states                                                                           | Bound inside the components                                                                                                                        |

## Fonts

The font family of every style is `typography/fontFamily/{text,display,html,code}`, a `brand` variable: Open Sans in the default brand of a new file, Inter in the library file, something else in another brand. A script reads the family from the node (`getStyledTextSegments(['fontName'])`) and from the style (`style.fontName`) to load it, and never writes one.
