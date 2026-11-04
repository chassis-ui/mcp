---
'@chassis-ui/mcp': patch
---

`chassis-implement-design` follows the icons of the Chassis sites to `@chassis-ui/website-icons`, since `@chassis-ui/icons` 0.4.0 is the builder of icon sets and holds no icons. The names of a glyph are checked against the symbol ids of `node_modules/@chassis-ui/website-icons/dist/web/chassis-icons.svg`, or `dist/web/` of a build of a checkout of `chassis-ui/website-icons`.

What an agent now does differently: it takes `@chassis-ui/website-icons` among the dependencies of a project for Chassis Icons, where it took `@chassis-ui/icons`, and still takes `@chassis-ui/icons` before 0.4.0 for Chassis Icons, with its names in `icons/chassis-icons.svg`. A set of the project's own built with `@chassis-ui/icons` 0.4.0 or later is another icon library: a glyph becomes the icon of that set that draws it, checked against `dist/web/<font>.svg` of its package, and it takes the `icon` and `icon-*` classes, since the builder takes no icon drawn with strokes.
