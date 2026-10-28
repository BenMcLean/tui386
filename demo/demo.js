// Shared by every demo page: the theme toggle and the framework switcher. Classic script,
// loaded in <head> after the stylesheets, so the theme is applied before first paint.
// Each page says which framework it is with <html data-framework="...">.
(function () {
	var root = document.documentElement
	var framework = root.dataset.framework
	window.DEMO = { switched: false, fast: new URLSearchParams(location.search).has('fast') }
	var prefersDark = matchMedia('(prefers-color-scheme: dark)')

	// "light" and "dark" are TUI386's names; daisyUI's themes are named tui386 and tui386-dark,
	// and Bootstrap bakes its colors into one stylesheet per theme.
	function stored() { try { return localStorage.getItem('tui386-theme') } catch (e) { return null } }
	function isDark() { var t = stored(); return t ? t === 'dark' : prefersDark.matches }
	function apply() {
		var dark = isDark()
		if (framework === 'daisyui') root.dataset.theme = dark ? 'tui386-dark' : 'tui386'
		else if (framework === 'bootstrap') {
			root.dataset.theme = dark ? 'tui386-dark' : 'tui386'
			document.getElementById('theme-light').disabled = dark
			document.getElementById('theme-dark').disabled = !dark
		} else if (stored()) root.dataset.theme = stored()
	}
	apply()
	prefersDark.addEventListener('change', function () { apply(); label() })

	var toggle
	function label() { if (toggle) toggle.textContent = isDark() ? 'Dark' : 'Light' }

	// Switching frameworks is a page load; carry the scroll position across so that
	// nothing visibly moves.
	try {
		var y = sessionStorage.getItem('tui386-scroll')
		sessionStorage.removeItem('tui386-scroll')
		if (y) {
			history.scrollRestoration = 'manual'
			window.DEMO.switched = true
			addEventListener('load', function () { scrollTo(0, +y) })
		}
	} catch (e) {}

	document.addEventListener('DOMContentLoaded', function () {
		toggle = document.getElementById('theme-toggle')
		toggle.addEventListener('click', function (e) {
			e.preventDefault()
			try { localStorage.setItem('tui386-theme', isDark() ? 'light' : 'dark') } catch (err) {}
			apply()
			label()
		})
		label()
		var names = { tailwind: 'Tailwind', unocss: 'UnoCSS', daisyui: 'daisyUI', bootstrap: 'Bootstrap' }
		var current = document.querySelectorAll('[data-current]')
		for (var j = 0; j < current.length; j++) current[j].textContent = names[framework]
		var links = document.querySelectorAll('[data-switch]')
		for (var i = 0; i < links.length; i++) {
			if (links[i].dataset.switch === framework) links[i].classList.add('active')
			links[i].addEventListener('click', function () {
				try { sessionStorage.setItem('tui386-scroll', String(scrollY)) } catch (err) {}
			})
		}
	})
})()
