import type { Tag, Db } from "@tissai/db"
import type { PythonPool } from "@tissai/python-pool"

async function tags(
  title: string,
  python: PythonPool<{ method: "tags"; input: string }, { tags: string[] }>,
  db: Db,
): Promise<Tag[]> {
  const derivedInfo = await python.send({ method: "tags", input: title })

  const entities = derivedInfo.tags.map((t) => ({ name: t }))

  await Promise.all(entities.map((tag) => [db.tags.create(tag)]))

  return entities
}

export default tags
