import { Db } from "./Db.js"
import Embedder from "./Embedder/index.js"
import parseStructuredInfo from "./parseStructuredInfo.js"

const db = Db()
const embedder = Embedder()
const page = (await db.query("SELECT * FROM pages"))[0]

const { product, offer } = parseStructuredInfo(page)
const augmented = await embedder.embed(product.title)

if (offer.seller) {
  await db.insertSeller(page.id, offer.seller)
}

if (product.brandName) {
  await db.insertBrand(page.id, product.brandName, product.brandLogo)
}

await db.insertCategory(page.id, augmented.category)

await db.insertTags(page.id, augmented.tags)

await db.insertProduct(
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

await db.query(
  'INSERT INTO offers (id, url, site, product, seller, price, currency) VALUES ($1, $2, $3, $4, $5, $6, $7);',
  [offer.id, offer.url, offer.site, offer.product, offer.seller, offer.price, offer.currency],
)
await db.insertTrace(page.id, "offers", offer.id)
