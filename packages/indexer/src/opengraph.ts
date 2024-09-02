import { type HTMLElement } from "node-html-parser"

export type OpenGraph = Partial<{
  title: string
  description: string
  image: string[]
}>
function opengraph(parsedPage: HTMLElement): OpenGraph {
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
