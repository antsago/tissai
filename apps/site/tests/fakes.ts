import { PRODUCT as DB_PRODUCT, ATTRIBUTE as ATTRIBUTE, LABEL_NODE, VALUE_NODE } from "@tissai/db/mocks"

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
  label: LABEL_NODE.name,
  values: [{
    id: VALUE_NODE.id,
    name: VALUE_NODE.name,
  }],
}
