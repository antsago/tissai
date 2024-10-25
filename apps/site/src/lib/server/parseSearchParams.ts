import type { Db } from "@tissai/db"
import { infer } from "@tissai/tokenizer"
import { extractFilters } from "./extractFilters"

export async function labelFilters(
  category: string,
  attributes: undefined|string[],
  db: Db,
) {
  const labeled = await db.nodes.toFilters(category, attributes)

  if (!labeled.id) {
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

export async function inferFilters(query: string, locals: App.Locals) {
  const words = await locals.tokenizer.fromText(query)
  const infered = await infer(
    words.filter((w) => w.isMeaningful).map((w) => w.text),
    locals.db,
  )

  if (!infered.category) {
    return {}
  }

  return {
    category: {
      label: "categoría",
      id: infered.category.id,
      name: infered.category.name,
    },
    attributes: infered.attributes.map((att) => ({
      name: att.value.name,
      label: att.label.name,
      id: att.value.id,
    })),
  }
}

export async function parseSearchParams(
  params: URLSearchParams,
  locals: App.Locals,
) {
  const { query, ...explicitFilters } = extractFilters(params)

  if (explicitFilters.category) {
    return explicitFilters
  }

  const words = await locals.tokenizer.fromText(query ?? "")
  const infered = await infer(
    words.filter((w) => w.isMeaningful).map((w) => w.text),
    locals.db,
  )

  return {
    ...explicitFilters,
    category: infered.category?.name,
    attributes: infered.attributes.map((att) => att.value.name),
  }
}
