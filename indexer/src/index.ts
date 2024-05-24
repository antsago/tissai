import { randomUUID } from "node:crypto"
import { Db, Page, PAGES } from "./Db/index.js"
import Embedder from "./Embedder/index.js"
import parsePage from "./parsePage.js"

type StructuredData = ReturnType<typeof parsePage>
async function extractEntities({ jsonLd }: StructuredData, embedder: Embedder, page: Page) {
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

  const category = {
    name: augmented.category,
  }
  const tags = augmented.tags.map(t => ({ name: t }))
  const seller = offer.seller ? { name: offer.seller } : undefined
  const brand = product.brandName ? { name: product.brandName, logo: product.brandLogo } : undefined

  return {
    category,
    tags,
    seller,
    brand,
    product: {
      id: product.id,
      title: product.title,
      images: product.image,
      description: product.description,
      brand: brand?.name,
      category: category.name,
      tags: tags.map(t => t.name),
      embedding: augmented.embedding,
    },
    offer,
  }
}

const db = Db()
const embedder = Embedder()
const page = (await db.query<Page>(`SELECT * FROM ${PAGES}`))[0]

const structuredData = parsePage(page)

const { product, offer, category, tags, seller, brand } = await extractEntities(structuredData, embedder, page)

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
