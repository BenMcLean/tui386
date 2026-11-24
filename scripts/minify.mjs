// Writes .min versions of the files a site can link to directly (run after build.mjs), so the
// minified bytes are what gets published, hashed for SRI and checked by the parity test.
// tailwind.css and daisyui.css are inputs for the project's own Tailwind build, not stylesheets
// to link, so they are not minified. No syntax lowering (no targets), only whitespace and
// rule/value shortening.
import fs from 'node:fs'
import { transform as css } from 'lightningcss'
import { rolldown } from 'rolldown'

for (const f of ['tui386', 'bootstrap']) {
	const { code } = css({ filename: `dist/${f}.css`, code: fs.readFileSync(`dist/${f}.css`), minify: true })
	fs.writeFileSync(`dist/${f}.min.css`, code)
}
// rolldown is already in the tree through vite; one file in, so it only minifies
const bundle = await rolldown({ input: 'dist/tui386.js', treeshake: false, logLevel: 'warn' })
fs.writeFileSync('dist/tui386.min.js', (await bundle.generate({ format: 'iife', minify: true })).output[0].code)

for (const f of ['tui386.min.css', 'bootstrap.min.css', 'tui386.min.js']) {
	const [raw, min] = [f.replace('.min', ''), f].map(n => fs.statSync(`dist/${n}`).size)
	console.log(`dist/${f}`, min, 'bytes', `(${Math.round(100 * min / raw)}% of ${raw})`)
}
