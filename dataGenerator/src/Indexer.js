const Indexer = function () {
  const shouldIndex = function (pageContent) {
    return !!pageContent.jsonLD.product
  }

  return {
    shouldIndex,
  }
}

module.exports = Indexer
