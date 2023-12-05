const { randomUUID } = require("node:crypto")

const Indexer = function (shops) {
  const isProductPage = function (pageContent) {
    return !!pageContent.jsonLD.product
  }

  const findShop = (url) => {
    const urlDomain = new URL(url).hostname
    const shop = shops.find(s => s.domain === urlDomain)

    return {
        name: shop.name,
        image: shop.icon,
      }
  }

  const createProduct = function ({ jsonLD, openGraph, headings }) {
    const ldProduct = jsonLD.product

    const productUrl = headings.canonical
    return {
      id: randomUUID(),
      name: ldProduct.name,
      description:
        ldProduct.description ?? openGraph.description ?? headings.description,
      image: ldProduct.image,
      brand: ldProduct.brand?.name,
      sellers: [{
        productUrl,
        shop: findShop(productUrl),
      }
      ],
    }
  }

  return {
    isProductPage,
    createProduct,
  }
}

module.exports = Indexer
