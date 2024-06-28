import type { Tag } from "@tissai/db"
import type { PythonPool } from "@tissai/python-pool"

async function tags(
  title: string,
  python: PythonPool<{ method: "tags", input: string}, { tags: string[] }>
): Promise<Tag[]> {
  const derivedInfo = await python.send({ method: "tags", input: title })

  return derivedInfo.tags.map((t) => ({ name: t }))
}

export default tags
