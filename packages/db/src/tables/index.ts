import { queries as attributes } from "./attributes.js"
import { queries as brands } from "./brands.js"
import { queries as offers } from "./offers.js"
import { queries as sellers } from "./sellers.js"
import { queries as products } from "./products.js"

export const queries = {
  attributes,
  brands,
  offers,
  sellers,
  products,
}

export type * from "./queryBuilder.js"
export { default as builder } from "./queryBuilder.js"
export { default } from "./Tables.js"
