import type { PythonPool } from "@tissai/python-pool"
import type {
  Brand,
  Category,
  Product,
  Tag,
} from "@tissai/db"
import type { ParsedLd, ParsedOG, ParsedH } from './infoPipelines.js'
import { randomUUID } from "node:crypto"

async function product(ld: ParsedLd, head: ParsedH, og: ParsedOG, title: string, python: PythonPool<string, { embedding: number[] }>, category: Category, tags: Tag[], brand?: Brand): Promise<Product> {
  const derivedInfo = await python.send(title)
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
