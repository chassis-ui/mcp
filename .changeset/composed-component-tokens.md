---
'@chassis-ui/mcp': patch
---

`chassis-implement-design` says what to write for the own tokens of a component that has no CSS class (`Section Block`, `Section Header`, `Section Footer`, `Page Title`, `Chat Message`), in a new section of `tokens.md`, "Tokens of a composed component".

What an agent now does differently: it no longer asks about `font/section/header-medium`, `font/page/medium-title`, `color/section/fg-medium` or `space/page/medium-padding-x`. A text style is written from the parts `get_variable_defs` lists with it (`size: typography/fontSize/text/medium`, `style: typography/fontWeight/text/strong` is `font-md font-strong`); a color, space, radius, border or shadow token as the class of the context token that has the same value in the response, or the nearest context step. Each is named in a Flagged line with the class written for it.

Also in `chassis-implement-design`, from a trial run: rule 4 names the inputs of `chassis_check_classes` (`classes`, a list that holds the markup as one item or the class names, and `mode`); the checklist of `tokens.md` gives the base values of the `space/context/*` and `size/context/*` steps for "the nearest context step", and says a value no step is near gets no class; `get_variable_defs` is called once on the frame, and on a smaller node only to tell which of two layers holds a variable; the help icon of a `Form Check` or `Form Help` takes the gap class of the value the design binds (`gap-xs` for 8, `gap-sm` for 12).
