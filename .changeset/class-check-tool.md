---
'@chassis-ui/mcp': minor
---

A new tool, `chassis_check_classes`, checks class names against the Chassis CSS class catalog. Pass class names, class attribute values or markup (its `class` attributes are read) and the CSS mode, `native` or `tailwind`, and it returns the classes that do not exist in that mode, each with the reason (not a class; a variant prefix the class does not take in the native build; a Tailwind variant on a class that is not a utility of the Tailwind entry), the catalog section to read for it and the classes near it, or one line when all exist. The list it checks against, `skills/chassis-implement-design/references/css-classes.json`, is written by the catalog generator from the same walk of the stylesheet as `css-classes.md`, and is committed with it.

What an agent now does differently in `chassis-implement-design`: it no longer reads `css-classes.md` whole before the first line of markup. It reads `tokens.md` whole, writes the markup from `tokens.md`, `components.md` and `patterns.md`, calls `chassis_check_classes` on it at the Validate step (the lint checklist's last row), and reads the section of the catalog the tool names for a refused class, or a family's section when it needs a utility the other files do not name. Without the server it checks against the file, as before.

The catalog's "Tailwind entry" line counts the distinct utility names of the entry (1466), not its `@utility` rules (1485).
