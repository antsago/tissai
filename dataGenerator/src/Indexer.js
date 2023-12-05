const { randomUUID } = require("node:crypto")

const Indexer = function (shops) {
  const isProductPage = function (pageContent) {
    return !!pageContent.jsonLD.product
  }

  const createProduct = function ({ jsonLD, openGraph, headings }) {
    const ldProduct = jsonLD.product

    const productUrl = headings.canonical
    const urlDomain = new URL(productUrl).hostname
    const shop = shops.find(s => s.domain === urlDomain)

    return {
      id: randomUUID(),
      name: ldProduct.name,
      description:
        ldProduct.description ?? openGraph.description ?? headings.description,
      image: ldProduct.image,
      brand: ldProduct.brand?.name,
      sellers: [
        {
          productUrl,
          shop: {
            name: shop.name,
            image: shop.icon,
          }
        },
      ],
    }
  }

  return {
    isProductPage,
    createProduct,
  }
}

module.exports = Indexer
