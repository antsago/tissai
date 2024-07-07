import type { Attribute, Db, Page } from "@tissai/db"
import type { PythonPool } from "@tissai/python-pool"
import { randomUUID } from "node:crypto"

async function attributes(
  title: string,
  page: Page,
  python: PythonPool<
    { method: "attributes"; input: string },
    { attributes: { label: string; value: string }[] }
  >,
  db: Db,
): Promise<Attribute[]> {
  const derivedInfo = await python.send({ method: "attributes", input: title })
  const entities = derivedInfo.attributes.map((att) => ({
    id: randomUUID(),
    page: page.id,
    ...att,
  }))

  await Promise.all(entities.map((att) => [db.attributes.create(att)]))

  return entities
}

export default attributes
