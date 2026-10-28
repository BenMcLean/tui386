// Screenshots every demo page (npm run build:demo first) and compares each framework's page
// with the Tailwind one, in both themes. They are the same screen in different classes, so
// any difference is an adapter bug. Exits 1 if one differs by more than MAX pixels, and
// leaves the screenshots and a diff image per page in parity/ for inspection.
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const MAX = Number(process.env.PARITY_MAX_PIXELS) || 0
const pages = { tailwind: 'index', unocss: 'unocss', daisyui: 'daisyui', bootstrap: 'bootstrap' }
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.otf': 'font/otf' }
const root = path.join(process.cwd(), 'site')

const server = http.createServer((req, res) => {
	const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))
	fs.readFile(file.startsWith(root) ? file : root, (err, data) => {
		if (err) { res.writeHead(404).end(); return }
		res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data)
	})
}).listen(0)
await new Promise(r => server.once('listening', r))
const base = `http://localhost:${server.address().port}`

fs.rmSync('parity', { recursive: true, force: true })
fs.mkdirSync('parity')
// real scrollbars are part of the look, and headless Chromium hides them by default
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] })
const shots = {}
for (const theme of ['light', 'dark']) {
	const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
	await page.addInitScript(t => localStorage.setItem('tui386-theme', t), theme)
	for (const [name, file] of Object.entries(pages)) {
		await page.goto(`${base}/${file}.html?fast`)
		await page.waitForTimeout(500)
		// the only things that are meant to differ: which framework link is highlighted and its name
		await page.addStyleTag({ content: '[data-switch] { visibility: hidden; }' })
		await page.evaluate(() => document.querySelectorAll('[data-current]').forEach(e => { e.textContent = 'Framework' }))
		shots[`${theme}-${name}`] = await page.screenshot({ path: `parity/${theme}-${name}.png`, fullPage: true, animations: 'disabled' })
	}
	await page.close()
}
await browser.close()
server.close()

let failed = false
for (const theme of ['light', 'dark']) {
	const a = PNG.sync.read(shots[`${theme}-tailwind`])
	for (const name of Object.keys(pages).slice(1)) {
		const b = PNG.sync.read(shots[`${theme}-${name}`])
		if (a.width !== b.width || a.height !== b.height) {
			console.log(`FAIL ${theme} ${name}: page is ${b.width}x${b.height}, Tailwind's is ${a.width}x${a.height}`)
			failed = true
			continue
		}
		const diff = new PNG({ width: a.width, height: a.height })
		const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 })
		fs.writeFileSync(`parity/${theme}-${name}-diff.png`, PNG.sync.write(diff))
		const bad = n > MAX
		if (bad) failed = true
		console.log(`${bad ? 'FAIL' : 'ok  '} ${theme} ${name}: ${n} pixels differ`)
	}
}
process.exit(failed ? 1 : 0)
