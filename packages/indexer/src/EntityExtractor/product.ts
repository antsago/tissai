import type { Brand, Db, Product } from "@tissai/db"
import type { OpenGraph } from "../opengraph.js"
import type { Headings } from "../headings.js"
import type { JsonLD } from "../jsonLd.js"
import { randomUUID } from "node:crypto"

async function product(
  ld: JsonLD,
  head: Headings,
  og: OpenGraph,
  title: string,
  db: Db,
  brand?: Brand,
): Promise<Product> {
  const entity = {
    id: randomUUID(),
    title,
    images: ld.image ?? og.image,
    description: ld.description ?? og.description ?? head.description,
    brand: brand?.name,
  }

  await db.products.create(entity)

  return entity
}

export default product
