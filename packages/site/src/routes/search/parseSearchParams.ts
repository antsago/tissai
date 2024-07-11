import type { SearchParams } from "@tissai/db"

function parseSearchParams(params: URLSearchParams) {
  const defaultFilters: SearchParams = {
    query: "",
    attributes: {},
    tags: [],
    brand: undefined,
    category: undefined,
    max: undefined,
    min: undefined,
  }

  return [...params.entries()].reduce((filters, [key, value]) => {
    switch (key) {
      case "q":
        return {
          ...filters,
          query: value,
        }
      case "brand":
        return {
          ...filters,
          brand: value,
        }
      case "category":
        return {
          ...filters,
          category: value,
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
      case "inc":
        return {
          ...filters,
          tags: [...(filters.tags ?? []), value],
        }
      default:
        return {
          ...filters,
          attributes: {
            ...filters.attributes,
            [key]: [...(filters.attributes?.[key] ?? []), value],
          },
        }
    }
  }, defaultFilters)
}

export default parseSearchParams
