import type { Db, Filters } from "@tissai/db"
import { encodeParams } from "./encodeParams"
import type { UrlParams } from "./decodeParams"

const getCategorySuggestion = async (baseParams: UrlParams, db: Db) => {
  const suggestion = await db.suggestions.category()

  return {
    label: suggestion.label,
    values: suggestion.values?.map((value) => ({
      name: value.name,
      params: {
        ...baseParams,
        category: value.id,
      },
    })),
  }
}

type WithCategory = Omit<UrlParams, "category"> &
  Required<Pick<UrlParams, "category">>
const getAttributeSuggestions = async (baseParams: WithCategory, db: Db) => {
  const suggestions = await db.suggestions.attributes(baseParams.category)

  return suggestions.map((suggestion) => ({
    label: suggestion.label,
    values: suggestion.values?.map((value) => ({
      name: value.name!,
      params: {
        ...baseParams,
        attributes: [...(baseParams.attributes ?? []), value.id!],
      },
    })),
  }))
}

export async function getSuggestions(query: string, filters: Filters, db: Db) {
  const baseParams = {
    query,
    ...filters,
    category: filters.category?.id,
    attributes: filters.attributes?.map((a) => a.id),
  }

  const suggestions =
    baseParams.category === undefined
      ? [await getCategorySuggestion(baseParams, db)]
      : await getAttributeSuggestions(baseParams as any, db)

  return suggestions
    .filter((s) => !!s.label && !!s.values?.length)
    .map((s) => ({
      ...s,
      values: s.values.map((v) => ({
        name: v.name,
        href: `/search?${encodeParams(v.params)}`,
      })),
    }))
}
