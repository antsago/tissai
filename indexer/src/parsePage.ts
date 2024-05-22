import { parse } from "node-html-parser"
import { Page } from "./Db/index.js"

function parsePage(page: Page) {
  const root = parse(page.body)
  const jsonLd = root
    .querySelectorAll('script[type="application/ld+json"]')
    .map((t) => t.textContent)
    .map((t) => JSON.parse(t))

  const headings = {
    title: root?.querySelector("title")?.textContent,
    description: root?.querySelector('meta[name="description"]')?.getAttribute("content"),
    keywords: root?.querySelector('meta[name="keywords"]')?.getAttribute("content"),
    author: root?.querySelector('meta[name="author"]')?.getAttribute("content"),
    robots: root?.querySelector('meta[name="robots"]')?.getAttribute("content"),
    canonical: root?.querySelector('link[rel="canonical"]')?.getAttribute("href"),
  }

  const opengraph = Object.fromEntries(root.querySelectorAll('meta[property^="og:"]').map(t => [t.getAttribute('property'), t.getAttribute('content')]))

  return {
    url: page.url,
    jsonLd,
    headings,
    opengraph,
  }
}

export default parsePage
