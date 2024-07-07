import type { Attribute, Db, Page } from "@tissai/db"
import type { PythonPool } from "@tissai/python-pool"
import { randomUUID } from "node:crypto"

export type PythonAttribute = { label: string; value: string, offset: number }
function* mergeWords(title: string, words: PythonAttribute[]): Generator<Omit<PythonAttribute, "offset">> {
  const getFragment = (start: number, end: number) => {
    const initialW = words.at(start) as PythonAttribute
    const finalW = words.at(end) as PythonAttribute
    
    return title.slice(initialW.offset, finalW.offset + finalW.value.length)
  }

  let yieldFrom = 0
  for (const [index, word] of words.entries()) {
    if (index === 0 || words[index-1].label === word.label) {
      continue
    }

    yield {
      label: words[index-1].label,
      value: getFragment(yieldFrom, index-1)
    }
    yieldFrom = index
  }

  yield {
    label: words.at(-1)?.label as string,
    value: getFragment(yieldFrom, words.length-1)
  }
}

async function attributes(
  title: string,
  page: Page,
  python: PythonPool<
    { method: "attributes"; input: string },
    { attributes: PythonAttribute[] }
  >,
  db: Db,
): Promise<Attribute[]> {
  const derivedInfo = await python.send({ method: "attributes", input: title })
  const labelled = derivedInfo.attributes
  const merged = [...mergeWords(title, labelled)]
  const entities = merged.map((att) => ({
    id: randomUUID(),
    page: page.id,
    ...att,
  }))

  await Promise.all(entities.map((att) => [db.attributes.create(att)]))

  return entities
}

export default attributes
