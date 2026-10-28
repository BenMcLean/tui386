// Builds site/: the demo, once per CSS framework (the GitHub Pages site). Run after
// build.mjs, which makes dist/. Every page is the same screen written in that
// framework's own classes, so switching between them should change nothing visible.
//   index.html      Tailwind v4        (the source of truth for the page)
//   unocss.html     UnoCSS             (index.html, restyled by UnoCSS: identical markup)
//   daisyui.html    daisyUI 5
//   bootstrap.html  Bootstrap 5.3
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import * as aliases from './aliases.mjs'

const run = cmd => execSync(cmd, { stdio: 'inherit' })
fs.rmSync('site', { recursive: true, force: true })
for (const d of ['css', 'dist', 'fonts']) fs.mkdirSync(`site/${d}`, { recursive: true })

fs.copyFileSync('dist/tui386.css', 'site/dist/tui386.css')
fs.copyFileSync('dist/bootstrap.css', 'site/css/bootstrap-tui386.css')
fs.copyFileSync('demo/layout.css', 'site/css/layout.css')
fs.copyFileSync('dist/tui386.js', 'site/dist/tui386.js')
fs.copyFileSync('fonts/Px437_IBM_EGA8.otf', 'site/fonts/Px437_IBM_EGA8.otf')
fs.copyFileSync('demo/demo.js', 'site/demo.js')
fs.copyFileSync('demo/demo.css', 'site/demo.css')
for (const f of ['index']) fs.copyFileSync(`demo/${f}.html`, `site/${f}.html`)

// UnoCSS reads the Tailwind page, so the two can never drift apart.
fs.writeFileSync('site/unocss.html', fs.readFileSync('demo/index.html', 'utf8')
	.replace('data-framework="tailwind"', 'data-framework="unocss"')
	.replace('<link rel="stylesheet" href="css/tailwind.css">',
		'<link rel="stylesheet" href="dist/tui386.css">\n\t<link rel="stylesheet" href="css/unocss.css">'))

// daisyUI and Bootstrap: the same page again, with each tui386-* class swapped for the framework's
// own equivalent (the same map the adapter uses to aim the TUI386 rules at its components).
const framework = (name, head, translate = c => c) => fs.writeFileSync(`site/${name}.html`, fs.readFileSync('demo/index.html', 'utf8')
	.replace('data-framework="tailwind"', `data-framework="${name}"`)
	.replace('<link rel="stylesheet" href="css/tailwind.css">', head)
	.replace(/class="([^"]*)"/g, (m, classes) => `class="${classes.split(/\s+/).map(c => c.startsWith('tui386-') && aliases[name][c.slice(7)]?.split(/[:[]/)[0] || translate(c)).join(' ')}"`))
framework('daisyui', '<link rel="stylesheet" href="css/daisyui.css">')
// Bootstrap's spacing scale is not 8px, and it has no ms/ml; translate the few utilities the page uses
const bootstrapUtilities = { 'w-full': 'w-100', 'mt-2': 'mt-3', 'mb-2': 'mb-3', 'px-2': 'px-3', 'ml-auto': 'ms-auto' }
framework('bootstrap', [
	'<link id="theme-light" rel="stylesheet" href="css/bootstrap.css">',
	'<link id="theme-dark" rel="stylesheet" href="css/bootstrap-dark.css" disabled>',
	'<link rel="stylesheet" href="css/bootstrap-tui386.css">',
	'<link rel="stylesheet" href="css/layout.css">',
].join('\n\t'), c => bootstrapUtilities[c] || c)

run('npx tailwindcss -i demo/tailwind.css -o site/css/tailwind.css --minify')
run('npx tailwindcss -i demo/daisyui.css -o site/css/daisyui.css --minify')
run('npx unocss site/unocss.html -c demo/uno.config.js -o site/css/unocss.css --preflights')
for (const [src, out] of [['bootstrap', 'bootstrap'], ['bootstrap-dark', 'bootstrap-dark']])
	run(`npx sass --load-path=node_modules --quiet-deps --silence-deprecation=import,global-builtin,color-functions,if-function --no-source-map --style=compressed demo/${src}.scss site/css/${out}.css`)

// GitHub Pages runs Jekyll on anything without this
fs.writeFileSync('site/.nojekyll', '')
