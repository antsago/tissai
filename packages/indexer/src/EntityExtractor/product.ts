import type { PythonPool } from "@tissai/python-pool"
import type { Brand, Category, Product, Tag } from "@tissai/db"
import type { OpenGraph } from "../opengraph.js"
import type { Headings } from "../headings.js"
import type { JsonLD } from "../jsonLd.js"
import { randomUUID } from "node:crypto"

async function product(
  ld: JsonLD,
  head: Headings,
  og: OpenGraph,
  title: string,
  python: PythonPool<
    { method: "embedding"; input: string },
    { embedding: number[] }
  >,
  category: Category,
  tags: Tag[],
  brand?: Brand,
): Promise<Product> {
  const derivedInfo = await python.send({ method: "embedding", input: title })
  return {
    id: randomUUID(),
    title,
    images: ld.image ?? og.image,
    description: ld.description ?? og.description ?? head.description,
    brand: brand?.name,
    category: category.name,
    tags: tags.map((t) => t.name),
    embedding: derivedInfo.embedding,
  }
}

export default product
