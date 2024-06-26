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

function title(jsonLd: ParsedLd, og: ParsedOG, head: ParsedH) {
  return jsonLd.title ?? og.title ?? head.title
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

async function category(title: string, python: PythonPool<string, DerivedData>): Promise<Category> {
  const derivedInfo = await python.send(title)

  return {
    name: derivedInfo.category,
  }
}
async function tags(title: string, python: PythonPool<string, DerivedData>): Promise<Tag[]> {
  const derivedInfo = await python.send(title)

  return derivedInfo.tags.map((t) => ({ name: t }))
}
async function product(ld: ParsedLd, head: ParsedH, og: ParsedOG, title: string, python: PythonPool<string, DerivedData>, category: Category, tags: Tag[], brand?: Brand): Promise<Product> {
  const derivedInfo = await python.send(title)
  return {
    id: randomUUID(),
    title,
    images: ld.image ?? og.image,
    description: ld.description ?? og.description ?? head.description,
    brand: brand?.name,
    category: category.name,
    tags: tags.map((t) => t.name),
    embedding: derivedInfo.embedding,
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

      const categoryEntity = await category(productTitle, python)
      const tagEntities = await tags(productTitle, python)
      const sellerEntities = sellers(jsonLdInfo)
      const brandEntity = brand(jsonLdInfo)

      const productEntity = await product(jsonLdInfo, headingInfo, opengraphInfo, productTitle, python, categoryEntity, tagEntities, brandEntity)

      const rawOffers = jsonLdInfo.offers?.map(
        (offer) => ({
          url: page.url,
          site: page.site,
          product: productEntity.id,
          price: offer.price,
          currency: offer.currency,
          seller: offer.seller,
        }),
      ) ?? [
        {
          url: page.url,
          site: page.site,
          product: productEntity.id,
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
        category: categoryEntity,
        tags: tagEntities,
        brand: brandEntity,
        product: productEntity,
        offers,
        sellers: sellerEntities,
      }
    },
  }
}

export type EntityExtractor = ReturnType<typeof EntityExtractor>
