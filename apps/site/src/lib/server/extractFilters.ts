import type { SearchParams as SP } from "@tissai/db"
import { infer } from "@tissai/tokenizer"

type SearchParams = SP & { category?: string }
export function extractFilters(params: URLSearchParams) {
  const defaultFilters: SearchParams = {
    query: "",
    attributes: undefined,
    brand: undefined,
    max: undefined,
    min: undefined,
    category: undefined,
  }

  return [...params.entries()].reduce((filters, [key, value]) => {
    switch (key) {
      case "q":
        return {
          ...filters,
          query: value,
        }
      case "cat":
        return {
          ...filters,
          category: value,
        }
      case "brand":
        return {
          ...filters,
          brand: value,
        }
      case "min":
        return {
          ...filters,
          min: parseFloat(value),
        }
      case "max":
        return {
          ...filters,
          max: parseFloat(value),
        }
      default:
        return {
          ...filters,
          attributes: [...(filters.attributes ?? []), value],
        }
    }
  }, defaultFilters)
}

export async function parseSearchParams(
  params: URLSearchParams,
  locals: App.Locals,
) {
  const explicitFilters = extractFilters(params)

  if (explicitFilters.category) {
    return explicitFilters
  }

  const words = await locals.tokenizer.fromText(explicitFilters.query)
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
