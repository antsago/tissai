const { randomUUID } = require("node:crypto")

const Indexer = function (shops) {
  const isProductPage = function (pageContent) {
    return (
      !!pageContent?.jsonLD?.product ||
      pageContent?.openGraph?.type === "product"
    )
  }

  const findShop = (url) => {
    const urlDomain = new URL(url).hostname
    const shop = shops.find((s) => s.domain === urlDomain)

    if (!shop) {
      throw new Error(`Shop for ${url} not found`)
    }

    return {
      name: shop.name,
      image: shop.icon,
    }
  }

  const createProduct = function ({ jsonLD, openGraph, headings, url }) {
    const ldProduct = jsonLD.product

    const productUrl = headings.canonical ?? url
    return {
      id: randomUUID(),
      name: ldProduct?.name ?? openGraph?.title,
      description:
        ldProduct?.description ??
        openGraph?.description ??
        headings.description,
      image: ldProduct?.image ?? openGraph?.image,
      brand: ldProduct?.brand?.name,
      sellers: [
        {
          productUrl,
          shop: findShop(productUrl),
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
