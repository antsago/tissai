import type { Search, Suggestion } from "@tissai/db"

const SUGGESTION_DISTANCE = 5

function mergeTiles(products: Search[], suggestions: Suggestion[]) {
  let productIndex = 0
  let suggestionIndex = 0

  return new Array(suggestions.length + products.length).fill(undefined)
    .map((_, index) => {
      if (productIndex >= products.length) {
        return
      }

      if (suggestionIndex < suggestions.length && index % SUGGESTION_DISTANCE === 0) {
        const tile = suggestions[suggestionIndex]
        suggestionIndex += 1
        return tile
      }

      const tile = products[productIndex]
      productIndex += 1
      return tile
    })
    .filter(tile => tile !== undefined)
}

export default mergeTiles
