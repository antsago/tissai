import type { ParsedPage } from "./parsedPage.js"
import he from "he"

export type JsonLD = Partial<{
  title: string
  description: string
  image: string[]
  brandName: string
  brandLogo: string
  offers: Partial<{
    price?: number
    currency?: string
    seller?: string
  }>[]
}>

function expandEntry(linkedData: any): any {
  if (typeof linkedData !== "object") {
    return linkedData
  }
  if (Array.isArray(linkedData)) {
    return linkedData.map((v) => expandEntry(v))
  }

  const properties = Object.entries(linkedData)
    .filter(([key, value]) => value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [
          key,
          value
            .filter((v) => v !== null)
            .map((v) => expandEntry(v))
            .flat(),
        ]
      }

      if (typeof value === "object") {
        return [key, [expandEntry(value)]]
      }

      if (typeof value === "string") {
        // Escapes from self-storage + original escapes
        return [key, [he.decode(he.decode(value))]]
      }

      return [key, [value]]
    })
  return Object.fromEntries(properties)
}

export function parseAndExpand(entries: string[]) {
  return entries
    .map((t) => JSON.parse(t))
    .map(expandEntry)
    .map((t) => (t["@graph"] ? t["@graph"] : t))
    .flat()
}

function jsonLd(parsedPage: ParsedPage): JsonLD {
  const expanded = parseAndExpand(
    parsedPage
      .querySelectorAll('script[type="application/ld+json"]')
      .map((t) => t.rawText),
  )

  const productTag = expanded.filter((t) => t["@type"].includes("Product"))[0]

  return {
    title: productTag?.name[0],
    description: productTag?.description?.[0],
    image: productTag?.image,
    brandName: productTag?.brand?.[0].name[0],
    brandLogo: productTag?.brand?.[0].image?.[0],
    offers: productTag?.offers?.map((offer: any) => ({
      price: offer.price?.[0],
      currency: offer.priceCurrency?.[0],
      seller: offer.seller?.[0].name[0],
    })),
  }
}

export default jsonLd
