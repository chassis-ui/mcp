// A fixture for build/tests/generate-css-classes.test.mjs
const SELECTOR_MODAL = '[data-cx-toggle="modal"]'
const SELECTOR_COLLAPSE = "[data-cx-toggle=\"collapse\"]"
const target = (element) => element.getAttribute('data-cx-target')
const dismiss = '[data-cx-dismiss]'
export { SELECTOR_MODAL, SELECTOR_COLLAPSE, target, dismiss, SELECTOR_MODAL as again }
