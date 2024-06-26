import type { JsonLD } from "../jsonLd.js"
import type { OpenGraph } from "../opengraph.js"
import type { Headings } from "../headings.js"

export type ParsedOG = Partial<{
  title: string
  description: string
  image: string[]
}>
export function parsedOg(opengraph: OpenGraph): ParsedOG {
  if (opengraph["og:type"] !== "product") {
    return {}
  }

  return {
    title: opengraph["og:title"],
    description: opengraph["og:description"],
    image: opengraph["og:image"] ? [opengraph["og:image"]] : undefined,
  }
}

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
    brandName: productTag?.brand?.[0].name[0]?.toLowerCase(),
    brandLogo: productTag?.brand?.[0].image?.[0],
    offers: productTag?.offers?.map((offer: any) => ({
      price: offer.price?.[0],
      currency: offer.priceCurrency?.[0],
      seller: offer.seller?.[0].name[0]?.toLowerCase(),
    })),
  }
}

export function title(jsonLd: ParsedLd, og: ParsedOG, head: ParsedH) {
  return jsonLd.title ?? og.title ?? head.title
}
