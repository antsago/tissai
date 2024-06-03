import type {
  Brand,
  Category,
  Product,
  Tag,
  Offer,
  Seller,
  Page,
} from "@tissai/db"
import type { StructuredData } from "../parsePage.js"
import { dirname } from "node:path"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"
import defaults from "lodash.defaults"
import PythonPool from "./PythonPool.js"

type DerivedData = {
  embedding: number[]
  category: string
  tags: string[]
}
type OfferStructuredInfo = {
  price?: number
  currency?: string
  seller?: string
}

function extractOg(opengraph: StructuredData["opengraph"]) {
  if (opengraph["og:type"] !== "product") {
    return {}
  }

  return {
    title: opengraph["og:title"],
    description: opengraph["og:description"],
    image: opengraph["og:image"] ? [opengraph["og:image"]] : undefined,
  }
}

type Entities = {
  product: Product
  category: Category
  brand?: Brand
  tags: Tag[]
  offers: Offer[]
  sellers: Seller[]
}
export const EntityExtractor = () => {
  const currentDirectory = dirname(fileURLToPath(import.meta.url))
  const python = PythonPool<string, DerivedData>(
    `${currentDirectory}/parseTitle.py`,
  )

  return {
    close: () => python.close(),
    extract: async (
      { jsonLd, opengraph, headings }: StructuredData,
      page: Page,
    ): Promise<Entities> => {
      const productTag = jsonLd.filter((t) => t["@type"].includes("Product"))[0]

      const jsonLdInfo = {
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
      const opengraphInfo = extractOg(opengraph)
      const headingInfo = {
        title: headings.title,
        description: headings.description,
      }
      const structuredInfo = defaults(
        {},
        jsonLdInfo,
        opengraphInfo,
        headingInfo,
      )

      if (!structuredInfo.title) {
        throw new Error("Product without title!")
      }

      const derivedInfo = await python.send(structuredInfo.title)

      const category = {
        name: derivedInfo.category,
      }
      const tags = derivedInfo.tags.map((t) => ({ name: t }))

      const sellers =
        (structuredInfo.offers as OfferStructuredInfo[])
          ?.map((offer: any) => ({
            name: offer.seller,
          }))
          .filter(({ name }) => !!name) ?? []
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

      const offers = (structuredInfo.offers as OfferStructuredInfo[])?.map(
        (offer) => ({
          id: randomUUID(),
          url: page.url,
          site: page.site,
          product: product.id,
          price: offer.price,
          currency: offer.currency,
          seller: offer.seller,
        }),
      ) ?? [
        {
          id: randomUUID(),
          url: page.url,
          site: page.site,
          product: product.id,
          price: undefined,
          currency: undefined,
          seller: undefined,
        },
      ]

      return {
        category,
        tags,
        brand,
        product,
        offers,
        sellers,
      }
    },
  }
}

export type EntityExtractor = ReturnType<typeof EntityExtractor>
