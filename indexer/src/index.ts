import { randomUUID } from "node:crypto"
import { Db, Page, PAGES } from "./Db/index.js"
import Embedder from "./Embedder/index.js"
import parsePage from "./parsePage.js"

const db = Db()
const embedder = Embedder()
const page = (await db.query<Page>(`SELECT * FROM ${PAGES}`))[0]

const { jsonLd } = parsePage(page)

const productTag = jsonLd.filter((t) => t["@type"] === "Product")[0]
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

const augmented = await embedder.embed(product.title)

await Promise.all([
  db.categories.create(page.id, augmented.category),
  augmented.tags.map((name) => db.tags.create(page.id, name)),
  offer.seller ? db.sellers.create(page.id, offer.seller) : Promise.resolve(),
  product.brandName
    ? db.brands.create(page.id, product.brandName, product.brandLogo)
    : Promise.resolve(),
].flat())

await db.products.create(
  page.id,
  product.id,
  product.title,
  augmented.embedding,
  augmented.category,
  augmented.tags,
  product.description,
  product.image,
  product.brandName,
)
await db.offers.create(
  page.id,
  offer.id,
  offer.url,
  offer.site,
  offer.product,
  offer.seller,
  offer.price,
  offer.currency,
)

await db.close()
