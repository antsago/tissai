import { PRODUCT as DB_PRODUCT, ATTRIBUTE as ATTRIBUTE } from "@tissai/db/mocks"

export { BRAND, OFFER, SITE } from "@tissai/db/mocks"

export const PRODUCT = {
  ...DB_PRODUCT,
}

export const SIMILAR = {
  id: "000",
  title: "Similar product",
  image: "https://example.com/related_product.jpg",
}
export const SUGGESTION = {
  frequency: 1,
  label: "label",
  values: ["value"],
}
