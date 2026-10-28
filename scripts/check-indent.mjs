// Enforces tabs for indentation. `npm run lint` reports offenders; `npm run lint -- --fix`
// converts them. YAML and JSON are exempt (YAML forbids tabs; npm rewrites
// package*.json with spaces), as is generated output in dist/.
import fs from 'node:fs'
import path from 'node:path'

const exts = new Set(['.css', '.js', '.mjs', '.html', '.md'])
const skip = new Set(['node_modules', 'dist', '.git', 'fonts'])
const fix = process.argv.includes('--fix')

function* walk(dir) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (skip.has(e.name)) continue
		const p = path.join(dir, e.name)
		if (e.isDirectory()) yield* walk(p)
		else if (exts.has(path.extname(p))) yield p
	}
}

let bad = 0
for (const file of walk('.')) {
	const text = fs.readFileSync(file, 'utf8')
	// Each pair of leading spaces is one indent level; an odd leftover space is
	// comment-continuation alignment and stays.
	const out = text.replace(/^( {2,})/gm, s => '\t'.repeat(s.length >> 1) + (s.length & 1 ? ' ' : ''))
	if (out === text) continue
	bad++
	if (fix) fs.writeFileSync(file, out)
	else console.log(`space-indented: ${file}`)
}
if (bad && !fix) { console.error(`${bad} file(s) use spaces; run: npm run lint -- --fix`); process.exit(1) }
if (fix) console.log(`fixed ${bad} file(s)`)
