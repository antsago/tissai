import { randomUUID } from "node:crypto"
import { Page } from "./Db/index.js"
import Embedder from "./Embedder/index.js"
import parsePage from "./parsePage.js"

type StructuredData = ReturnType<typeof parsePage>

const EntityExtractor = () => {
  const embedder = Embedder()

  return async ({ jsonLd }: StructuredData, page: Page) => {
    const productTag = jsonLd.filter((t) => t["@type"] === "Product")[0]
    const product = {
      id: randomUUID(),
      title: productTag.name,
      description: productTag.description,
      image: Array.isArray(productTag.image)
        ? productTag.image
        : [productTag.image],
      brandName: productTag?.brand?.name,
      brandLogo: productTag?.brand?.image,
    }
    const offer = {
      id: randomUUID(),
      url: page.url,
      site: page.site,
      product: product.id,
      price: productTag.offers?.price,
      currency: productTag.offers?.priceCurrency,
      seller: productTag.offers?.seller.name,
    }
    const augmented = await embedder.embed(product.title)

    const category = {
      name: augmented.category,
    }
    const tags = augmented.tags.map(t => ({ name: t }))
    const seller = offer.seller ? { name: offer.seller } : undefined
    const brand = product.brandName ? { name: product.brandName, logo: product.brandLogo } : undefined

    return {
      category,
      tags,
      seller,
      brand,
      product: {
        id: product.id,
        title: product.title,
        images: product.image,
        description: product.description,
        brand: brand?.name,
        category: category.name,
        tags: tags.map(t => t.name),
        embedding: augmented.embedding,
      },
      offer,
    }
  }
}

export default EntityExtractor
