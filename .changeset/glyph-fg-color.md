---
'@chassis-ui/mcp': patch
---

`chassis-implement-design` no longer turns a glyph whose fill is bound to an `fg-*` role into the `icon-*` class of the same emphasis. The `icon-*` roles and the `fg-*` roles are tokens of their own, and a brand sets the color of each, so the skill goes by the name of the token a fill is bound to and says nothing of the color it resolves to.

What an agent now does differently: a glyph bound to an `fg-*` role gets `icon-reset` on the `.icon` itself, which gives it the text color of the place it is in, and the `fg-*` class with it when the text there has another role (`fg-subtle icon-reset`). A glyph bound to `fg-main` was written as `icon-main` and came out in the icon color of the brand; it now has the color of the text. A glyph bound to an `icon-*` role takes that class, as before. `icon-reset` is no longer listed with the classes that reset to the inherited color.

`chassis-create-design` says which role a glyph binds: the `fg-*` role of its text when it is to have the color of that text, an `icon-*` role when it is to have the icon color, chosen by the name of the token.
