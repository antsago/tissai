import type { SearchParams } from "@tissai/db"

export function extractFilters(params: URLSearchParams) {
  const defaultFilters: SearchParams = {
    query: "",
    attributes: {},
    brand: undefined,
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
          attributes: {
            ...filters.attributes,
            [key]: [...(filters.attributes?.[key] ?? []), value],
          },
        }
    }
  }, defaultFilters)
}

export function parseSearchParams(params: URLSearchParams) {
  return extractFilters(params)
}