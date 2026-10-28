// Builds dist/tui386.css (framework-free: tokens + components), the adapters and dist/tui386.js
// (a classic-script copy of src/tui386.js, so it works from file:// and without
// a bundler). No dependencies on purpose, so it can't rot.
import fs from 'node:fs'
import { alias } from './alias-css.mjs'
import * as aliases from './aliases.mjs'
fs.mkdirSync('dist', { recursive: true })
const read = f => fs.readFileSync(`src/${f}`, 'utf8')

fs.writeFileSync('dist/tui386.css', read('tokens.css') + '\n' + read('components.css'))
// Tailwind's CLI and PostCSS plugin paste imported CSS into the output without
// rewriting relative url()s, so the font would 404. The Tailwind entry inlines it.
const font = fs.readFileSync('fonts/Px437_IBM_EGA8.otf').toString('base64')
const inlineFont = css => css.replace('url("../fonts/Px437_IBM_EGA8.otf")', `url("data:font/otf;base64,${font}")`)
const adapter = read('tailwind.css').replace(/^@import .*;\n/gm, '')
fs.writeFileSync('dist/tailwind.css', inlineFont(read('tokens.css')) + '\n' + read('components.css') + '\n' + adapter)
// daisyUI and Bootstrap bring their own components, so the adapters override those with the
// TUI386 rules, re-aimed at their class names (see alias-css.mjs). daisyUI is resolved by
// Tailwind from the importing project, so its theme also inlines the font, and it names
// its themes tui386 and tui386-dark instead of light and dark.
// A site can offer TUI386 as one theme among several, so everything here applies only while
// <html data-theme="tui386"> (or "tui386-dark") is set, and nothing leaks into the others.
// The tokens drop their prefers-color-scheme block for the same reason: it would turn every
// other theme on the page dark.
const scope = ':root[data-theme^="tui386"]'
const overlayTokens = read('tokens.css')
	.replace(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\n\}\n/, '')
	.replace(':root:is([data-theme="dark"], [data-theme="tui386-dark"])', ':root[data-theme="tui386-dark"]')
const components = read('components.css')
// Chrome only honors the scrollbar-button states (:vertical:start:decrement...) on the page's own
// scrollbar when the selector has nothing else on it, so these cannot be scoped to the theme with
// a :root[data-theme] prefix. They stay unscoped but inert: the arrows and the hiding come from
// custom properties that only the scoped rule defines, and the scrollbar inherits them from <html>.
const arrow = state => {
	const rule = components.slice(components.indexOf(`::-webkit-scrollbar-button:vertical:${state} {`))
	return rule.slice(rule.indexOf('url('), rule.indexOf(');') + 1)
}
const scrollbarButtons = [
	`${scope} { --tui386-sb-up: ${arrow('start:decrement')}; --tui386-sb-down: ${arrow('end:increment')}; --tui386-sb-hide: none; }`,
	'::-webkit-scrollbar-button:vertical:start:decrement { background-image: var(--tui386-sb-up); }',
	'::-webkit-scrollbar-button:vertical:end:increment { background-image: var(--tui386-sb-down); }',
	'::-webkit-scrollbar-button:vertical:start:increment,',
	'::-webkit-scrollbar-button:vertical:end:decrement,',
	'::-webkit-scrollbar-button:horizontal { display: var(--tui386-sb-hide); }',
].join('\n')
fs.writeFileSync('dist/daisyui.css', [inlineFont(read('daisyui.css')), inlineFont(overlayTokens), alias(components, aliases.daisyui, { scope, layer: 'utilities.tui386', reset: { classes: aliases.resets.daisyui, value: 'revert' } }), scrollbarButtons].join('\n'))
// Bootstrap's own CSS is not in a layer, so ours must not be either. Load it after Bootstrap's.
// Bootstrap hides .dropdown-menu until its JavaScript adds .show; the reset would show it
const dropdowns = ':is(.dropdown, .dropup, .dropend, .dropstart, .btn-group) > .dropdown-menu'
const bootstrapExtras = [
	`${scope} ${dropdowns}:not(.show) { display: none; }`,
	`${scope} ${dropdowns}.show { display: block; position: absolute; z-index: 1000; }`,
	`${scope} :is(.dropdown, .dropup, .dropend, .dropstart, .btn-group) { position: relative; }`,
	// Bootstrap floats legends full width
	`${scope} legend { float: none; width: auto; }`,
	// .nav-tabs gives each link a transparent border and pulls it up over the rule
	`${scope} .nav-tabs .nav-link { border: 0; margin-bottom: 0; }`,
	// .table-bordered draws a border on every row
	`${scope} .table > :not(caption) > * { border: 0; }`,
].join('\n')
fs.writeFileSync('dist/bootstrap.css', [overlayTokens, alias(components, aliases.bootstrap, { unlayered: true, scope, reset: { classes: aliases.resets.bootstrap, value: 'revert' } }), bootstrapExtras, scrollbarButtons].join('\n'))

const js = read('tui386.js')
	.replace(/^export default .*$/m, '')
	.replace(/^export /gm, '')
fs.writeFileSync('dist/tui386.js', `(function () {\n${js}\nwindow.TUI386 = { boot: boot, magicCursor: magicCursor, menus: menus }\n})()\n`)

for (const f of ['tui386.css', 'tailwind.css', 'daisyui.css', 'bootstrap.css', 'tui386.js']) console.log(`dist/${f}`, fs.statSync(`dist/${f}`).size, 'bytes')
