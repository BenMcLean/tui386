/*
 * TUI386.css - UnoCSS adapter (preset-wind4).
 *
 *   // uno.config.js
 *   import { defineConfig, presetWind4 } from 'unocss'
 *   import presetTUI386 from 'tui386/unocss'
 *   export default defineConfig({
 *     presets: [presetWind4({ preflights: { reset: false } }), presetTUI386()],
 *   })
 *
 * Keep wind4's reset off: it is not in a CSS layer, so it would override the
 * padding and borders of TUI386's own (layered) components.
 *
 * and load the stylesheet once, e.g. `import 'tui386'` or <link href="tui386.css">.
 * Like tailwind.css, this maps the --tui386-* tokens onto the framework's theme
 * and nothing else. The components are plain CSS.
 *
 * 1 spacing unit = 8px = 1 column.  2 units = 16px = 1 row.
 */
const colors = {}
for (const name of [
	'black', 'blue', 'green', 'cyan', 'red', 'magenta', 'brown', 'silver', 'gray',
	'bright-blue', 'bright-green', 'bright-cyan', 'bright-red', 'bright-magenta',
	'yellow', 'white',
]) colors[name] = `var(--tui386-${name})`

// One type size. text-xl is a lie we tell for compatibility.
const text = {}
for (const name of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'])
	text[name] = { fontSize: '16px', lineHeight: '16px' }

const noCurves = {}
for (const name of ['DEFAULT', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']) noCurves[name] = '0'

export default function presetTUI386() {
	return {
		name: 'tui386',
		// extendTheme runs after the other presets, so it can drop wind4's defaults
		// (the way `--color-*: initial` does in tailwind.css), not just add to them.
		extendTheme(theme) {
			theme.colors = colors
			theme.text = text
			theme.radius = noCurves
			theme.shadow = { dos: 'var(--tui386-shadow)' }
			theme.dropShadow = {}
			theme.insetShadow = {}
			theme.blur = {}
			theme.tracking = {}
			theme.leading = {}
			theme.fontWeight = { normal: 'normal', bold: 'normal' }
			theme.font = { sans: 'var(--tui386-font)', serif: 'var(--tui386-font)', mono: 'var(--tui386-font)' }
			theme.spacing = { DEFAULT: '8px' }
			// Breakpoints in columns: 72, 96, 120, 144 and 168 of them
			theme.breakpoint = { sm: '576px', md: '768px', lg: '960px', xl: '1152px', '2xl': '1344px' }
		},
		shortcuts: {
			'row-h': 'h-[16px]',
			'col-w': 'w-[8px]',
			'reverse': 'bg-silver text-black',
			'shadow-drop': 'shadow-dos',
		},
		rules: [
			['dither', { background: 'var(--tui386-dither)' }],
			['rule-double', { 'border-top': '4px double currentColor' }],
		],
	}
}
