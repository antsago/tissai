import type { PythonPool } from "@tissai/python-pool"
import type { Token } from "../lexer/index.js"
import assert from "node:assert/strict"

export type Label = { label: string; value: string }

export const labelTokens = async (
  tokens: Token[],
  title: string,
  python: PythonPool<{ title: string; words: string[] }, Label[]>,
) => {
  const words = tokens.filter((t) => t.isMeaningful).map((t) => t.originalText)
  const labels = await python.send({ title, words })

  let labelsIndex = 0
  const labeled = tokens.map((t) => {
    if (!t.isMeaningful) {
      return {
        ...t,
        label: undefined,
      }
    }

    const label = labels[labelsIndex]
    assert.equal(
      label.value,
      t.originalText,
      `Expected "${label.value}" to equal "${t.originalText}" in "${title}"`,
    )

    labelsIndex += 1

    return {
      ...t,
      label: label.label,
    }
  })

  return labeled
}
