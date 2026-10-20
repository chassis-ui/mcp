---
'@chassis-ui/mcp': minor
---

**Breaking:** both skills describe the typography of `@chassis-ui/tokens` 0.10.1 and `@chassis-ui/css` 0.11, which name the font families by their job and make every named text style a text role. `chassis-implement-design` writes markup for Chassis CSS 0.11, and `chassis_check_classes` checks against its classes: `font-heading` and `font-html` are no longer classes, and `font-h1` to `font-h6`, `font-ui`, `font-prose`, `font-blockquote` and `font-cite` are. A project on an older Chassis CSS updates it to 0.11, with its token source on tokens 0.10.1.

The skills name the text styles of the token build 0.10.1: `font/ui/*` for `font/text/*`, the new `font/prose/*`, and the roles `font/context/h1` to `h6`, `blockquote` and `cite`. `font/display/*`, `font/html/*` and the roles `heading`, `highlight`, `expired`, `link` and `code` are gone. A Figma library that has not been pushed from Tokens Studio since tokens 0.10 still has the old styles, and an agent will not find the new ones in it.

What an agent now does differently:

- `chassis-implement-design` translates `font/ui/{size}/{weight}` to `font-{size} font-{weight}`, as it did `font/text/*`, and `font/prose/{size}/{weight}` to `font-prose font-{size} font-{weight}`. A heading role is the `<h1>` to `<h6>` of the outline, with `font-h1` to `font-h6` when the level of the outline differs from the level of the style or the element is not a heading. `font/context/blockquote` and `cite` are `font-blockquote` and `font-cite`, or `blockquote` and `attribution` for a quotation with its source. A role class is written without a family or weight class. It writes `font-ui` and `font-h1` to `font-h6`, never the deprecated `font-text` and `h1` to `h6` classes.
- `chassis-create-design` applies `font/context/h1` to `h6` to headings, `blockquote` and `cite` to a quotation and its source, and `font/ui/*` or `font/prose/*` when no role fits; a fresh `Basic Text  Asset` has `font/ui/medium/normal`. It knows that the display family has no ramp of its own, that each family has its own weights, and that the typography variables are all in the `brand` collection.
