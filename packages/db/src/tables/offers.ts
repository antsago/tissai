import { Connection } from "../Connection.js"
import { TABLE as PRODUCTS } from "./products.js"
import { TABLE as SELLERS } from "./sellers.js"
import { TABLE as SITES } from "./sites.js"
import builder, { type Offer } from "./queryBuilder.js"

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

export const queries = {
  create: (offer: Offer) =>
    builder.insertInto("offers").values(offer).compile(),
  getAll: () => builder.selectFrom("offers").selectAll().compile(),
}
export const crud = (connection: Connection) => ({
  create: (offer: Offer) => connection.query(queries.create(offer)),

  getAll: async (): Promise<Offer[]> => {
    const offers = await connection.query(queries.getAll())

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
