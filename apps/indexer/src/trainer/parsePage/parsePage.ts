import { parse } from "node-html-parser"
import { parseAndExpand } from "./parseAndExpand.js"

export type EntityToken = string | symbol | number | boolean

export const parsePage = (body: string) => {
  const page = parse(body)
  const jsonLd = parseAndExpand(
    page
      .querySelectorAll('script[type="application/ld+json"]')
      .map((t) => t.rawText),
  )

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
