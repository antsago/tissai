import type { StructuredData } from "./parsePage.js"
import { randomUUID } from "node:crypto"
import { Page } from "./Db/index.js"
import Embedder from "./Embedder/index.js"

const EntityExtractor = () => {
  const embedder = Embedder()

  return async ({ jsonLd }: StructuredData, page: Page) => {
    const productTag = jsonLd.filter((t) => t["@type"] === "Product")[0]

    const structuredInfo = {
      title: productTag.name,
      description: productTag.description,
      image: Array.isArray(productTag.image)
        ? productTag.image
        : [productTag.image],
      brandName: productTag?.brand?.name,
      brandLogo: productTag?.brand?.image,
      price: productTag.offers?.price,
      currency: productTag.offers?.priceCurrency,
      seller: productTag.offers?.seller.name,
    }
    const derivedInfo = await embedder.embed(structuredInfo.title)

    const category = {
      name: derivedInfo.category,
    }
    const tags = derivedInfo.tags.map(t => ({ name: t }))

    const seller = structuredInfo.seller ? { name: structuredInfo.seller } : undefined
    const brand = structuredInfo.brandName ? { name: structuredInfo.brandName, logo: structuredInfo.brandLogo } : undefined

    const product = {
      id: randomUUID(),
      title: structuredInfo.title,
      images: structuredInfo.image,
      description: structuredInfo.description,
      brand: brand?.name,
      category: category.name,
      tags: tags.map(t => t.name),
      embedding: derivedInfo.embedding,
    }

    const offer = {
      id: randomUUID(),
      url: page.url,
      site: page.site,
      product: product.id,
      price: structuredInfo.price,
      currency: structuredInfo.currency,
      seller: seller?.name,
    }

    return {
      category,
      tags,
      seller,
      brand,
      product,
      offer,
    }
  }
}

export default EntityExtractor
