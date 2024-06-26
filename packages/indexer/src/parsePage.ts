import { HTMLElement, parse } from "node-html-parser"
import he from "he"
import type { Page } from "@tissai/db"

type Headings = Partial<{
  title: string
  description: string
  keywords: string
  author: string
  robots: string
  canonical: string
}>
type OpenGraph = Record<`og:${string}`, string>

export type StructuredData = {
  jsonLd: any[]
  opengraph: OpenGraph
  headings: Headings
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

      if (typeof value === "string") {
        // Escapes from self-storage + original escapes
        return [key, [he.decode(he.decode(value))]]
      }

      return [key, [value]]
    })
  return Object.fromEntries(properties)
}

function parsedPage(page: Page): HTMLElement {
  return parse(page.body)
}

function jsonLd(parsedPage: HTMLElement): any[] {
  return parsedPage
    .querySelectorAll('script[type="application/ld+json"]')
    .map((t) => t.rawText)
    .map((t) => JSON.parse(t))
    .map(expandJsonLd)
    .map((t) => (t["@graph"] ? t["@graph"] : t))
    .flat() 
}

function headings(parsedPage: HTMLElement): Headings {
  return {
    title: parsedPage.querySelector("title")?.textContent,
    description: parsedPage
      .querySelector('meta[name="description"]')
      ?.getAttribute("content"),
    keywords: parsedPage
      .querySelector('meta[name="keywords"]')
      ?.getAttribute("content"),
    author: parsedPage.querySelector('meta[name="author"]')?.getAttribute("content"),
    robots: parsedPage.querySelector('meta[name="robots"]')?.getAttribute("content"),
    canonical: parsedPage
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href"),
  }
}

function opengraph(parsedPage: HTMLElement): OpenGraph {
  return Object.fromEntries(
    parsedPage
      .querySelectorAll('meta[property^="og:"]')
      .map((t) => [t.getAttribute("property"), t.getAttribute("content")]),
  )
}

function parsePage(page: Page): StructuredData {
  const root = parsedPage(page)

  return {
    jsonLd: jsonLd(root),
    headings: headings(root),
    opengraph: opengraph(root),
  }
}

export default parsePage
