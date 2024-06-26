import type { ParsedPage } from "./parsedPage.js"

export type OpenGraph = Record<`og:${string}`, string>

function opengraph(parsedPage: ParsedPage): OpenGraph {
  return Object.fromEntries(
    parsedPage
      .querySelectorAll('meta[property^="og:"]')
      .map((t) => [t.getAttribute("property"), t.getAttribute("content")]),
  )
}

export default opengraph
