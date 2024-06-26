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

type Title = string|undefined
function title(jsonLd: ParsedLd, og: ParsedOG, head: ParsedH): Title {
  return jsonLd.title ?? og.title ?? head.title
}
type Description = string|undefined
function description(jsonLd: ParsedLd, og: ParsedOG, head: ParsedH): Description {
  return jsonLd.description ?? og.description ?? head.description
}
type Images = string[]|undefined
function images(jsonLd: ParsedLd, og: ParsedOG): Images {
  return jsonLd.image ?? og.image
}

function brand({ brandName, brandLogo }: ParsedLd): Brand|undefined {
  if (!brandName) {
    return undefined
  }

  return { name: brandName, logo: brandLogo }
}

function sellers({ offers }: ParsedLd): Seller[] {
  if (!offers) {
    return []
  }

  return offers
    .map((offer: any) => ({
      name: offer.seller,
    }))
    .filter(({ name }) => !!name)
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
      const productTitle = title(jsonLdInfo, opengraphInfo, headingInfo)

      if (!productTitle) {
        throw new Error("Product without title!")
      }

      const derivedInfo = await python.send(productTitle)

      const category = {
        name: derivedInfo.category,
      }
      const tags = derivedInfo.tags.map((t) => ({ name: t }))

      const sellerEntities = sellers(jsonLdInfo)
      const brandEntity = brand(jsonLdInfo)

      const product = {
        id: randomUUID(),
        title: productTitle,
        images: images(jsonLdInfo, opengraphInfo),
        description: description(jsonLdInfo, opengraphInfo, headingInfo),
        brand: brandEntity?.name,
        category: category.name,
        tags: tags.map((t) => t.name),
        embedding: derivedInfo.embedding,
      }

      const rawOffers = jsonLdInfo.offers?.map(
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
        sellers: sellerEntities,
      }
    },
  }
}

export type EntityExtractor = ReturnType<typeof EntityExtractor>
