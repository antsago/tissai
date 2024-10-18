import { randomUUID } from "node:crypto"
import _ from "lodash"
import type { Db, Page } from "@tissai/db"
import { type Entities } from "./extractEntities.js"

export async function storeEntities(entities: Entities, page: Page, db: Db) {
  const brand = entities.brand && (await db.brands.upsert(entities.brand))
  const productId = await db.products.create({
    ...entities.product,
    brand: brand?.name,
  })
  // await Promise.all(
  //   entities.attributes.map((att) => db.attributes.create({ id: })),
  // )

  await Promise.all(
    entities.offers.map(async (o) => {
      const sellerId =
        o.seller &&
        (await db.sellers.create({
          name: o.seller,
        })) //upsert again (just so that it doesn't fail if seller exists), and possibly add id

      db.offers.create({
        id: randomUUID(),
        product: productId as any as string,
        site: page.site,
        url: page.url,
        currency: o.currency,
        price: o.price,
        seller: sellerId as any as string | undefined,
      })
    }),
  )
}
