import { randomUUID } from "node:crypto"
import _, { at } from "lodash"
import type { Attribute, Brand, Db, Offer, Page, Product, Seller } from "@tissai/db"
import { type ParsedInfo } from "../trainer/parsePage/index.js"
import { infer } from "./interpretations/infer.js"
import { type Tokenizer } from "@tissai/tokenizer"

export type Entities = {
  product: Product,
  brand?: Brand,
  attributes: Attribute[],
  sellers: Seller[],
  offers: Offer[],
}

export async function extractEntities(
  info: ParsedInfo,
  page: Page,
  tokenizer: Tokenizer,
  db: Db,
) {
  if (!info.title) {
    throw new Error("No title found")
  }

  const words = await tokenizer.fromText(info.title)
  const interpretation = await infer(
    words.map((w) => w.text),
    db,
  )

  const brand = info.brandName
    ? {
        name: info.brandName.toLocaleLowerCase(),
        logo: info.brandLogo,
      }
    : undefined

  const product = {
    id: randomUUID() as string,
    title: info.title,
    description: info.description,
    images: info.images,
    category: interpretation.category,
    brand: brand?.name,
  }

  const attributes = interpretation.attributes.map((att) => ({
    id: randomUUID(),
    product: product.id,
    value: att.value,
  }))

  const offers = _.uniqWith(
    info.offers?.map((offer) => ({
      ...offer,
      seller: offer.seller?.toLocaleLowerCase(),
    })),
    _.isEqual,
  ).map(o => ({
    ...o,
    id: randomUUID(),
    url: page.url,
    site: page.site,
    product: product.id,
  }))

  const sellers = _.uniqWith(offers.map(o => o.seller), _.isEqual).filter(s => !!s).map(s => ({ name: s! }))

  return {
    brand,
    product,
    attributes,
    sellers,
    offers,
  } as Entities
}

