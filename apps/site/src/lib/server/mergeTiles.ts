import type { Search, Suggestion } from "@tissai/db"

function mergeTiles(products: Search[], suggestions: Suggestion[]) {
  return [...suggestions, ...products]
}

export default mergeTiles
