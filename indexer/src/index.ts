import { Db, Page, PAGES } from "./Db/index.js"
import parsePage from "./parsePage.js"
import EntityExtractor from "./EntityExtractor.js"

const db = Db()
const extractEntities = EntityExtractor()
const page = (await db.query<Page>(`SELECT * FROM ${PAGES}`))[0]

const structuredData = parsePage(page)

const { product, offer, category, tags, seller, brand } = await extractEntities(structuredData, page)

await Promise.all(
  [
    db.categories.create(page.id, category.name),
    tags.map((tag) => db.tags.create(page.id, tag.name)),
    seller ? db.sellers.create(page.id, seller.name) : Promise.resolve(),
    brand ? db.brands.create(page.id, brand.name, brand.logo) : Promise.resolve(),
  ].flat(),
)

await db.products.create(
  page.id,
  product.id,
  product.title,
  product.embedding,
  product.category,
  product.tags,
  product.description,
  product.images,
  product.brand,
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
