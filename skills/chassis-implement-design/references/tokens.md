# Token Translation — Figma → Chassis CSS

This is the **token-to-class** lookup. When `get_variable_defs` returns a Figma variable name, translate it to a Chassis CSS class using the rules below.

## Namespace overview

Chassis Figma variables follow strict namespaces:

| Family | Pattern |
| --- | --- |
| Colors | `color/context/{ctx}/{role}-{emphasis}` |
| Typography | `font/{family}/{size}/{weight}` (or semantic `font/{role}` like `font/h1`) |
| Spacing | `space/context/{ctx}` (preferred) or `space/unit/{n}` |
| Sizing | `size/context/{ctx}` (preferred) or `size/unit/{n}` |
| Radius | `borderRadius/context/{ctx}` |
| Border width | `borderWidth/context/{ctx}` |
| Opacity | `opacity/context/{ctx}` or `opacity/level/{level}` |

> **Always prefer `context` tokens over `unit`/`level` tokens.** Context tokens swap correctly across Brand × Theme × App. Unit/level tokens do not.

## Colors

### Foreground

| Figma variable | Chassis CSS class |
| --- | --- |
| `color/context/default/fg-main` | `fg-main` |
| `color/context/default/fg-subtle` | `fg-subtle` |
| `color/context/default/fg-slight` | `fg-slight` |
| `color/context/default/fg-highlight` | `fg-highlight` |
| `color/context/default/fg-solid` | `fg-solid` |
| `color/context/default/fg-inverse` | `fg-inverse` |
| `color/context/{context}/fg-main` | `{context}-fg-main` |
| `color/context/{context}/fg-subtle` | `{context}-fg-subtle` |
| `color/context/{context}/fg-slight` | `{context}-fg-slight` |
| `color/context/{context}/fg-highlight` | `{context}-fg-highlight` |
| `color/context/{context}/fg-solid` | `{context}-fg-solid` |
| `color/context/{context}/fg-inverse` | `{context}-fg-inverse` |

### Background

| Figma variable | Chassis CSS class |
| --- | --- |
| `color/context/default/bg-main` | `bg-main` |
| `color/context/default/bg-even` | `bg-even` |
| `color/context/default/bg-evident` | `bg-evident` |
| `color/context/default/bg-highlight` | `bg-highlight` |
| `color/context/default/bg-solid` | `bg-solid` |
| `color/context/default/bg-inverse` | `bg-inverse` |
| `color/context/{context}/bg-main` | `{context}-bg-main` |
| `color/context/{context}/bg-even` | `{context}-bg-even` |
| `color/context/{context}/bg-evident` | `{context}-bg-evident` |
| `color/context/{context}/bg-highlight` | `{context}-bg-highlight` |
| `color/context/{context}/bg-solid` | `{context}-bg-solid` |
| `color/context/{context}/bg-inverse` | `{context}-bg-inverse` |

### Border colors

Same as bg/fg roles applied as `border-{emphasis}` (compatible with Bootstrap utility names) or `{context}-border-{emphasis}` for advanced cases. Confirm against the actual stylesheet.

### Contexts

`primary`, `secondary`, `success`, `danger`, `warning`, `info`, `neutral`, plus `default` (page-level neutral context, inverted in dark mode), `alternate` (for prominent content, may not inverted in dark mode), `black` (persists black in all color modes), `white` (persists white in all color modes).

## Typography

| Figma variable | Chassis CSS class(es) |
| --- | --- |
| `font/html/h1` (semantic) | `font-h1` |
| `font/html/h2`–`font/html/h6` | `font-h2` … `font-h6` |
| `font/html/lead` | `font-lead` |
| `font/small` | `font-small` |
| `font/html/code` | `font-code` |
| `font/display/{size}/normal` | `font-display font-{size}` |
| `font/text/{size}/normal` | `font-{size}` |
| `font/{family}/{size}/{weight}` | `font-{family} font-{size} font-{weight}` |

### Family map

| Figma family token | Chassis class |
| --- | --- |
| `font/text` | `font-text` (default body) |
| `font/display` | `font-display` |
| `font/code` | `font-code` |
| `font/html` | `font-html` |

### Size map

`font-5xlarge`, `font-4xlarge`, `font-3xlarge`, `font-2xlarge`, `font-xlarge`, `font-large`, `font-medium`, `font-small`, `font-xsmall`, `font-2xsmall`.

### Weight map

| Figma weight | Chassis class |
| --- | --- |
| `elegant` | `font-elegant` |
| `normal` / `regular` | `font-normal` |
| `strong` | `font-strong` |
| `mass` | `font-mass` |

## Spacing

### Context (preferred)

| Figma variable | Chassis class family |
| --- | --- |
| `space/context/zero` | `*-zero` |
| `space/context/4xsmall` | `*-4xsmall` |
| `space/context/3xsmall` | `*-3xsmall` |
| `space/context/2xsmall` | `*-2xsmall` |
| `space/context/xsmall` | `*-xsmall` |
| `space/context/small` | `*-small` |
| `space/context/medium` | `*-medium` |
| `space/context/large` | `*-large` |
| `space/context/xlarge` | `*-xlarge` |
| `space/context/2xlarge` | `*-2xlarge` |
| `space/context/3xlarge` | `*-3xlarge` |
| `space/context/4xlarge` | `*-4xlarge` |
| `space/context/5xlarge` | `*-5xlarge` |
| `space/context/6xlarge` | `*-6xlarge` |

`*` = `p`, `pt`, `pe`, `pb`, `ps`, `px`, `py`, `m`, `mt`, `me`, `mb`, `ms`, `mx`, `my`, `gap`.

### Unit (avoid; raise if encountered)

`space/unit/{n}` represents a raw step. **If you find a raw unit token on a non-utility surface, ask the user before falling back to inline pixel values** — usually it indicates the design needs a context token instead.

## Sizing

| Figma variable | Chassis class |
| --- | --- |
| `size/context/{ctx}` | typically a component-internal size variant — surfaces as a modifier (`small`, `large`) on the component, not a utility |
| `w-{25|50|75|100|auto}` (sizing utility) | unchanged |

If a context-size token controls a wrapper width, prefer mapping it to a layout container (`container`, `container-medium`, …) or to the appropriate component's `size` modifier (`button large`, `modal large`, etc.) rather than emitting a raw width.

## Border radius

| Figma variable | Chassis class |
| --- | --- |
| `borderRadius/context/zero` | `rounded-0` |
| `borderRadius/context/round` | `rounded-round` (pills, avatars, fully-rounded) |
| `borderRadius/context/{ctx}` | `rounded-{ctx}` |

## Border width

| Figma variable | Chassis class |
| --- | --- |
| `borderWidth/context/zero` | `border-0` |
| `borderWidth/context/{ctx}` | `border-{ctx}` |

Combine with a side: `border-top`, `border-end`, etc., and a color: `border-primary`.

## Opacity

| Figma variable | Chassis class |
| --- | --- |
| `opacity/context/{ctx}` | element class `opacity-{ctx}` (general opacity) |
| `opacity/level/{level}` | combined with a color: `fg-primary fg-opacity-{level}`, `bg-primary bg-opacity-{level}` |

## Mode / theme tokens (Figma collections)

| Collection | Translation |
| --- | --- |
| Brand | Document/wrapper class or attribute (e.g., `data-cx-brand="brand-a"`) — confirm project mechanism |
| Theme | `data-cx-theme="light"` / `data-cx-theme="dark"` on document or section wrapper |
| App | App-level scope class on a wrapper element |

These are not emitted as utility classes per element — they're applied **once** at the wrapper level and the cascade resolves all `fg-*` / `bg-*` / `space-*` tokens automatically.

## Switch variables (theme-conditional visibility)

`figma/switch/theme/{mode}` variables are used in Figma to gate layer visibility per mode (e.g., dark-only logos). In code, translate to **conditional rendering**:

```html
<!-- Theme-conditional logo: light mode default, dark mode swap via attribute -->
<picture>
  <source srcset="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.svg" alt="Brand" />
</picture>
```

…or twin elements gated by `[data-cx-theme]` selectors. Don't try to express switch variables as utility classes.



For every styled property in the design context:

- [ ] Bound to a Figma variable? → look up here, emit Chassis class
- [ ] Raw value (no binding)? → flag for user; emit inline `style=""` only if clearly intentional and out of token scope
- [ ] Token from `space/unit/*` / `opacity/level/*` / `size/unit/*`? → prefer the context equivalent if one fits; raise otherwise
