import { randomUUID } from "node:crypto"
import { parse } from "node-html-parser"
import { Db } from "./Db.js"

const db = Db()
const page = (await db.query("SELECT * FROM pages"))[0]

const root = parse(page.body)
const productTag = root.querySelectorAll('script[type="application/ld+json"]')
  .map(t => t.textContent)
  .map(t => JSON.parse(t))
  .filter(t => t["@type"] === "Product")[0]

const product = {
  id: randomUUID(),
  title: productTag.name,
  description: productTag.description,
  image: productTag.image,
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

if (offer.seller) {
  const sellers = await db.query('SELECT name FROM sellers WHERE name = $1', offer.seller)
  if (!sellers.length) {
    await db.query('INSERT INTO sellers (name) VALUES ($1)', [offer.seller])
  }
}

if (product.brandName) {
  await db.query('INSERT INTO brands (name, logo) VALUES ($1, $2)', [product.brandName, product.brandLogo])
}

await db.query(
  'INSERT INTO products (id, title, description, image, brand) VALUES ($1, $2, $3, $4, $5);',
  [product.id, product.title, product.description, product.image, product.brandName],
)
await db.query(
  'INSERT INTO offers (id, url, site, product, seller, price, currency) VALUES ($1, $2, $3, $4, $5, $6, $7);',
  [offer.id, offer.url, offer.site, offer.product, offer.seller, offer.price, offer.currency],
)
