---
'@chassis-ui/mcp': minor
---

A third skill, `chassis-add-brand`, adds a brand to a repository of tokens built with `@chassis-ui/tokens` and to a repository of assets built with `@chassis-ui/assets`: the token set of the brand, its option in `$themes.json`, its name in `chassis.build`, and then its fonts, images, web manifest and app icon bundles under `source/<brand>/`. It runs on files and commands, with no Figma tool, and hands the export of the brand to Figma to the designer. The server serves it as the prompt `chassis-add-brand`, the tool `chassis_add_brand` and the resources `chassis-add-brand`, `chassis-add-brand/references/tokens`, `chassis-add-brand/references/fonts` and `chassis-add-brand/references/images`; the plugin adds it as a slash command.

What an agent now does differently: `chassis-create-design`, `chassis-implement-design` and the `/chassis-ui` prompt send a request to add a brand to `chassis-add-brand`, where they said only that token edits belong in `chassis-ui/website-tokens`.
