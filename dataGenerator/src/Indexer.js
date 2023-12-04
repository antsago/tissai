const { randomUUID } = require("node:crypto")

const Indexer = function () {
  const isProductPage = function (pageContent) {
    return !!pageContent.jsonLD.product
  }

  const createProduct = function ({ jsonLD, openGraph, headings }) {
    const ldProduct = jsonLD.product

    return {
      id: randomUUID(),
      name: ldProduct.name,
      description:
        ldProduct.description ?? openGraph.description ?? headings.description,
      image: ldProduct.image,
      brand: ldProduct.brand?.name,
      sellers: [
        {
          productUrl: headings.canonical,
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
