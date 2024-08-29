import { Token } from "./normalizer.js"

export type Labeler = (tokens: Token[]) => Promise<string[][]> | string[][]

export const labelTokens = async (
  tokens: Token[],
  getLabels: Labeler,
) => {
  const labels = await getLabels(tokens.filter((t) => t.isMeaningful))

  let labelsIndex = 0
  const labeled = tokens.map((t) => {
    if (!t.isMeaningful) {
      return {
        ...t,
        labels: [],
      }
    }

    const wordLabels = labels[labelsIndex]
    labelsIndex += 1

    return {
      ...t,
      labels: wordLabels,
    }
  })

  return labeled
}
