const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {},
	},
	plugins: [plugin(({ addBase }) => addBase({
    '[type="search"]': {outline: "2px solid transparent", outlineOffset: "2px"},
    '[type="search"]::-webkit-search-decoration': {display: 'none'},
    '[type="search"]::-webkit-search-cancel-button': {display: 'none'},
    '[type="search"]::-webkit-search-results-button': {display: 'none'},
    '[type="search"]::-webkit-search-results-decoration': {display: 'none'},
  }))],
}
