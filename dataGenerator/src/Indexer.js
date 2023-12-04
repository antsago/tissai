const { randomUUID } = require('node:crypto')

const Indexer = function () {
  const isProductPage = function (pageContent) {
    return !!pageContent.jsonLD.product
  }

  const createProduct = function (pageContent) {
    const ldProduct = pageContent.jsonLD.product

    return {
      id: randomUUID(),
      name: ldProduct.name,
    }
  }

  return {
    isProductPage,
    createProduct,
  }
}

module.exports = Indexer
