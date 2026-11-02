# The fonts of a brand

A repository of assets copies fonts and converts nothing by default, so every file the output needs is a file of `source/`, prepared once by hand. The steps below add the fonts of one role of one brand, from a download to the files by role and weight that the builds and the other brands expect; a new brand takes them for each role that has a family of its own in its tokens. They need Git LFS, since fonts are Git LFS files, `pnpm` for the conversion, and the `subset-font` package for the files by weight of a variable font: it is an optional peer dependency of `@chassis-ui/assets`, which a repository of `init` does not install, so `pnpm ls subset-font` that lists nothing means `pnpm add -D subset-font` first, and the change to `package.json` and the lockfile goes into the commit with the fonts. `<web app>` is the app of `chassis.build.apps` whose platform is `web`, and `<native app>` the one with `ios` and `android`; a repository may have only one of the two.

## What a brand holds

Every brand holds all of its fonts, in `source/<brand>/_shared/fonts/` and `source/<brand>/<app>/fonts/`, and `source/_default/` holds none. A file that every app of the brand takes is in `_shared/fonts/` once, and the folder of an app holds what that app alone takes. The brands name their files by role and weight, so a page or an app that reads `fonts/fonts.css` or `ui_normal.ttf` gets the font of the brand it was built for, with no change to its code.

The roles and the weights are those of the font tokens of the brand, `typography.fontFamily.<role>` and `typography.fontWeight.<role>.<weight>` in its token set. The web app takes, for each role that has a family of its own:

| File                                                    | What it is                                                         | In                                |
| ------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| `<role>.woff2`, `<role>-italic.woff2`                   | The variable font, when the family has one, every weight in a file | `source/<brand>/<web app>/fonts/` |
| `<role>-<weight>.woff2`, `<role>-<weight>-italic.woff2` | One file per weight of the role                                    | `source/<brand>/_shared/fonts/`   |
| A `.ttf` beside each `.woff2`                           | The font as TrueType; the web output drops it, the apps take it    | Beside its `.woff2`               |
| `<role>-license.txt`                                    | The license of the family                                          | `source/<brand>/_shared/fonts/`   |
| `fonts.css`                                             | One stylesheet that declares every family of the brand             | `source/<brand>/<web app>/fonts/` |

A role that the tokens set in the family of another role, as `display` in `prose`, has no files for the web: the files of a family are under the role that owns it, and the stylesheet declares the family once.

The native app takes the files by weight and the licenses from `_shared/fonts/`, as `.ttf`, with a `fonts.css` of its own in `source/<brand>/<native app>/fonts/` that declares the files by weight, and no variable file. An app names a font by its file, so the native app has a file for every role and weight in every brand: for a role set in the family of another role, `source/<brand>/<native app>/fonts/` holds copies of the files of that family under the names of the role, each at the weight the role's token gives, with the license of the family under the role's name. The stylesheet declares the family once and does not name the copies.

Three rules keep the brands in step:

- **A brand holds every font it ships.** No font is in `source/_default/`, so a brand gets no font it does not hold, and the font of one brand never reaches the output of another.
- **Same names, same extension.** The file of a role and a weight has one name in every brand. The app fonts are `.ttf` in every brand.
- **The stylesheet and the license go with the family.** Every brand has its own `fonts.css` per app, which declares every family of the brand, and a `<role>-license.txt` beside the files of each family.

The outputs of two brands so differ in the roles that have files and in the variable files: a family without a variable font has no `<role>.woff2`.

## The names

| Part   | Names                                 | Meaning                                                           |
| ------ | ------------------------------------- | ----------------------------------------------------------------- |
| Role   | `ui`, `prose`, `display`, `code`      | Interface text, reading content, headings, monospace              |
| Weight | `elegant`, `normal`, `strong`, `mass` | From the lightest to the heaviest weight of the role              |
| Style  | `-italic` after the weight            | The italic of a weight; a variable font has `<role>-italic.<ext>` |

The numeric weight of a file by weight is the weight of its token's style name, and the style names of fonts follow one scale:

| Style name                  | Weight |
| --------------------------- | ------ |
| `Thin`                      | 100    |
| `ExtraLight`, `Extra Light` | 200    |
| `Light`                     | 300    |
| `Regular`                   | 400    |
| `Medium`                    | 500    |
| `SemiBold`, `Semi Bold`     | 600    |
| `Bold`                      | 700    |
| `ExtraBold`, `Extra Bold`   | 800    |
| `Black`                     | 900    |

The weight in the name of a file is the weight the tokens give the role, not a fixed one: a brand whose tokens give `normal` of `display` the style `Medium` has the Medium of its family in `display-normal`. Lowercase letters, digits and hyphens only, as every file of a repository of assets.

## Read the tokens

Take the family and the weights of the role from the token set of the brand, `typography.fontFamily.<role>` and `typography.fontWeight.<role>.<weight>` of `source/brand-<brand>/brand-base.json` in the repository of tokens. The first family of the family token is the name the stylesheet declares, letter for letter. Each weight token gives, by its style name, the numeric weight of a file by weight. A role whose family token references another role, `{typography.fontFamily.prose}`, has no files for the web and copies for the native app, at the weights of its own tokens.

## Get the files and check the license

Download the family, and unpack it outside `source/`. A download of Google Fonts holds the license, `OFL.txt`, the variable fonts at the top where the family has them, and the files by weight in `static/` where it has those; a family may have only one of the two. A license under the SIL Open Font License, the Apache License or the Ubuntu Font License allows embedding in an app and serving on the web; another license is read, and asked about when it is not clear. The download is not committed: only the files of the next step enter the repository.

Read the first line of the license. A family whose license reserves its name, as `Reserved Font Name "Lora"` in the `OFL.txt` of Lora, gives its files by weight from the download, since a file written from the variable font is a modified version, which the license does not let carry the name; the step that writes the files by weight is skipped for it. Check that the files of `static/` have the version of the variable files, where the download has both.

## Copy the files by role

Copy each file under its role name: a variable file to `source/<brand>/<web app>/fonts/`, and a file by weight and the license to `source/<brand>/_shared/fonts/`. A family with a variable font gives its variable files and its license. For the `ui` role of a brand whose family is Geist:

| File of the download                 | Name in `fonts/` |
| ------------------------------------ | ---------------- |
| `Geist-VariableFont_wght.ttf`        | `ui.ttf`         |
| `Geist-Italic-VariableFont_wght.ttf` | `ui-italic.ttf`  |
| `OFL.txt`                            | `ui-license.txt` |

A family without a variable font gives its files by weight, each under the name of the weight the tokens give it. For a `code` role whose family is Cousine, with `normal` Regular and `strong` Bold:

| File of the download  | Name in `fonts/`   |
| --------------------- | ------------------ |
| `Cousine-Regular.ttf` | `code-normal.ttf`  |
| `Cousine-Bold.ttf`    | `code-strong.ttf`  |
| `OFL.txt`             | `code-license.txt` |

A family with a reserved name gives both its variable files and its files by weight from `static/`, each under the name of the weight the tokens give it, and each italic beside it: for a `prose` role in Lora whose `elegant` is `Medium`, `Lora-Medium.ttf` becomes `prose-elegant.ttf` and `Lora-MediumItalic.ttf` becomes `prose-elegant-italic.ttf`.

## Write the files by weight

For a family with a variable font and no reserved name, write each file by weight from the variable file of its style, with `chassis-assets static-font`. Give it the variable file, the files to write, a `.ttf` and a `.woff2`, and the weight the tokens give the name. For `ui-strong` of a role whose `strong` is 600:

```shell
docs=source/<brand>/<web app>/fonts
shared=source/<brand>/_shared/fonts
npx chassis-assets static-font $docs/ui.ttf $shared/ui-strong.ttf $shared/ui-strong.woff2 wght=600
npx chassis-assets static-font $docs/ui-italic.ttf $shared/ui-strong-italic.ttf $shared/ui-strong-italic.woff2 wght=600
```

The command writes the font as it is at that weight, without an axis, to each file, and prints, for each file, its path, the names it gave it and the weight: `source/<brand>/_shared/fonts/ui-strong-italic.ttf: Geist SemiBold Italic, Geist-SemiBoldItalic, weight 600`, the second name the PostScript name an iOS app loads the font by. The file keeps every glyph, every character and every layout feature of the variable font, and the same command on the same file gives the same bytes. One call per weight and style of the role: four weights with an italic each are eight calls.

An axis that is not named is fixed at its default. Name the optical size too, as `wght=600 opsz=14`, when its default is not the cut the brand shows; take the value that `axes` of `chassis.subset` in `package.json` fixes for the brand, where it fixes one ([images.md](./images.md#the-build-configuration)). On a Mac, the names inside a file say which font it is: `mdimport -t -d2 <file> 2>&1 | grep -A 2 -E 'name_(family|postscript)'`.

## Write the other WOFF2 files

The step above writes the `.woff2` of each file by weight. Write a `.woff2` beside each other `.ttf` of the role, the variable files in `source/<brand>/<web app>/fonts/` and the files by weight of a download in `source/<brand>/_shared/fonts/`, with the WOFF2 encoder of Google as a package, once in each folder that has such a file:

```shell
cd source/<brand>/<web app>/fonts   # then the same in source/<brand>/_shared/fonts
for f in <role>*.ttf; do
  [ -f "${f%.ttf}.woff2" ] || pnpm --package=wawoff2@2.0.1 dlx woff2_compress.js "$f" "${f%.ttf}.woff2"
done
```

The conversion keeps every character, every layout feature and the axes of a variable font, and the same command on the same file gives the same bytes. Do not subset here, and fix no axis of a variable file: a file of `source/` has every character of its family, and a build with `--subset` writes the smaller files of a release.

## Write the stylesheet

`fonts.css` of the web app is one file per brand. It starts with a comment that names the brand and the roles without files, and has a block per role with a family of its own. A block starts with a comment that names the family and the weights by role, and has one `@font-face` rule per file it declares. The comments below are the form; where the committed brand words its comments otherwise, its wording is followed, with the names of the new brand. For a family with a variable font, one rule per variable file, with the range of weights the file holds, which is the `wght` axis of the file and which the page of the family on Google Fonts shows:

```css
/* The fonts of the <Brand> brand: the variable font of each family, or its files by weight where it has none. */
/* One @font-face rule per file, under the family name that the typography tokens of the brand name. */
/* The "display" role is set in the "prose" family and has no files of its own. */

/* Geist, the "ui" family of the <Brand> brand. */
/* A variable font: every weight from 100 to 900, in one file per style. */
/* Weights by role: elegant 300, normal 400, strong 600, mass 700. */

@font-face {
  font-family: "Geist";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("ui.woff2") format("woff2");
}

@font-face {
  font-family: "Geist";
  font-style: italic;
  font-weight: 100 900;
  font-display: swap;
  src: url("ui-italic.woff2") format("woff2");
}
```

For a family without a variable font, one rule per file by weight, with the weight of the role:

```css
/* Cousine, the "code" family of the <Brand> brand. */
/* The family has no variable font: one file per weight. */
/* Weights by role: normal 400, strong 700. */

@font-face {
  font-family: "Cousine";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("code-normal.woff2") format("woff2");
}
```

`font-family` is the first family of the token, letter for letter. A brand that changes one family writes its block again and keeps the blocks of its other families.

## Fill the native app folder

The native app takes the files by weight and the licenses of `source/<brand>/_shared/fonts/`, and copies none of them. Its stylesheet, `source/<brand>/<native app>/fonts/fonts.css`, declares the files by weight, one rule per file with the `.woff2` name as the committed brand's does, also for a family that has a variable font, under comments of the same form. For a role set in the family of another role, copy the `.ttf` files of that family, and only those, into `source/<brand>/<native app>/fonts/` under the names of the role at the weights of the role's tokens, with the license as `<role>-license.txt`: a `display` role in the `prose` family at `elegant` Regular and `normal` Medium has `display-elegant.ttf` as a copy of `prose-normal.ttf` and `display-normal.ttf` as a copy of `prose-elegant.ttf`, when `prose` has `elegant` Medium and `normal` Regular. The stylesheet does not name the copies.

## Compare with another brand

The three font folders of a brand hold the names of the other brands:

```shell
diff <(command ls source/chassis/_shared/fonts) <(command ls source/<brand>/_shared/fonts)
diff <(command ls source/chassis/<web app>/fonts) <(command ls source/<brand>/<web app>/fonts)
diff <(command ls source/chassis/<native app>/fonts) <(command ls source/<brand>/<native app>/fonts)
```

`command ls` lists the names alone, also in a shell that has an alias for `ls`. The commands print the files of a role that one of the two brands sets in the family of another role, and the variable files of a family that has none; every other line is a file under the wrong name, or one that is missing. Fix the names before the build, since the output has the same names.

## Build and check

Run the checks of a change to `source/`, from the root of the repository:

```shell
npx chassis-assets lint-source
npx chassis-assets build && npx chassis-assets verify
```

The lint opens each font that a stylesheet declares, and fails when the rule names another family, weight or style than the file has: a file under the wrong role name, or a stylesheet that was not written again with its fonts. The `.ttf` of a declared `.woff2` is checked against the same rule, and the two against each other: the lint fails when they differ in the family, the weight, the style, the axes, the version or the number of glyphs, as they do when one of the two was not written again.

Then check the output:

- The web output of the brand has the font names of its source, without the `.ttf` files. Against a committed brand, `diff <(command ls dist/web/<web app>/chassis/fonts) <(command ls dist/web/<web app>/<brand>/fonts)` prints what the comparison of the source printed for `_shared` and the web app, less the `.ttf` files.
- The stylesheets load their fonts, when the client has a browser. Write a page outside the repository that links `<path to dist>/web/<web app>/<brand>/fonts/fonts.css` and sets text in each family at the weights of the roles and in italic, serve the folder that holds both with `python3 -m http.server --directory <folder>`, and open it: every face of `document.fonts` has the status `loaded`, and no request of a font fails. Nothing is written into `dist/` for it. Without a browser, the summary names the check as not done.
- The fonts are Git LFS files: `git check-attr filter` on a new `.ttf` and `.woff2` answers `filter: lfs`.

A font that changes its family changes the PostScript name an iOS app loads it by, and a renamed or removed file breaks the consumer that names it: both go into the changelog entry the summary drafts.
