import { parse } from "node-html-parser"
import { Page } from "./Db/index.js"

export type StructuredData = {
  jsonLd: any[]
  opengraph: Record<`og:${string}`, string>
  headings: Partial<{
    title: string
    description: string
    keywords: string
    author: string
    robots: string
    canonical: string
  }>
}

function expandJsonLd(linkedData: any): any {
  if (typeof linkedData !== "object") {
    return linkedData
  }
  if (Array.isArray(linkedData)) {
    return linkedData.map((v) => expandJsonLd(v))
  }

  const properties = Object.entries(linkedData)
    .filter(([key, value]) => value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [
          key,
          value
            .filter((v) => v !== null)
            .map((v) => expandJsonLd(v))
            .flat(),
        ]
      }

      if (typeof value === "object") {
        return [key, [expandJsonLd(value)]]
      }

      return [key, [value]]
    })
  return Object.fromEntries(properties)
}

function parsePage(page: Page): StructuredData {
  const root = parse(page.body)
  const jsonLd = root
    .querySelectorAll('script[type="application/ld+json"]')
    .map((t) => t.textContent)
    .map((t) => JSON.parse(t))
    .map(expandJsonLd)
    .map(t => t["@graph"] ? t["@graph"] : t)
    .flat()

  const headings = {
    title: root?.querySelector("title")?.textContent,
    description: root
      ?.querySelector('meta[name="description"]')
      ?.getAttribute("content"),
    keywords: root
      ?.querySelector('meta[name="keywords"]')
      ?.getAttribute("content"),
    author: root?.querySelector('meta[name="author"]')?.getAttribute("content"),
    robots: root?.querySelector('meta[name="robots"]')?.getAttribute("content"),
    canonical: root
      ?.querySelector('link[rel="canonical"]')
      ?.getAttribute("href"),
  }

  const opengraph = Object.fromEntries(
    root
      .querySelectorAll('meta[property^="og:"]')
      .map((t) => [t.getAttribute("property"), t.getAttribute("content")]),
  )

  return {
    jsonLd,
    headings,
    opengraph,
  }
}

export default parsePage
