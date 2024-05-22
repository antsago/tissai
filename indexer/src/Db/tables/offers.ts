import { Connection } from "../Connection.js"
import { TABLE as PRODUCTS } from "./products.js"
import { TABLE as SELLERS } from "./sellers.js"
import { TABLE as SITES } from "./sites.js"
import * as traces from "./traces.js"

export const TABLE = Object.assign("offers", {
  id: "id",
  url: "url",
  site: "site",
  product: "product",
  seller: "seller",
  price: "price",
  currency: "currency",
})

export const create =
  (connection: Connection) =>
  (
    pageId: string,
    id: string,
    url: string,
    site: string,
    product: string,
    seller?: string,
    price?: number,
    currency?: string,
  ) =>
    Promise.all([
      connection.query(
        `INSERT INTO ${TABLE} (
          ${TABLE.id},
          ${TABLE.url},
          ${TABLE.site},
          ${TABLE.product},
          ${TABLE.seller},
          ${TABLE.price},
          ${TABLE.currency}
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        );`,
        [id, url, site, product, seller, price, currency],
      ),
      traces.create(connection)(pageId, TABLE.toString(), id),
    ])

export const initialize = (connection: Connection) =>
  connection.query(`
    CREATE TABLE ${TABLE} (
      ${TABLE.id}             uuid PRIMARY KEY,
      ${TABLE.url}            text NOT NULL,
      ${TABLE.site}           uuid NOT NULL REFERENCES ${SITES},
      ${TABLE.product}        uuid NOT NULL REFERENCES ${PRODUCTS},
      ${TABLE.seller}         text REFERENCES ${SELLERS},
      ${TABLE.price}          numeric,
      ${TABLE.currency}       text
    );`)
