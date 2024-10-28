import type { Db, Filters } from "@tissai/db"

const encodeParams = (query: string, filters: Filters) => {
  const params = new URLSearchParams()

  params.append("q", query)
  params.append("cat", filters.category!.id)

  if(filters.attributes) {
    params.append("att", filters.attributes?.[0].id)
  }

  return params.toString()
}

export const getSuggestions = async (query: string, filters: Filters, db: Db) => {
  const suggestions = filters.category
    ? await db.suggestions.attributes(filters.category.id)
    : [await db.suggestions.category()]

  return suggestions
    .filter((s) => !!s.label && !!s.values?.length)
    .map((s) => ({
      ...s,
      values: s.values.map(v => {
        const newFilters = filters.category ? {
          ...filters,
          attributes: [...filters.attributes ?? [], { label: s.label, name: v.name!, id: v.id! }]
        } : {
          ...filters,
          category: {
            name: v.name!,
            id: v.id!,
          },
        }

        return ({
        name: v.name!,
        href: `/search?${encodeParams(query, newFilters)}`
      })
      })
    }))
}
