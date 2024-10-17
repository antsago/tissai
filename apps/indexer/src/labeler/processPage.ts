import _ from "lodash"
import { randomUUID } from "crypto"
import type { Db, Page } from "@tissai/db"
import { type ParsedInfo } from "../trainer/parsePage/index.js"
import { infer } from "./interpretations/infer.js"
import { type Tokenizer } from "@tissai/tokenizer"

export async function extractEntities(info: ParsedInfo, tokenizer: Tokenizer, db: Db) {
  if (!info.title) {
    throw new Error("No title found")
  }

  const words = await tokenizer.fromText(info.title)

  const interpretation = await infer(
    words.map((w) => w.text),
    db,
  )

  const brand = info.brandName ? {
    name: info.brandName,
    logo: info.brandLogo,
  } : undefined

  const product = {
    title: info.title,
    description: info.description,
    images: info.images,
    category: interpretation.category,
    attributes: interpretation.attributes,
  }

  const offers = _.uniqWith(info.offers?.map(offer => ({
    ...offer,
    seller: offer.seller?.toLowerCase()
  })), _.isEqual).map(o => ({
    ...o,
  }))

  return {
    brand,
    product,
    offers,
  }
}

type Entities = Awaited<ReturnType<typeof extractEntities>>

export async function storeEntities(entities: Entities, page: Page, db: Db) {
  const brandId = entities.brand && await db.brands.create(entities.brand) // upsert and possibly retrieve and reuse id
  const productId = await db.products.create({
    ...entities.product,
    id: randomUUID(),
    brand: brandId as any as string|undefined,
  }) // upsert to also handle category and attributes (either name or id, whatever is easier)
  // await Promise.all(
  //   product.attributes[0]
  //     .filter((att: any) => "value" in att)
  //     .map((att: any) => attribute(att, product[Id], db)),
  // )
  
  await Promise.all(entities.offers.map(async o => {
    const sellerId = o.seller && await db.sellers.create({
        name: o.seller
      }) //upsert again (just so that it doesn't fail if seller exists), and possibly add id

    db.offers.create({
      id: randomUUID(),
      product: productId as any as string,
      site: page.site,
      url: page.url,
      currency: o.currency,
      price: o.price,
      seller: sellerId as any as string | undefined,
    })
  }))
}
