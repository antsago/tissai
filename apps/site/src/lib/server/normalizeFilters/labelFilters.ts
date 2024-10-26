import type { Db } from "@tissai/db"

export async function labelFilters(
  category: string,
  attributes: undefined | string[],
  db: Db,
) {
  const labeled = await db.nodes.toFilters(category, attributes)

  if (!labeled?.id) {
    return {}
  }

  return {
    category: {
      label: "categoría",
      id: labeled.id,
      name: labeled.name,
    },
    attributes: labeled.attributes ?? undefined,
  }
}
