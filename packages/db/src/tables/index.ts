import { queries as attributes } from "./attributes.js"
import { queries as brands } from "./brands.js"
import { queries as offers } from "./offers.js"
import { queries as sellers } from "./sellers.js"

export const queries = {
  attributes,
  brands,
  offers,
  sellers,
}

export { TABLE as PRODUCTS } from "./products.js"

export type * from "./queryBuilder.js"
export { default as builder } from "./queryBuilder.js"
export { default } from "./Tables.js"
