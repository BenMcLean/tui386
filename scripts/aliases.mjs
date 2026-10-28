// tui386 class (without the prefix) -> the framework's class that should look like it.
export const daisyui = {
	'btn': 'btn', 'btn-primary': 'btn-primary', 'btn-success': 'btn-success', 'btn-info': 'btn-info',
	'btn-warning': 'btn-warning', 'btn-danger': 'btn-error', 'btn-lg': 'btn-lg', 'btn-block': 'btn-block',
	'label': 'badge', 'label-success': 'badge-success', 'label-danger': 'badge-error',
	'label-info': 'badge-info', 'label-warning': 'badge-warning', 'badge': 'badge-neutral',
	'alert': 'alert', 'alert-success': 'alert-success', 'alert-info': 'alert-info', 'alert-danger': 'alert-error',
	'input': 'input', 'select': 'select', 'textarea': 'textarea', 'check': 'checkbox', 'radio': 'radio', 'range': 'range',
	'field-label': 'label',
	'window': 'card', 'window-title': 'card-title',
	'menu': 'menu', 'menu-header': 'menu-title',
	'tabs': 'tabs', 'tab': 'tab',
	'table': 'table', 'table-hover': 'table-hover', 'table-striped': 'table-zebra',
	'breadcrumb': 'breadcrumbs',
	'progress': 'progress',
	'modal': 'modal-box', 'modal-header': 'modal-title', 'modal-body': 'modal-body', 'modal-footer': 'modal-action',
}

export const bootstrap = {
	'btn': 'btn', 'btn-primary': 'btn-primary', 'btn-success': 'btn-success', 'btn-info': 'btn-info',
	'btn-warning': 'btn-warning', 'btn-danger': 'btn-danger', 'btn-lg': 'btn-lg', 'btn-block': 'w-100',
	'label': 'badge',
	'alert': 'alert', 'alert-success': 'alert-success', 'alert-info': 'alert-info', 'alert-danger': 'alert-danger',
	'alert-title': 'alert-heading',
	// Bootstrap uses one class for several controls, so these say which element they mean
	'input': 'form-control:not(textarea)', 'select': 'form-select', 'textarea': 'form-control:is(textarea)',
	'check': 'form-check-input[type="checkbox"]', 'radio': 'form-check-input[type="radio"]', 'range': 'form-range',
	'field-label': 'form-label',
	'window': 'card', 'window-title': 'card-header',
	'menu': 'dropdown-menu', 'menu-header': 'dropdown-header', 'menu-divider': 'dropdown-divider',
	'tabs': 'nav-tabs', 'tab': 'nav-link',
	'table': 'table', 'table-bordered': 'table-bordered', 'table-hover': 'table-hover', 'table-striped': 'table-striped',
	'breadcrumb': 'breadcrumb',
	'progress': 'progress', 'progress-bar': 'progress-bar',
	'modal': 'modal-content', 'modal-header': 'modal-header', 'modal-body': 'modal-body', 'modal-footer': 'modal-footer',
	'navbar': 'navbar', 'navbar-brand': 'navbar-brand',
}

// The framework classes that are whole components (not variants or utilities): these get
// wiped back to the browser's defaults before the TUI386 rules are applied.
export const resets = {
	daisyui: ['btn', 'badge', 'alert', 'input', 'select', 'textarea', 'label', 'card', 'card-title', 'menu', 'menu-title',
		'tabs', 'tab', 'table', 'breadcrumbs', 'progress', 'modal-box', 'modal-action'],
	bootstrap: ['btn', 'badge', 'alert', 'alert-heading', 'form-control', 'form-select', 'form-check-input',
		'form-label', 'card', 'card-header', 'dropdown-menu', 'dropdown-header', 'dropdown-divider', 'nav-tabs', 'nav-link',
		'table', 'breadcrumb', 'progress', 'progress-bar', 'modal-content', 'modal-header', 'modal-body', 'modal-footer',
		'navbar', 'navbar-brand'],
}
