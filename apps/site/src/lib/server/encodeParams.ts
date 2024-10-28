import type { Filters } from "@tissai/db"

export const encodeParams = (query: string, filters: Filters) => {
  const params = new URLSearchParams()

  params.append("q", query)
  params.append("cat", filters.category!.id)

  if(filters.attributes) {
    params.append("att", filters.attributes?.[0].id)
  }

  return params.toString()
}
