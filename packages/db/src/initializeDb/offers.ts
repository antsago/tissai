import { Connection } from "../Connection.js"
import { PRODUCTS } from "./products.js"
import { SELLERS } from "./sellers.js"
import { SITES } from "./sites.js"

export const OFFERS = Object.assign("offers", {
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
    CREATE TABLE IF NOT EXISTS ${OFFERS} (
      ${OFFERS.id}             uuid PRIMARY KEY,
      ${OFFERS.url}            text NOT NULL,
      ${OFFERS.site}           uuid NOT NULL REFERENCES ${SITES},
      ${OFFERS.product}        uuid NOT NULL REFERENCES ${PRODUCTS},
      ${OFFERS.seller}         text REFERENCES ${SELLERS},
      ${OFFERS.price}          numeric,
      ${OFFERS.currency}       text
    );`)
