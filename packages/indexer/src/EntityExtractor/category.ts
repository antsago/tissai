import type { Category, Db } from "@tissai/db"
import type { PythonPool } from "@tissai/python-pool"

async function category(
  title: string,
  python: PythonPool<
    { method: "category"; input: string },
    { category: string }
  >,
  db: Db
): Promise<Category> {
  const derivedInfo = await python.send({ method: "category", input: title })
  const entity = {
    name: derivedInfo.category,
  }

  await db.categories.create(entity)

  return entity
}

export default category
