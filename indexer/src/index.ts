import { Db, Page, PAGES } from "./Db/index.js"
import parsePage from "./parsePage.js"
import EntityExtractor from "./EntityExtractor/index.js"

const db = Db()

try {
  const extractEntities = EntityExtractor()
  const page = (await db.query<Page>(`SELECT * FROM ${PAGES}`))[0]
  
  const structuredData = parsePage(page)
  
  const { product, offers, category, tags, sellers, brand } =
    await extractEntities(structuredData, page)
  
  await Promise.all(
    [
      db.categories.create(page.id, category.name),
      tags.map((tag) => db.tags.create(page.id, tag.name)),
      sellers.map(seller => db.sellers.create(page.id, seller.name)),
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
  await Promise.all(offers.map(offer => db.offers.create(
    page.id,
    offer.id,
    offer.url,
    offer.site,
    offer.product,
    offer.seller,
    offer.price,
    offer.currency,
  )))
} catch (err) {
} finally {
  await db.close()
}
