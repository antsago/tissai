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
import { parsedLd, parsedOg, parsedH, title, type ParsedLd, type ParsedOG, type ParsedH } from './infoPipelines.js'

type DerivedData = {
  embedding: number[]
  category: string
  tags: string[]
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
function offers(ld: ParsedLd, page: Page, product: Product): Offer[] {
  const base = {
    url: page.url,
    site: page.site,
    product: product.id,
  }

  if (!ld.offers) {
    return [
      {
        ...base,
        id: randomUUID(),
        price: undefined,
        currency: undefined,
        seller: undefined,
      },
    ]
  }

  return _.uniqWith(ld.offers, _.isEqual).map(
    (offer) => ({
      ...base,
      id: randomUUID(),
      price: offer.price,
      currency: offer.currency,
      seller: offer.seller,
    }),
  )
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
      sd: {
        jsonLd: JsonLD
        opengraph: OpenGraph
        headings: Headings
      },
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
      const offerEntities = offers(jsonLdInfo, page, productEntity)

      return {
        category: categoryEntity,
        tags: tagEntities,
        brand: brandEntity,
        product: productEntity,
        offers: offerEntities,
        sellers: sellerEntities,
      }
    },
  }
}

export type EntityExtractor = ReturnType<typeof EntityExtractor>
