---
'@chassis-ui/mcp': patch
---

`chassis-add-brand` follows the next `@chassis-ui/tokens`, whose `init` writes the sets of the Chassis token system in place of seven starter sets: the skill names the starter as the layout of `init` 0.15.0 and earlier, and describes a repository fresh from the new `init`, with no `screen` group, option ids that are the names of their sets, and brand sets that declare their switch only. The lint rules it lists are the seven of `lint-source`, and its examples use the brands `acme` and `globex` and the apps `site` and `mobile` of the documentation of both builders, in place of the brands and apps of the Chassis sites.

What an agent now does differently: it reads `base/brand-base` for the names of the brand tokens before it writes the set, where it read a committed brand set; in a repository fresh from `init` it adds the next brand switch to `base/brand-base`, and gives the option the id `brand-<brand>`; and it compares the new brand with an existing brand of the repository by name, where its commands named `chassis`.
