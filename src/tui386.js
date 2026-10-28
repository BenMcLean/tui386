/*
 * TUI386.css - optional behavior.
 * A dependency-free port of BOOTSTRA.386's dos.js / bootstrap-386.js.
 *
 *   import { boot, magicCursor } from './tui386.js'
 *   boot({ onePass: true, speedFactor: 1.25 })
 *   magicCursor()
 *
 * For the boot sequence to not flash the page first, put this in <head>
 * (it only takes effect when JS runs, so no-JS visitors still get the page):
 *
 *   <script>document.documentElement.classList.add('tui386-boot')</script>
 */

const CELL = { w: 8, h: 16 }
const BLOCK = '▄' // ▄

/**
 * The loading sequence: a blue curtain is raised one character at a time from
 * the bottom right, then a cursor flies across the revealed page (twice,
 * unless onePass).
 *
 * options:
 *   fastLoad    skip everything                            (default false)
 *   onePass     skip the second, cursor-only fly-by        (default false)
 *   speedFactor bigger is faster                           (default 1)
 */
export function boot({ fastLoad = false, onePass = false, speedFactor = 1 } = {}) {
	const root = document.documentElement
	const reveal = () => root.classList.remove('tui386-boot')

	const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	if (fastLoad || reduced) {
		reveal()
		return Promise.resolve()
	}

	const width = window.innerWidth
	const height = window.innerHeight

	const wrap = document.createElement('div')
	const bar = wrap.appendChild(document.createElement('div'))
	const cursor = document.createElement('div')
	wrap.id = 'tui386-boot-wrap'
	bar.id = 'tui386-boot-bar'
	cursor.id = 'tui386-boot-cursor'
	cursor.textContent = bar.textContent = BLOCK

	document.body.appendChild(wrap)
	reveal() // the curtain is in place, the page behind it can exist now

	// Cells to consume per millisecond, proportional to window area so big
	// screens don't take forever and small ones aren't over in a blink.
	const msPerPass = 1400 / speedFactor
	const cellsPerMs = (cols, rows) => (cols * rows) / msPerPass

	let pass = 0
	let rowStep = CELL.h
	let column = width
	let row = height - CELL.h
	let rate = cellsPerMs(width / CELL.w, height / CELL.h)

	return new Promise(resolve => {
		let last = performance.now()

		const finish = () => {
			wrap.remove()
			cursor.remove()
			resolve()
		}

		const frame = now => {
			let budget = Math.max(1, (now - last) * rate)
			last = now

			while (budget-- > 0) {
				column -= CELL.w
				if (column <= 0) {
					column = width
					row -= rowStep
				}
				if (row <= 0) {
					pass++
					row = height - CELL.h
					if (pass === 2 || (pass === 1 && onePass)) return finish()
					if (pass === 1) {
						wrap.remove()
						document.body.appendChild(cursor)
						rate /= 2
						rowStep = CELL.h * 4
					}
				}
			}

			if (pass === 0) {
				bar.style.width = column + 'px'
				wrap.style.height = row + 'px'
			} else {
				cursor.style.right = column + 'px'
				cursor.style.bottom = row + 'px'
			}
			requestAnimationFrame(frame)
		}

		requestAnimationFrame(frame)
	})
}

/**
 * Replace the mouse pointer with a character cell that snaps to the 8x14 grid.
 * Returns a function that puts the real pointer back.
 */
export function magicCursor() {
	if (document.querySelector('.tui386-cursor')) return () => {}

	const el = document.body.appendChild(document.createElement('div'))
	el.className = 'tui386-cursor'
	document.documentElement.classList.add('tui386-cursor-on')

	const move = e => {
		el.style.left = Math.floor(e.pageX / CELL.w) * CELL.w + 'px'
		el.style.top = Math.floor(e.pageY / (CELL.h - 2)) * (CELL.h - 2) + 'px'
	}
	document.addEventListener('mousemove', move, { passive: true })

	return () => {
		document.removeEventListener('mousemove', move)
		document.documentElement.classList.remove('tui386-cursor-on')
		el.remove()
	}
}

/**
 * Make .tui386-menubar menus behave like DOS ones: Escape, a click outside or a
 * click on a menu item closes the open menu, and moving the pointer across the
 * bar while a menu is open opens the one under it. The bar works without this;
 * it just stays open until you click its title again.
 * Returns a function that removes the listeners.
 */
export function menus() {
	const bar = '.tui386-menubar'
	const closeAll = () => document.querySelectorAll(bar + ' details[open]').forEach(d => d.removeAttribute('open'))

	const click = e => {
		const inside = e.target.closest(bar + ' details')
		const item = e.target.closest('.tui386-menu a, .tui386-menu button, .tui386-menu-item')
		if (!inside || item) closeAll()
	}
	const key = e => {
		if (e.key !== 'Escape') return
		const open = document.querySelector(bar + ' details[open] > summary')
		closeAll()
		if (open) open.focus()
	}
	const over = e => {
		const summary = e.target.closest(bar + ' summary')
		if (!summary || !document.querySelector(bar + ' details[open]')) return
		summary.parentElement.setAttribute('open', '')
	}
	document.addEventListener('click', click)
	document.addEventListener('keydown', key)
	document.addEventListener('pointerover', over)

	return () => {
		document.removeEventListener('click', click)
		document.removeEventListener('keydown', key)
		document.removeEventListener('pointerover', over)
	}
}

export default { boot, magicCursor, menus }
