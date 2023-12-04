const { randomUUID } = require("node:crypto")

const Indexer = function () {
  const isProductPage = function (pageContent) {
    return !!pageContent.jsonLD.product
  }

  const createProduct = function (pageContent) {
    const ldProduct = pageContent.jsonLD.product

    return {
      id: randomUUID(),
      name: ldProduct.name,
      description:
        ldProduct.description ??
        pageContent.openGraph.description ??
        pageContent.headings.description,
      image: ldProduct.image,
      brand: ldProduct.brand?.name,
      sellers: [{
        productUrl: pageContent.headings.canonical,
      }]
    }
  }

  return {
    isProductPage,
    createProduct,
  }
}

module.exports = Indexer
