import { infer } from "@tissai/tokenizer"
import { extractFilters } from "./extractFilters"

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
