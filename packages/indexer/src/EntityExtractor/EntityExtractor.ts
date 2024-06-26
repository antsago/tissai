import type {
  Brand,
  Category,
  Product,
  Tag,
  Offer,
  Seller,
  Page,
} from "@tissai/db"
import type { JsonLD } from "../jsonLd.js"
import type { OpenGraph } from "../opengraph.js"
import type { Headings } from "../headings.js"
import { dirname } from "node:path"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"
import _ from "lodash"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"

type StructuredData = {
  jsonLd: JsonLD
  opengraph: OpenGraph
  headings: Headings
}
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

type ParsedOG = Partial<{
  title: string
  description: string
  image: string[]
}>
function parsedOg(opengraph: OpenGraph): ParsedOG {
  if (opengraph["og:type"] !== "product") {
    return {}
  }

  return {
    title: opengraph["og:title"],
    description: opengraph["og:description"],
    image: opengraph["og:image"] ? [opengraph["og:image"]] : undefined,
  }
}

type ParsedH = Partial<{
  title: string
  description: string
}>
function parsedH(headings: Headings): ParsedH {
  return {
    title: headings.title,
    description: headings.description,
  }
}

type ParsedLd = Partial<{
  title: string
  description: string
  image: string[]
  brandName: string
  brandLogo: string
  offers: OfferStructuredInfo[]
}>
function parsedLd(jsonLd: JsonLD): ParsedLd {
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

function brand(jsonLd: ParsedLd): Brand|undefined {
  if (!jsonLd.brandName) {
    return undefined
  }

  return { name: jsonLd.brandName, logo: jsonLd.brandLogo }
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
    reporter,
  )

  return {
    close: () => python.close(),
    extract: async (
      sd: StructuredData,
      page: Page,
    ): Promise<Entities> => {
      const jsonLdInfo = parsedLd(sd.jsonLd)
      const opengraphInfo = parsedOg(sd.opengraph)
      const headingInfo = parsedH(sd.headings)

      const structuredInfo = _.defaults(
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
      const brandEntity = brand(jsonLdInfo)

      const product = {
        id: randomUUID(),
        title: structuredInfo.title,
        images: structuredInfo.image,
        description: structuredInfo.description,
        brand: brandEntity?.name,
        category: category.name,
        tags: tags.map((t) => t.name),
        embedding: derivedInfo.embedding,
      }

      const rawOffers = (structuredInfo.offers as OfferStructuredInfo[])?.map(
        (offer) => ({
          url: page.url,
          site: page.site,
          product: product.id,
          price: offer.price,
          currency: offer.currency,
          seller: offer.seller,
        }),
      ) ?? [
        {
          url: page.url,
          site: page.site,
          product: product.id,
          price: undefined,
          currency: undefined,
          seller: undefined,
        },
      ]

      const offers = _.uniqWith(rawOffers, _.isEqual).map((o) => ({
        ...o,
        id: randomUUID(),
      }))

      return {
        category,
        tags,
        brand: brandEntity,
        product,
        offers,
        sellers,
      }
    },
  }
}

export type EntityExtractor = ReturnType<typeof EntityExtractor>
