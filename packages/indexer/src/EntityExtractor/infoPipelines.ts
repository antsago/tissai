import type { JsonLD } from "../jsonLd.js"
import type { OpenGraph } from "../opengraph.js"
import type { Headings } from "../headings.js"

export type ParsedH = Partial<{
  title: string
  description: string
}>
export function parsedH(headings: Headings): ParsedH {
  return {
    title: headings.title,
    description: headings.description,
  }
}

export type ParsedLd = Partial<{
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
export function parsedLd(jsonLd: JsonLD): ParsedLd {
  const productTag = jsonLd.filter((t) => t["@type"].includes("Product"))[0]

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

export function title(jsonLd: ParsedLd, og: OpenGraph, head: ParsedH) {
  return jsonLd.title ?? og.title ?? head.title
}
