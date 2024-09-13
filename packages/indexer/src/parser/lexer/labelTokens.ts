import { Token } from "./normalizer.js"

export const labelTokens = async (tokens: Token[], labels: string[]) => {
  let labelsIndex = 0
  const labeled = tokens.map((t) => {
    if (!t.isMeaningful) {
      return {
        ...t,
        label: undefined,
      }
    }

    const wordLabel = labels[labelsIndex]
    labelsIndex += 1

    return {
      ...t,
      label: wordLabel,
    }
  })

  return labeled
}
