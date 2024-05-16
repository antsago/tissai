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
}

const offer = {
  id: randomUUID(),
  url: page.url,
  site: page.site,
  product: product.id,
}

await db.query(
  'INSERT INTO products (id, title, description, image) VALUES ($1, $2, $3, $4);',
  [product.id, product.title, product.description, product.image],
)
await db.query(
  'INSERT INTO offers (id, url, site, product) VALUES ($1, $2, $3, $4);',
  [offer.id, offer.url, offer.site, offer.product],
)
