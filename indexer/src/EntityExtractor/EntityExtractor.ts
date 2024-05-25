import type { StructuredData } from "../parsePage.js"
import { dirname } from "node:path"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"
import defaults from "lodash.defaults"
import { Page } from "../Db/index.js"
import PythonPool from "./PythonPool.js"

type DerivedData = {
  embedding: number[]
  category: string
  tags: string[]
}

function extractOg (opengraph: StructuredData["opengraph"]) {
  if (opengraph["og:type"] !== "product") {
    return {}
  }

  return {
    title: opengraph["og:title"],
    description: opengraph["og:description"],
    image: opengraph["og:image"] ? [opengraph["og:image"]] : undefined,
  }
}

const EntityExtractor = () => {
  const currentDirectory = dirname(fileURLToPath(import.meta.url))
  const parseTitle = PythonPool<string, DerivedData>(
    `${currentDirectory}/parseTitle.py`,
  )

  return async ({ jsonLd, opengraph, headings }: StructuredData, page: Page) => {
    const productTag = jsonLd.filter((t) => t["@type"].includes("Product"))[0]

    const jsonLdInfo = {
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
    const opengraphInfo = extractOg(opengraph)
    const headingInfo = {
      title: headings.title,
      description: headings.description,
    }
    const structuredInfo = defaults({}, jsonLdInfo, opengraphInfo, headingInfo)
    const derivedInfo = await parseTitle(structuredInfo.title)

    const category = {
      name: derivedInfo.category,
    }
    const tags = derivedInfo.tags.map((t) => ({ name: t }))

    const sellers = structuredInfo.offers?.map((offer: any) => ({ name: offer.seller })) ?? []
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
      price: structuredInfo.offers?.[0].price,
      currency: structuredInfo.offers?.[0].currency,
      seller: sellers[0]?.name,
    }

    return {
      category,
      tags,
      brand,
      product,
      offers: [offer],
      sellers,
    }
  }
}

export default EntityExtractor
