import { Db, Page, PAGES } from "./Db/index.js"
import parsePage from "./parsePage.js"
import EntityExtractor from "./EntityExtractor/index.js"

const db = Db()
const extractEntities = EntityExtractor()
const page = (await db.query<Page>(`SELECT * FROM ${PAGES}`))[0]

const structuredData = parsePage(page)

const { product, offers, category, tags, sellers, brand } =
  await extractEntities(structuredData, page)

await Promise.all(
  [
    db.categories.create(page.id, category.name),
    tags.map((tag) => db.tags.create(page.id, tag.name)),
    sellers.length
      ? db.sellers.create(page.id, sellers[0].name)
      : Promise.resolve(),
    brand
      ? db.brands.create(page.id, brand.name, brand.logo)
      : Promise.resolve(),
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
  offers[0].id,
  offers[0].url,
  offers[0].site,
  offers[0].product,
  offers[0].seller,
  offers[0].price,
  offers[0].currency,
)

await db.close()
