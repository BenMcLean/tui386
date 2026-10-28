// Tiny static file server for the built demo (site/): `npm run build:demo` then `npm run serve`, then open the URL.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.otf': 'font/otf' }
const port = Number(process.env.PORT) || 8386
const root = path.join(process.cwd(), 'site')

http.createServer((req, res) => {
	const url = new URL(req.url, 'http://x')
	let file = path.join(root, decodeURIComponent(url.pathname))
	if (!file.startsWith(root)) { res.writeHead(403).end(); return }
	if (file.endsWith(path.sep)) file += 'index.html'
	fs.readFile(file, (err, data) => {
		if (err) { res.writeHead(404).end('not found'); return }
		res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data)
	})
}).listen(port, () => console.log(`http://localhost:${port}/  (add ?fast to skip the boot animation)`))
