import type { ParsedPage } from "./parsedPage.js"
import he from "he"

export type JsonLD = any[]

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

function jsonLd(parsedPage: ParsedPage): JsonLD {
  return parsedPage
    .querySelectorAll('script[type="application/ld+json"]')
    .map((t) => t.rawText)
    .map((t) => JSON.parse(t))
    .map(expandJsonLd)
    .map((t) => (t["@graph"] ? t["@graph"] : t))
    .flat()
}

export default jsonLd
