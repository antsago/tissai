import { randomUUID } from "node:crypto"
import _ from "lodash"
import type { Db, Page } from "@tissai/db"
import { type Entities } from "./extractEntities.js"

export async function storeEntities(entities: Entities, page: Page, db: Db) {
  const brandId = entities.brand && (await db.brands.create(entities.brand)) // upsert and possibly retrieve and reuse id
  const productId = await db.products.create({
    ...entities.product,
    id: randomUUID(),
    brand: brandId as any as string | undefined,
  }) // upsert to also handle category and attributes (either name or id, whatever is easier)
  // await Promise.all(
  //   product.attributes[0]
  //     .filter((att: any) => "value" in att)
  //     .map((att: any) => attribute(att, product[Id], db)),
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
