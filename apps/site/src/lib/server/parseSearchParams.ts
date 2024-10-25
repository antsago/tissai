import { infer } from "@tissai/tokenizer"
import { extractFilters, type UrlParams } from "./extractFilters"
import { labelFilters } from "./labelFilters"
import { inferFilters } from "./inferFilters"

export async function normalizeFilters(query: string | undefined, { category, attributes, ...otherFilters }: UrlParams, locals: App.Locals) {
  if (!query) {
    return otherFilters
  }
  
  if (category) {
    const labeled = await labelFilters(category, attributes, locals.db)

    if (labeled.category) {
      return {
        ...otherFilters,
        ...labeled,
      }
    }
  }

  const infered = await inferFilters(query, locals)

  return {
    ...otherFilters,
    ...infered,
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
