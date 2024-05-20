import { Db } from "./Db.js"
import Embedder from "./Embedder/index.js"
import parseStructuredInfo from "./parseStructuredInfo.js"

const db = Db()
const embedder = Embedder()
const page = (await db.query("SELECT * FROM pages"))[0]

const { product, offer } = parseStructuredInfo(page)
const augmented = await embedder.embed(product.title)

await Promise.all([
  db.insertProduct(
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
  db.insertOffer(
    page.id,
    offer.id,
    offer.url,
    offer.site,
    offer.product,
    offer.seller,
    offer.price,
    offer.currency,
  ),
  db.insertCategory(page.id, augmented.category),
  db.insertTags(page.id, augmented.tags),
  offer.seller ? db.insertSeller(page.id, offer.seller) : Promise.resolve(),
  product.brandName ? db.insertBrand(page.id, product.brandName, product.brandLogo) : Promise.resolve(),
])
