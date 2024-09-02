import { PythonPool } from "@tissai/python-pool"
import { type Token, Required, Lexer } from "../parser/index.js"

export type Label = { label: string; value: string }

export const getLabels =
  (
    title: string,
    python: PythonPool<{ title: string; words: string[] }, Label[]>,
  ) =>
  async (tokens: Token[]) => {
    const words = tokens.map((t) => t.originalText)
    const labels = await python.send({ title, words })
    return labels.map((l) => l.label)
  }

export const getSchemas =
  (python: PythonPool<{ title: string; words: string[] }, Label[]>) =>
  (lexer: Lexer) => [
    {
      [Required]: {
        key: "@type",
        value: "Product",
      },
      title: {
        name: "name",
        parse: {
          as: "parsedTitle",
          with: (title: string) =>
            lexer.fromText(title, getLabels(title, python)),
        },
      },
    },
  ]
