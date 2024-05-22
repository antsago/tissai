import { randomUUID } from "node:crypto"
import { parse } from "node-html-parser"
import { Page } from "./Db/index.js"

function parsePage(page: Page) {
  const root = parse(page.body)
  const productTag = root
    .querySelectorAll('script[type="application/ld+json"]')
    .map((t) => t.textContent)
    .map((t) => JSON.parse(t))
    .filter((t) => t["@type"] === "Product")[0]

  const product = {
    id: randomUUID(),
    title: productTag.name,
    description: productTag.description,
    image: Array.isArray(productTag.image)
      ? productTag.image
      : [productTag.image],
    brandName: productTag?.brand?.name,
    brandLogo: productTag?.brand?.image,
  }

  const offer = {
    id: randomUUID(),
    url: page.url,
    site: page.site,
    product: product.id,
    price: productTag.offers?.price,
    currency: productTag.offers?.priceCurrency,
    seller: productTag.offers?.seller.name,
  }

  return {
    product,
    offer,
  }
}

export default parsePage
