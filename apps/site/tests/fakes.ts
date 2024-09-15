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
export const QUERY = PRODUCT.title
export const STRING_ATTRIBUTE = {
  label: ATTRIBUTE.label,
  value: ATTRIBUTE.value,
}
export const BOOL_ATTRIBUTE = { label: "lavados", value: "lavados" }
export const CAT_ATTRIBUTE = { label: "categoría", value: "vaqueros" }
export const SUGGESTION = {
  frequency: 1,
  label: "label",
  values: ["value"],
}
