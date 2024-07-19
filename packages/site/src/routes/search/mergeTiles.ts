import type { Search } from "@tissai/db"

function mergeTiles({ products, suggestions }: Search) {
  return [...products, ...suggestions]
}

export default mergeTiles
