# The images, the app icon and the configuration of a brand

A repository of assets is file-driven: a designer adds a file to `source/<brand>/<app>/<type>/` and the build copies it to `dist/<platform>/<app>/<brand>/` with the name and the format of each platform, with no list to update beside the files. The images and the app icon of a new brand are the designer's exports, placed under the names the committed brands use, so that a site or an app reads the same names whichever brand it is built for. Then the brand enters `chassis.build`, and the files its consumers read enter `chassis.checks.json`. `<web app>` and `<native app>` are the apps of `chassis.build.apps` with the platform `web`, and `ios` and `android`, respectively, and `<existing brand>` is a brand of `chassis.build.brands` before the new one, the brand to compare with; every path is relative to the root of the repository.

## The layout

```text
source/
├── _default/                  the files every brand gets, unless a brand has its own
│   ├── _shared/<type>/        of every app
│   └── <app>/<type>/          of one app
└── <brand>/
    ├── _shared/<type>/        the files of every app of the brand: its logos, its fonts
    └── <app>/<type>/          the files of one app of the brand
```

A brand file replaces the default file of the same path, subfolder included, and an app file replaces the shared file. A name that starts with `_` is no brand and no app. Any folder name is a type; the types the builds know are `fonts/`, `images/`, `icons/` and a folder of app icon bundles, by convention `app-icon/`. A file that a brand does not hold comes from `_default/`: a new brand gets every default image and icon as it is, and holds only what differs.

## The images of the web app

The web app of a Chassis site reads its images by name, so the brand holds, under `source/<brand>/<web app>/images/`, the same names as the committed brands. In `chassis-ui/website-assets` they are:

| File                                                       | What it is                                                                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `site-logo.svg`                                            | The logo the navigation and the footer inline                                                                                   |
| `site-logomark.svg`                                        | The mark alone, where a page needs one                                                                                          |
| `favicon.svg`, `favicon.ico`, `favicon.png`                | The favicon, as the vector, the legacy file and a PNG                                                                           |
| `favicon-16x16.png`, `favicon-32x32.png`                   | The favicon at its sizes                                                                                                        |
| `apple-touch-icon.png`                                     | 180 by 180, for iOS home screens                                                                                                |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | The icons of the web manifest, and `android-chrome-512x512-maskable.png` beside them where the manifest asks for a maskable one |
| `social-image.png`                                         | The card of a shared link                                                                                                       |
| `safari-pinned-tab.png`                                    | The pinned-tab icon of Safari                                                                                                   |

and under `source/<brand>/<web app>/other/`, `manifest.json`, the web manifest, which names the brand, its colors and the icons above by a path relative to itself (`../images/android-chrome-192x192.png`). Read the export before placing it: `name`, `short_name`, `theme_color` and `background_color` are the brand's, and a value of another brand in them is reported in the summary for the designer, not changed and not passed over. The repository of the task may name them otherwise: the list of a committed brand, `ls source/<committed brand>/<web app>/images`, is the list to match, and `contracts` of `chassis.checks.json` says which of them a consumer reads.

The logos that every app of the brand takes are in `source/<brand>/_shared/images/logo/`: `logo-black`, `logo-dark`, `logo-light` and `logo-white`, each as `.svg` and `.png`, in the committed brands. An image that differs between the light and the dark mode is two files with the mode at the end of the name, and the app chooses between them. An image is named in lowercase with hyphens, after what it shows, and a raster image an app shows comes with its `@2x` and `@3x` variants, which the design tool adds to the names by itself; the web and iOS keep the indicator and Android sorts the variants into its density folders. The build resizes nothing and re-encodes nothing by default: every variant is an export.

## The app icon

An app icon is a bundle, one per platform, which the build copies whole to the platform that takes it and renames to snake_case: a folder that ends in `.icon` for iOS, as Icon Composer saves it, with `icon.json` and the SVG or PNG files it names in `Assets/`; and a folder that ends in `.adaptive` for Android, with the SVG layers `background.svg`, `foreground.svg` and `monochrome.svg` of an adaptive icon, drawn on a square of 108 by 108 dp with the mark inside the center circle of 66 dp. The two bundles live in a folder of their own under the native app, `source/<brand>/<native app>/app-icon/`, beside `fonts/` and `images/`, never under `images/` or `icons/`, and both have the name the committed brands give them, `app-icon.icon` and `app-icon.adaptive`: the app reads one icon name, `app_icon`, whichever brand it is built for.

A brand replaces a bundle whole, so a brand bundle holds every file of the icon and not only the ones that differ. Keep `icon.json` and the files of `Assets/` as Icon Composer wrote them: a renamed file is a layer the app cannot find. The names of the layer files differ from brand to brand, since the designer names them, and the comparison of the native output with a committed brand shows that difference; a layer file named after another brand is reported for the designer, as the manifest is. The source lint reads each bundle: an `.icon` bundle needs its `icon.json` and a file in `Assets/` for every layer it names, an `.adaptive` bundle needs `background.svg` and `foreground.svg` with a square `viewBox` each and takes no file of another name, and one without `monochrome.svg` is a warning. The web gets no bundle; its favicons are the images above.

An icon the designer has not drawn yet is left out, and the summary says so: the brand then takes the default bundle of `source/_default/<native app>/app-icon/`, where one exists, and no bundle otherwise.

## The build configuration

Add the name of the brand to `chassis.build.brands` of `package.json`:

```json
"chassis": {
  "build": {
    "brands": ["acme", "globex", "<brand>"],
    "apps": { "site": ["web"], "mobile": ["ios", "android"] }
  }
}
```

The build then writes `dist/<platform>/<app>/<brand>/` for each app and its platforms. Where a variable font of the brand has an axis that its pages are not to show, such as the optical size `opsz` of Inter, add the brand and the value to `axes` of `chassis.subset`, as `"axes": { "<brand>": { "opsz": 14 } }`: a build with `--subset` fixes it, and the files by weight were written at the same value ([fonts.md](./fonts.md#write-the-files-by-weight)). A brand whose fonts have a weight axis only needs no entry.

## The contracts

`chassis.checks.json` lists, under `contracts`, the files of each job that a consumer reads by name, keyed `<platform>/<app>/<brand>`, so that `verify` fails when a file a site or an app relies on is missing from the output. Add the jobs of the new brand: copy the entries of a committed brand, change the key, and keep the `reader` of each entry as the sentence that says who reads the files and why, since that is what a later change checks against. An entry whose reader is a consumer that will not build with the new brand is left out, and a job that no consumer reads needs no entry; a reader that is not known is kept, since the new brand is built for the same consumers as the committed one until the maintainer says otherwise.

```json
"web/site/<brand>": [
  {
    "reader": "the root layout of <the site>, which links the stylesheet and inlines the logo",
    "files": ["fonts/fonts.css", "images/site-logo.svg"]
  }
]
```

`lint.allow` of the same file is not touched: an entry there lets a file past the source lint, and a file of a new brand that trips the lint is renamed instead.

## Git LFS

Fonts and raster images, `.ttf`, `.otf`, `.woff`, `.woff2`, `.png`, `.jpg`, `.webp`, are Git LFS files, by the `.gitattributes` that `chassis-assets init` wrote; SVG, CSS, JSON and text files are committed as they are, and so is `favicon.ico`, whose extension the attributes do not list. `git lfs install` once on the machine, then `git check-attr filter <file>` on each new font and raster image answers `filter: lfs`; one that answers otherwise has an extension the attributes do not cover, and is not committed as a plain file: the extension is added to `.gitattributes`, as the committed brands have it. A pointer file, a few lines of text where a font or an image should be, is a checkout without its LFS content, not a file to read or to copy.

## Build and check

From the root of the repository:

```shell
npx chassis-assets lint-source
pnpm build:release
npx chassis-assets verify
```

The lint checks the names and the layout of `source/`: lowercase letters, digits and hyphens, a type folder under an app, a bundle whole, a font that its stylesheet describes. `build:release`, the script `init` writes, is the build with the asset catalogs of iOS, the `res/` folder and the vector drawables of Android, and whatever else the repository adds to it; it writes `dist/`, which is not committed. `npx chassis-assets build` is the plain build, which copies only; `--brand <brand>` builds the new brand alone and `--dry-run` prints the jobs without writing. `verify` runs the validator, every file of `source/` against the output, and then the contract check of `chassis.checks.json`; after a plain build it says `no res/ for the <n> file(s) of a build with --res` and leaves those contracts unchecked, which is why the release build comes first. `npx chassis-assets analyze` reports the sizes, the types and the duplicates of `source/` and of `dist/`, which shows a file placed twice.

Then compare the output of the brand with that of a committed brand, job by job: `diff <(cd dist/web/<web app>/<existing brand> && find . | sort) <(cd dist/web/<web app>/<brand> && find . | sort)` prints the files one brand holds and the other does not, which for a new brand should be the files of the roles each brand sets in another family and nothing else. On the native jobs, the bundle is `app_icon.icon` and `app_icon.adaptive`, and the fonts are `<role>_<weight>.ttf`.

A release is a push to `main` with a new version in `package.json` and its entry in the changelog of the repository, built with `build:release` by the workflow, which attaches one `<name>-<platform>-<app>-<brand>-<version>.zip` per job to the GitHub release. The version and the entry are the maintainer's; the summary drafts the entry, which names the files of `dist/` the brand adds, by job, and the archives a consumer of the brand takes.
