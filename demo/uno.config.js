// UnoCSS config for the demo page only. Real users follow the README.
import { defineConfig, presetWind4 } from 'unocss'
import presetTUI386 from '../src/unocss.js'

export default defineConfig({
	presets: [presetWind4({ preflights: { reset: false } }), presetTUI386()],
})
