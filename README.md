# TUI386.CSS

[![npm](https://img.shields.io/npm/v/tui386)](https://www.npmjs.com/package/tui386)

Make your webpages look like they're from the gentler, less distracting time of the 1980s.
The successor to [BOOTSTRA.386](https://github.com/kristopolous/BOOTSTRA.386), built to survive dependency bumps.

## Why This Exists

[BOOTSTRA.386](https://github.com/kristopolous/BOOTSTRA.386) was the primary inspiration but it has to be redone for every new Bootstrap version. Impressive, but unmaintainable.

[TuiCss](https://github.com/vinibiavatti1/TuiCss) is nice and might have worked for what I needed, but it comes with its own class names, so a site built on it is stuck with it.

Here's how TUI386.CSS is different:
- Build your site on Tailwind, UnoCSS, daisyUI or Bootstrap, or on your own CSS and add TUI386 for the look. The look lives in plain CSS and thin adapters make every framework appear [the exact same](https://homestar.wiki/wiki/The_Exact_Same).
- A dependency upgrade should, in theory, be only a version bump.
- Every TUI386 class is prefixed `tui386-`, so it won't collide with your own CSS.
- If the madness subsides and you want to adopt a look more in keeping with the third millennium then it should be easy to swap out for another theme.

## Demo

https://benmclean.github.io/tui386/ is the same page built four times, once per framework (Tailwind, UnoCSS, daisyUI, Bootstrap). Switch between them from the menu bar; the screen should not change. The Tailwind and UnoCSS pages share their markup. The daisyUI and Bootstrap pages are generated from it by swapping each `tui386-*` class for that framework's own (`tui386-btn` becomes `btn`), so they test that the adapters' overrides really do turn the framework's components into TUI386's. `npm run check:parity` compares them pixel by pixel, and a difference beyond its limit is a bug in an adapter.

## Design

| file | what it is | depends on |
|---|---|---|
| `src/tokens.css` | the 16 EGA colors, the blue and black themes, font, 8x16 cell grid, shadow, dither (`--tui386-*` custom properties) | nothing |
| `src/components.css` | `tui386-btn`, `tui386-alert`, `tui386-window`, `tui386-navbar`, `tui386-tabs`, `tui386-menu`, `tui386-table`, `tui386-modal`, forms... | tokens |
| `src/tailwind.css` | Tailwind v4 adapter: maps the tokens onto `@theme` | Tailwind v4 |
| `src/unocss.js` | UnoCSS adapter: a preset that maps the tokens onto the theme | UnoCSS (`preset-wind4`) |
| `src/daisyui.css` | daisyUI 5 theme (`tui386`, `tui386-dark`), plus `components.css` re-aimed at daisyUI's class names | daisyUI 5 + Tailwind v4 |
| `src/bootstrap.scss` | Bootstrap 5.3 adapter: sets Bootstrap's Sass variables. `dist/bootstrap.css` (built) re-aims `components.css` at Bootstrap's class names | Bootstrap 5.3 + Sass |
| `src/tui386.js` | optional boot animation and grid-snapping cursor | nothing |

Every component class is prefixed `tui386-`, so it can sit next to Bootstrap, DaisyUI or your own CSS without colliding. Only the adapters know about a framework. The components are plain CSS, so a Tailwind major
release touches only the adapters.

## Use it

Any site, no build step:

```html
<link rel="stylesheet" href="dist/tui386.css">
```

Tailwind v4:

```css
@import "tailwindcss";
@import "tui386/tailwind";
```

The screen is a grid of 8x16 pixel cells, and `--spacing` is 8px: **1 unit = 1 column, 2 units = 1 row**.
`mb-2` is a blank line, `px-1` is a space. All type is one size; `text-xl` is accepted and ignored.

UnoCSS (`preset-wind4`):

```js
// uno.config.js
import { defineConfig, presetWind4 } from 'unocss'
import presetTUI386 from 'tui386/unocss'
export default defineConfig({
	presets: [presetWind4({ preflights: { reset: false } }), presetTUI386()],
})
```

Turn off wind4's reset (`reset: false`). It is not in a CSS layer, so it would flatten the padding and borders on TUI386's components. Load `tui386` (its `dist/tui386.css`) once for the components. Same palette and spacing as the Tailwind adapter.

daisyUI 5 (Tailwind v4):

```css
@import "tailwindcss";
@plugin "daisyui";
@import "tui386/daisyui";
```

This adds two daisyUI themes, `tui386` and `tui386-dark`. Pick one with `<html data-theme="tui386">`. While it is picked, daisyUI's own `btn`, `card`, `alert`, `input`, `menu`, `table` and the rest are overridden outright and look exactly like TUI386's own components: its rules are re-aimed at daisyUI's class names, so a `btn` looks like a `tui386-btn`. Your other daisyUI themes are untouched, so TUI386 can be one choice among several. Neither theme is the default or follows the OS setting; that choice stays with your site.

Add `@import "tui386/tailwind"` as well for the EGA utility colors and the 8px grid.

Bootstrap 5.3 (Sass):

```scss
@import "bootstrap/scss/functions";
$tui386-font-path: "../node_modules/tui386/fonts"; // relative to the CSS you output
@import "tui386/src/bootstrap";
@import "bootstrap/scss/bootstrap";
```

Compile with `sass --load-path=node_modules`. Bootstrap's compiled CSS hardcodes its brand colors in a hundred places, so the only way to re-theme it fully is to change its Sass variables before it is built. That is all this file does. For one screen per build, that is enough to get the colors.

To make Bootstrap's components (`btn`, `alert`, `form-control`, `dropdown-menu`, `table`...) look exactly like TUI386's, also load the overlay after Bootstrap's CSS, and set the theme on `<html>`:

```html
<link rel="stylesheet" href="bootstrap.css">
<link rel="stylesheet" href="node_modules/tui386/dist/bootstrap.css">   <!-- or: import 'tui386/bootstrap-components' -->
<html data-theme="tui386">   <!-- or "tui386-dark" -->
```

The overlay only applies while `data-theme` is `tui386` or `tui386-dark`, so a site can switch to it from its own theme. Sass bakes colors in at compile time, so the dark screen needs a second compiled stylesheet (import `tui386/src/bootstrap-dark` instead of `tui386/src/bootstrap`); the overlay itself follows `data-theme`.

Boot animation. Put the first line in `<head>` to avoid a flash of page; if the script never runs, the page reveals itself after 3 seconds instead of staying blank:

```html
<script>document.documentElement.classList.add('tui386-boot')</script>
<script src="dist/tui386.js"></script>   <!-- classic script, works from file:// too -->
<script>
	TUI386.boot({ onePass: false, speedFactor: 1 })   // or { fastLoad: true }
	TUI386.magicCursor()
</script>
```

Or as an ES module: `import { boot, magicCursor } from './src/tui386.js'`.

## Themes

Two DOS-era screens: the blue of EDIT, QBasic and Turbo Pascal (default), and gray on black like the DOS prompt. The black one follows `prefers-color-scheme: dark`. Force either with `<html data-theme="light">` or `<html data-theme="dark">` (here "light" means the blue one).

The themes only differ in four tokens, so everything else is the same EGA colors in both:

| token | light | dark |
|---|---|---|
| `--tui386-bg` | blue | black |
| `--tui386-inset` (code, pre, wells, table stripes) | black | blue |
| `--tui386-shadow-color` | black | gray (black would vanish) |
| `--tui386-fg` | silver | silver |

Override any of them to make your own screen. daisyUI gets two themes, `tui386` and `tui386-dark`. Bootstrap picks one per build by importing `bootstrap` or `bootstrap-dark`, and its overlay follows `data-theme="tui386"` or `"tui386-dark"`. Tailwind and UnoCSS need nothing extra: the components follow the tokens.

## Develop

```
npm install
npm run build        # dist/: tui386.css, tailwind.css, daisyui.css, tui386.js (no dependencies)
npm run build:demo   # also builds site/, the four demo pages (gitignored)
npm run check:parity # screenshots the four pages and fails if any differs from the Tailwind one (needs `npx playwright install chromium` once)
npm run serve        # http://localhost:8386/ serves site/
```

`demo/` holds the page sources. `site/` is generated and is deployed to GitHub Pages by `.github/workflows/pages.yml` when a version tag is pushed. Add `?fast` to a demo URL to skip the boot animation.

## Not ported (yet)

BOOTSTRA.386's `scrollLock` and `centerNudger` helpers, and its jQuery-era JS plugins.
Use native `<dialog>` for modals.

## Credits

Font: Px437 IBM EGA 8x14 by VileR, [CC BY-SA 4.0](https://int10h.org/oldschool-pc-fonts/). Look and feel from [BOOTSTRA.386](https://github.com/kristopolous/BOOTSTRA.386) by kristopolous, with additional design inspiration from [TuiCss](https://github.com/vinibiavatti1/TuiCss) by vinibiavatti1.
