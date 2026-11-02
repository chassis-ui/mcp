# The tokens of a brand

A repository of tokens holds Tokens Studio files in `source/`, synced with Figma by the designer, and `@chassis-ui/tokens` builds them into `dist/<platform>/<app>/<brand>/`, which is committed. A brand is three things in it: a token set, an option of the `brand` group that selects the set, and its name in `chassis.build` of `package.json`. The names below are those of `base/brand-base`, the set every brand builds on; a committed brand set of the repository, `source/brand-<brand>/brand-base.json`, is the example to read first, since it shows which tokens the repository's brands change. Every path is relative to the root of the repository, and every command runs there.

## The files of the repository

| File                             | Holds                                                                                                    | Written by                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `source/$themes.json`            | The options of the groups `brand`, `theme`, `app` and `screen`, each with its token sets and Figma ids   | Tokens Studio; one option inserted by hand |
| `source/$metadata.json`          | `tokenSetOrder`, the order in which a later set overrides an earlier one                                 | Tokens Studio; one name added by hand      |
| `source/<group>/<set>.json`      | A token set, in the DTCG form: `$type` and `$value` on every token                                       | Tokens Studio, or by hand                  |
| `package.json`                   | `chassis.build`: the `brands`, `themes`, `screens` and `apps` with their platforms that the build writes | By hand                                    |
| `dist/<platform>/<app>/<brand>/` | The output of `build`, committed                                                                         | `npx chassis-tokens build`                 |
| `Package.swift`                  | One library per app and brand with an iOS platform                                                       | `npx chassis-tokens swift-package`         |

A set that no option selects takes no part in a build; `chassis.build` names only options that `$themes.json` has, spelled as the option spells them.

## The two layouts

A repository of tokens has one of two layouts, and the committed brand tells which:

- **The Chassis layout**, the one `chassis-ui/website-tokens` has and the documentation of Chassis Tokens describes, which the rest of this file assumes: sets in folders, `base/` with `brand-base`, `metric-source`, `metric-base` and the sets of the themes, apps and screens, and `brand-<brand>/brand-base.json` for each brand, which declares what the brand changes over `base/brand-base`.
- **The starter of `init`**, one set per option at the top of `source/`, `brand-<brand>.json`, `app-<app>.json`, `theme-<theme>.json`, `screen-<screen>.json`, with no base set and no switch; the id of an option is the name of its set. A new brand is a copy of the committed brand set, `source/brand-<brand>.json`, with every value the brand changes, since the set is the whole brand; its option is the committed brand's with the new set, `{ "id": "brand-<brand>", "name": "<brand>", "group": "brand", "selectedTokenSets": { "brand-<brand>": "enabled" } }`, inserted after it; its set name goes after the committed brand's in `tokenSetOrder`; and the name goes into `chassis.build.brands`. The commands below are the same.

A repository that grew from the starter may have moved to the Chassis layout, or to one of its own: in either case the committed brand set, the option that selects it and its place in `tokenSetOrder` are the shape to copy, and the names in the set are the names of the brand tokens of that repository.

## The token set of the brand

`source/brand-<brand>/brand-base.json` declares the tokens the brand changes, under the names they have in `base/brand-base`, and nothing else. The set that comes later in `tokenSetOrder` wins, so a declared token replaces the base value and an undeclared one keeps it. Style Dictionary logs each replacement as a token collision in every build; they are expected.

| Group                                     | Declares                                                                                                                                           | `$type`        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `figma.switch.brand.mode-<n>`             | `"true"` for the switch of the brand, see below                                                                                                    | `boolean`      |
| `color.base.primitive.light.<color>.base` | The base color of each palette color the brand changes: `primary`, `secondary`, `neutral`, `danger`, `success`, `warning`, `info`, as a hex value  | `color`        |
| `typography.fontFamily.<role>`            | The families of `ui`, `prose`, `display` and `code`: the font first, its fallbacks after it, or a reference to the role whose family the role uses | `fontFamilies` |
| `typography.fontWeight.<role>.<weight>`   | The style name of `elegant`, `normal`, `strong` and `mass` for each role, as the font spells it: `Light`, `Regular`, `SemiBold`, `Bold`            | `fontWeights`  |
| `borderRadius.base.context.<step>`        | A step of the radius scale, as a reference to a step of `dimension.base.*`; only when the brand changes the scale                                  | `borderRadius` |
| `borderRadius.base.<component>.<part>`    | The radius of a component, as a reference to a step of `borderRadius.base.context.*`; only when the brand changes it                               | `borderRadius` |

The table is not closed: a committed brand set may declare other groups, such as `typography.letterSpacing.context.*` or `typography.fontFamily.icon`, and the new set declares one of them under the same names where the brand changes it. The committed sets of `chassis-ui/website-tokens` also restate values they do not change, the whole radius scale and every context weight among them; that is not the rule, and the new set leaves out what it does not change. Declare the weights of every role, those of a role in another family too, as the style names of that family at the weights the role uses: the files of the native app are copied at those weights.

The steps of a palette color, `05` to `95` and the transparent steps, stay in `base/brand-base`: they reference the `base` token with a color modifier, so they follow. The dark palette references the light one there too, so the set declares the light bases only. A `contrast` beside a `base`, the color of text on that color, is declared only when the brand's base needs another than the base set gives it, as a reference to `{color.base.primitive.light.black.base}` or `{color.base.primitive.light.white.base}`.

`base/brand-base` and the committed brand sets also declare `typography.fontFamily.context.<context>` and `typography.fontWeight.context.<context>`, the family and the weight of the text contexts `jumbo`, `hero`, `heading`, `lead`, `blockquote`, `cite`, `body`, `title` and `label`, each as a reference to a role: `{typography.fontFamily.display}`, `{typography.fontWeight.prose.normal}`, or `{typography.fontWeight.prose.normal} Italic`. A brand that maps a context to another role than `base/brand-base` does declares that context, with the reference of the brand; one that keeps the mapping of the base set declares none of them.

A set in its smallest form, for a brand that keeps the radius and maps its `display` role to its `prose` family:

```json
{
  "figma": {
    "switch": {
      "brand": {
        "mode-<n>": { "$type": "boolean", "$value": "true" }
      }
    }
  },
  "color": {
    "base": {
      "primitive": {
        "light": {
          "primary": { "base": { "$type": "color", "$value": "#7A2E6F" } },
          "secondary": { "base": { "$type": "color", "$value": "#241E1C" } }
        }
      }
    }
  },
  "typography": {
    "fontFamily": {
      "ui": { "$type": "fontFamilies", "$value": "'Geist', system-ui, sans-serif" },
      "prose": { "$type": "fontFamilies", "$value": "'Lora', ui-serif, serif" },
      "display": { "$type": "fontFamilies", "$value": "{typography.fontFamily.prose}" },
      "code": { "$type": "fontFamilies", "$value": "'Cousine', ui-monospace, monospace" }
    },
    "fontWeight": {
      "ui": {
        "elegant": { "$type": "fontWeights", "$value": "Light" },
        "normal": { "$type": "fontWeights", "$value": "Regular" },
        "strong": { "$type": "fontWeights", "$value": "SemiBold" },
        "mass": { "$type": "fontWeights", "$value": "Bold" }
      }
    }
  }
}
```

The weights of `prose`, `display` and `code` follow in the same form. A family token holds a list in CSS form, the font of the brand first; the stylesheet of the repository of assets declares that first name letter for letter. A weight token holds the style name, with or without the space between its words, as the files of the family spell it; `Italic` may follow it. The build reads the name as its number and `lint-source` refuses a name it does not know.

### The visibility switch

`figma.switch.brand.mode-<n>` is a boolean that Figma binds to the visibility of a layer that only one brand shows, such as a logo: it is `"true"` in the set of one option and `"false"` in every other, because `base/brand-base` declares every switch as `"false"` and the set of each brand sets its own. The new brand takes the first `mode-<n>` that no set selected by an option of the `brand` group sets to `"true"`: read every such set, not only those of `brand-*/`, since in `chassis-ui/website-tokens` the option `default` selects `base/brand-default`, which sets `mode-1`. When `base/brand-base` has no switch of that number, add it there as `"false"` first; a group can hold more switches than options, and a switch without an option is `"false"` in every mode. The build writes no boolean to any platform, so the switch changes no output.

## The option of the brand

An option of `$themes.json` is a list of token sets with their statuses, and the build and the lint read the sets of the options of every group. Every committed option of the `brand` group selects the same three base sets and adds its brand set last:

```json
{
  "id": "<forty hexadecimal characters, unlike every other id of the file>",
  "name": "<brand>",
  "selectedTokenSets": {
    "base/metric-source": "source",
    "base/metric-base": "source",
    "base/brand-base": "enabled",
    "brand-<brand>/brand-base": "enabled"
  },
  "group": "brand"
}
```

Insert it after the last option of the `brand` group, which comes before the options of the other groups and not at the end of the file, so the group stays together, and write it with the keys above and no other. The committed options also carry `$figmaCollectionId`, `$figmaModeId`, `$figmaVariableReferences` and `$figmaStyleReferences`; those are the ids the export writes, and the new option gets them when the designer exports it (see [the export to Figma](#the-export-to-figma)). An id is any string the file does not have, in the form of the committed ones: forty hexadecimal characters in a repository Tokens Studio synced, the name of the set in the starter of `init`, and `node -e "console.log(require('node:crypto').randomBytes(20).toString('hex'))"` prints one of that form.

`source` and `enabled` both build; they differ in Figma only, where an `enabled` set becomes Variables and a `source` set resolves references and creates nothing. Copy the statuses as the committed options have them.

## The set order

Add `brand-<brand>/brand-base` to `tokenSetOrder` of `$metadata.json` after the last set of the other brands, which come after `base/brand-base`. The order is what lets the brand set override the base set; a brand set listed before `base/brand-base` would be overridden by it, and the lint does not say so.

## The build configuration

Add the name to `chassis.build.brands` of `package.json`, spelled as the option spells it:

```json
"chassis": {
  "build": {
    "brands": ["chassis", "sinefil", "<brand>"]
  }
}
```

The build then writes one folder per platform and app of `chassis.build.apps` for the brand, `dist/<platform>/<app>/<brand>/`, with the same files as the committed brands. A brand that is an option of Tokens Studio only, as `default`, `demo-a` and `demo-b` are in `chassis-ui/website-tokens`, is left out of `brands` and is not built.

## The commands and what they report

A repository that `chassis-tokens init` wrote has the scripts `lint`, `build`, `verify`, `diff`, `swift-package`, `swift-package:check`, `archive` and `release-notes` in its `package.json`, which call the commands below; `npx chassis-tokens <command>` runs the same command from the root of any repository of tokens, and `--help` prints the options of each.

| Command                            | What it does, and what to read in its output                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx chassis-tokens lint-source`   | Checks the token files that the options select; `✅ Token source lint passed: <n> token sets` when they pass. A message is `<set>: <token> <message> [<rule>]`; the rules that a new brand set trips are `name-format` (a character outside letters, digits and single hyphens, or a name that starts with a digit), `token-type` (a token without `$value` or `$type`), `font-weight` (a style name the build does not know) and `font-weight-family` (a weight that belongs to another family than the role leads to)             |
| `npx chassis-tokens build`         | Writes `dist/`, and writes the timestamp line of every committed file again, so the files of the other brands show as modified in `git status`; `verify` ignores that line and they go into the commit. `No token sets for <brand>_<app>_<theme>_<screen> in source/$themes.json` means `chassis.build` names a brand that is not an option, or spells it otherwise. `--brand <brand>` builds the new brand alone, `--dry-run` prints the plan                                                                                      |
| `npx chassis-tokens verify`        | Fails when a fresh build differs from the committed `dist/`, ignoring the version and the timestamp of the file headers. After `build` it passes; it is what CI runs                                                                                                                                                                                                                                                                                                                                                                |
| `npx chassis-tokens diff`          | The token names added, removed and changed in value between two outputs, by platform and file, in Markdown; `--base <ref or dir>` is `main` by default. For a new brand it lists the files of the brand as added, and nothing removed or changed in another brand; a second table lists the asset files, the icon catalog and the drawables of the new brand, as added. A line removed or changed in another brand is a token that the set declared under a wrong name, or a set order that lets the new set override another brand |
| `npx chassis-tokens swift-package` | Writes `Package.swift` again, with a library for the new brand in every app with an iOS platform; `--check` fails while the file differs from `chassis.build`. The Android libraries need no such step                                                                                                                                                                                                                                                                                                                              |

The output of the brand is compared with that of a committed brand, platform by platform: the same files, in the same folders, and a value that differs only where the set declares a token or a token references one it declares. `diff <(command ls dist/web/<app>/chassis) <(command ls dist/web/<app>/<brand>)` prints nothing when the files match; `command ls` lists the names alone, also in a shell that has an alias for `ls`.

## The export to Figma

The skill writes the source; the designer gives the brand to Figma, and only then are the Variables of the brand in the library that the design files use. What that step needs, said in the summary:

1. In the Figma file that holds the Variables, pull the latest tokens in the Tokens Studio plugin: the plugin lists the new set and the new option.
2. Export the styles and Variables to Figma again, with the new option selected: it becomes a Mode of the `brand` Collection, and the plugin writes `$figmaCollectionId`, `$figmaModeId` and the references into the option of `$themes.json` at the next push. That push is the designer's commit, and the skill does not predict its content.
3. Keep `color.base.*` and `borderRadius.base.*` hidden from publishing, as the other brands' are, and publish the library.
4. Bind the layers that only the new brand shows, such as its logo, to `figma/switch/brand/mode-<n>`, the switch of [the token set](#the-visibility-switch).

A design file then shows the brand by switching the Mode of the `brand` Collection; `chassis-create-design` never sets a mode itself.

## The release

A release of the repository is a push to `main` with a new version in `package.json`: the workflow lints, verifies, builds the archives and the Android libraries, publishes to npm where the repository publishes, and makes the tag and the GitHub release with the changelog entry of the version as its body; without that entry the release stops. The version and the entry are the maintainer's, in one commit with `dist/` built at that version. The skill drafts the entry in its summary from the output of `diff`: the brand added, the files of `dist/` it adds, by platform and app, and the Swift library and the archive names a consumer takes, `<name>-<platform>-<app>-<brand>-<version>.zip` with the name of `package.json` without its scope.
