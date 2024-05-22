import { Db } from "./Db/index.js"
import Embedder from "./Embedder/index.js"
import parseStructuredInfo from "./parseStructuredInfo.js"

type Page = {
  id: string
  body: string
  url: string
  site: string
}

const db = Db()
const embedder = Embedder()
const page = (await db.query<Page>("SELECT * FROM pages"))[0]

const { product, offer } = parseStructuredInfo(page)
const augmented = await embedder.embed(product.title)

await Promise.all(
  [
    db.products.create(
      page.id,
      product.id,
      product.title,
      augmented.embedding,
      augmented.category,
      augmented.tags,
      product.description,
      product.image,
      product.brandName,
    ),
    db.offers.create(
      page.id,
      offer.id,
      offer.url,
      offer.site,
      offer.product,
      offer.seller,
      offer.price,
      offer.currency,
    ),
    db.categories.create(page.id, augmented.category),
    augmented.tags.map((name) => db.tags.create(page.id, name)),
    offer.seller ? db.sellers.create(page.id, offer.seller) : Promise.resolve(),
    product.brandName
      ? db.brands.create(page.id, product.brandName, product.brandLogo)
      : Promise.resolve(),
  ].flat(),
)
