import type { ParsedPage } from "./parsedPage.js"

export type OpenGraph = Partial<{
  title: string
  description: string
  image: string[]
}>
function opengraph(parsedPage: ParsedPage): OpenGraph {
  const entries = Object.fromEntries(
    parsedPage
      .querySelectorAll('meta[property^="og:"]')
      .map((t) => [t.getAttribute("property"), t.getAttribute("content")]),
  )

  if (entries["og:type"] !== "product") {
    return {}
  }

  return {
    title: entries["og:title"],
    description: entries["og:description"],
    image: entries["og:image"] ? [entries["og:image"]] : undefined,
  }
}

export default opengraph
