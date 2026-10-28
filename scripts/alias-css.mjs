// Re-targets TUI386's component CSS at another framework's class names, so the adapters
// can override that framework's own components with the exact same rules (one source of
// truth, no copies to drift). Every selector that mentions a .tui386-* class gets an
// extra selector with the framework's class in its place:
//   .tui386-btn:hover  ->  .tui386-btn:hover, .btn:hover
// Classes without an entry in the map stay as they are.
//
// options:
//   unlayered  strips the @layer wrappers, for frameworks (Bootstrap) whose own CSS is not
//              in a layer: layered rules always lose to unlayered ones, so ours have to
//              be unlayered to win.
//   layer      puts the components in this layer instead of the components layer. daisyUI keeps
//              its own CSS in sublayers of Tailwind's utilities layer, so a sublayer of utilities
//              declared after them (utilities.tui386) beats daisyUI but still loses to the
//              utilities themselves (mt-2, w-full). The base layer (plain tag rules) is left alone.
//   reset      { classes, value }: before any of our rules, `all: value` on these framework
//              classes (and their ::before/::after), to wipe whatever the framework's own rule
//              sets that ours doesn't mention (display, padding...). Use revert-layer when the
//              framework's CSS is layered and revert when it is not. The scope is wrapped in
//              :where() so the reset has the lowest specificity and every rule of ours beats it.
//   scope      a selector for <html> that every rule is limited to, so the overrides only
//              apply while the page has picked this theme and a site's other themes
//              keep working. `html` becomes the scope; anything else is nested under it.

// Split on commas that are not inside (), as in :not(a, b)
function splitSelectors(s) {
	const out = []
	let depth = 0, cur = ''
	for (const c of s) {
		if (c === '(') depth++
		if (c === ')') depth--
		if (c === ',' && depth === 0) { out.push(cur.trim()); cur = '' } else cur += c
	}
	if (cur.trim()) out.push(cur.trim())
	return out
}

const scopeSelector = (sel, scope) => {
	if (!scope) return sel
	if (/^html(?![\w-])/.test(sel)) return scope + sel.slice(4)
	if (sel.startsWith('#tui386-boot-wrap')) return sel
	// the page's own scrollbar belongs to <html>, which a descendant selector never reaches
	if (sel.startsWith('::-webkit-scrollbar')) return `${scope}${sel},\n${scope} ${sel}`
	return `${scope} ${sel}`
}

function transform(css, map, opts) {
	let out = ''
	let i = 0
	while (i < css.length) {
		const open = css.indexOf('{', i)
		if (open < 0) { out += css.slice(i); break }
		let depth = 1, j = open + 1
		while (depth > 0 && j < css.length) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++ }
		const prelude = css.slice(i, open).trim()
		const body = css.slice(open + 1, j - 1)
		if (prelude.startsWith('@layer')) {
			const inner = transform(body, map, opts)
			// only the components go in the framework's layer; plain tag rules stay in base so
			// that utilities still beat them
			const name = opts.layer && prelude === '@layer components' ? '@layer ' + opts.layer : prelude
			out += opts.unlayered ? inner : `${name} {\n${inner}\n}\n`
		} else if (prelude.startsWith('@media') || prelude.startsWith('@supports')) {
			out += `${prelude} {\n${transform(body, map, opts)}\n}\n`
		} else if (prelude.startsWith('@')) {
			out += `${prelude} {${body}}\n`
		} else {
			const selectors = splitSelectors(prelude)
			const all = [...selectors]
			for (const sel of selectors) {
				const variant = sel.replace(/\.tui386-([a-z0-9-]+)/g, (m, name) => map[name] ? `.${map[name]}` : m)
				if (variant !== sel) all.push(variant)
			}
			out += `${all.map(s => scopeSelector(s, opts.scope)).join(',\n')} {${body}}\n`
		}
		i = j
	}
	return out
}

export function alias(css, map, { unlayered = false, scope = '', layer = '', reset = null } = {}) {
	let head = ''
	if (reset) {
		const sels = reset.classes.flatMap(c => [`.${c}`, `.${c}::before`, `.${c}::after`]).map(s => scope ? `:where(${scope}) ${s}` : s)
		// the revert also undoes the border-box rule from the base layer, which our sizes assume
		const rule = `${sels.join(',\n')} {\n\tall: ${reset.value};\n\tbox-sizing: border-box;\n}\n`
		head = unlayered || !layer ? rule : `@layer ${layer} {\n${rule}}\n`
	}
	return head + transform(css.replace(/\/\*[\s\S]*?\*\//g, ''), map, { unlayered, scope, layer }).replace(/\n{3,}/g, '\n\n')
}
