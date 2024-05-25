import type { StructuredData } from "../parsePage.js"
import { dirname } from "node:path"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"
import { Page } from "../Db/index.js"
import PythonPool from "./PythonPool.js"

type DerivedData = {
  embedding: number[]
  category: string
  tags: string[]
}

const EntityExtractor = () => {
  const currentDirectory = dirname(fileURLToPath(import.meta.url))
  const parseTitle = PythonPool<string, DerivedData>(
    `${currentDirectory}/parseTitle.py`,
  )

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
    const derivedInfo = await parseTitle(structuredInfo.title)

    const category = {
      name: derivedInfo.category,
    }
    const tags = derivedInfo.tags.map((t) => ({ name: t }))

    const seller = structuredInfo.seller
      ? { name: structuredInfo.seller }
      : undefined
    const brand = structuredInfo.brandName
      ? { name: structuredInfo.brandName, logo: structuredInfo.brandLogo }
      : undefined

    const product = {
      id: randomUUID(),
      title: structuredInfo.title,
      images: structuredInfo.image,
      description: structuredInfo.description,
      brand: brand?.name,
      category: category.name,
      tags: tags.map((t) => t.name),
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
