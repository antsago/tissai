import type { Search } from "@tissai/db"

function mergeTiles({ products, suggestions }: Search) {
  let currentProduct = 0
  let currentSuggestion = 0

  return new Array(products.length + suggestions.length)
    .fill(undefined)
    .map((_, i) => {
      const suggestionPosition =
        currentSuggestion < suggestions.length
          ? Math.floor(
              Math.abs((suggestions[currentSuggestion]?.frequency - 0.01) * 5),
            )
          : undefined
      if (i % 5 === suggestionPosition) {
        currentSuggestion += 1
        return suggestions[currentSuggestion - 1]
      }

      currentProduct += 1
      return products[currentProduct - 1]
    })
    .filter((tile) => !!tile)
}

export default mergeTiles
