const { randomUUID } = require('node:crypto')

const Indexer = function () {
  const isProductPage = function (pageContent) {
    return !!pageContent.jsonLD.product
  }

  const createProduct = function (pageContent) {
    return {
      id: randomUUID(),
    }
  }

  return {
    isProductPage,
    createProduct,
  }
}

module.exports = Indexer
