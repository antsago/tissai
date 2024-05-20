import { Db } from "./Db.js"
import Embedder from "./Embedder/index.js"
import parseStructuredInfo from "./parseStructuredInfo.js"

const db = Db()
const embedder = Embedder()
const page = (await db.query("SELECT * FROM pages"))[0]

const { product, offer } = parseStructuredInfo(page)
const augmented = await embedder.embed(product.title)

if (offer.seller) {
  await db.query('INSERT INTO sellers (name) VALUES ($1);', [offer.seller])
  await db.insertTrace(page.id, "sellers", offer.seller)
}

if (product.brandName) {
  await db.query('INSERT INTO brands (name, logo) VALUES ($1, $2);', [product.brandName, product.brandLogo])
  await db.insertTrace(page.id, "brands", product.brandName)
}

await db.query('INSERT INTO categories (name) VALUES ($1)', [augmented.category])
await db.insertTrace(page.id, "categories", augmented.category)

await Promise.all(augmented.tags.map(async tag => {
  await db.query('INSERT INTO tags (name) VALUES ($2);', [tag])
  await db.insertTrace(page.id, "tags", tag)
}))

await db.query(
  `INSERT INTO products (
    id, title, description, image, brand, embedding, category, tags
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
  );`,
  [
    product.id,
    product.title,
    product.description,
    product.image,
    product.brandName,
    augmented.embedding,
    augmented.category, augmented.tags,
  ],
)
await db.insertTrace(page.id, "products", product.id)

await db.query(
  'INSERT INTO offers (id, url, site, product, seller, price, currency) VALUES ($1, $2, $3, $4, $5, $6, $7);',
  [offer.id, offer.url, offer.site, offer.product, offer.seller, offer.price, offer.currency],
)
await db.insertTrace(page.id, "offers", offer.id)
