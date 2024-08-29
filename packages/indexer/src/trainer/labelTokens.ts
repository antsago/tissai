import type { PythonPool } from "@tissai/python-pool"
import type { Token } from "../lexer/index.js"

export type Label = { label: string; value: string }

export const getLabels = async (
  tokens: Token[],
  title: string,
  python: PythonPool<{ title: string; words: string[] }, Label[]>,
) => {
  const words = tokens.map((t) => t.originalText)
  const labels = await python.send({ title, words })
  return labels.map(l => [l.label])
}

export const labelTokens = async (
  tokens: Token[],
  title: string,
  python: PythonPool<{ title: string; words: string[] }, Label[]>,
) => {
  const labels = await getLabels(tokens.filter((t) => t.isMeaningful), title, python)

  let labelsIndex = 0
  const labeled = tokens.map((t) => {
    if (!t.isMeaningful) {
      return {
        ...t,
        label: undefined,
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
