import { Connection } from "../Connection.js"
import { TABLE as PRODUCTS } from "./products.js"
import { TABLE as SELLERS } from "./sellers.js"
import { TABLE as SITES } from "./sites.js"
import builder from "./queryBuilder.js"

export type Offer = {
  id: string
  url: string
  site: string
  product: string
  seller?: string
  price?: number | null
  currency?: string
}

export const TABLE = Object.assign("offers", {
  id: "id",
  url: "url",
  site: "site",
  product: "product",
  seller: "seller",
  price: "price",
  currency: "currency",
})

export const initialize = (connection: Connection) =>
  connection.raw(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.url}            text NOT NULL,
      ${TABLE.site}           uuid NOT NULL REFERENCES ${SITES},
      ${TABLE.product}        uuid NOT NULL REFERENCES ${PRODUCTS},
      ${TABLE.seller}         text REFERENCES ${SELLERS},
      ${TABLE.price}          numeric,
      ${TABLE.currency}       text
    );`)

export const crud = (connection: Connection) => ({
  create: (offer: Offer) =>
    connection.query(builder.insertInto("offers").values(offer).compile()),

  getAll: async (): Promise<Offer[]> => {
    const offers = await connection.query(
      builder.selectFrom("offers").selectAll().compile(),
    )

    return offers.map((o) =>
      o.price
        ? {
            ...o,
            price: parseInt(o.price as unknown as string, 10),
          }
        : o,
    )
  },
})
