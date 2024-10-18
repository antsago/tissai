export const SITE = {
  id: "59a20ba8-1c4f-40a1-8483-939315ccf0b6",
  name: "Test",
  icon: "https://example.com/favicon.ico",
  domain: "example.com",
}

export const PAGE = {
  id: "4fd6e0ea-8c16-4ca5-b171-7db323b7025f",
  url: "https://example.com/page.html",
  site: SITE.id,
  body: "<html><head></head></html>",
}

export const BRAND = {
  name: "Eg",
  logo: "https://example.com/EG.jpg",
}

export const CATEGORY_NODE = {
  id: "60a412f1-74c5-4671-9cca-dd49d0be2648",
  parent: null,
  name: "botines",
  tally: 5,
}
export const LABEL_NODE = {
  id: "89c472de-d6a3-4c3a-8b9a-c827820b6f91",
  parent: CATEGORY_NODE.id,
  name: "a label",
  tally: 3,
}
export const VALUE_NODE = {
  id: "761384ca-6756-49ff-bcb4-8a9a94e3ea8a",
  parent: LABEL_NODE.id,
  name: "a value",
  tally: 2,
}
export const PRODUCT = {
  id: "1a13b49d-b43d-4eba-838d-a77c9d94f743",
  title: "Vaqueros ajustados",
  description: "Unos vaqueros muy muy ajustados",
  images: [
    "https://example.com/product-image.jpg",
    "https://example.com/product-image-2.jpg",
  ],
  brand: BRAND.name,
  category: CATEGORY_NODE.id,
}

export const SELLER = {
  name: "vendedor ejemplar",
}

export const OFFER = {
  id: "a7a9160a-b3fd-4fed-97fe-7032322da08c",
  product: PRODUCT.id,
  seller: SELLER.name,
  price: 70,
  currency: "EUR",
  url: PAGE.url,
  site: PAGE.site,
}

export const ATTRIBUTE = {
  id: "5f592540-9e7b-465b-89df-83527c2b7df0",
  value: VALUE_NODE.id,
  product: PRODUCT.id,
}
