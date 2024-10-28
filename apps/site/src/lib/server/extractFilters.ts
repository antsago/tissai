export type UrlParams = {
  attributes?: string[]
  brand?: string
  max?: number
  min?: number
  category?: string
}

export function extractFilters(params: URLSearchParams) {
  return Array.from(params.entries()).reduce(
    (filters, [key, value]) => {
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
        case "att":
          return {
            ...filters,
            attributes: [...(filters.attributes ?? []), value],
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
          return filters
      }
    },
    { query: "" } as (UrlParams & { query: string }),
  )
}
