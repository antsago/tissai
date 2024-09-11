import {
  type Token,
  Compiler,
  Required,
  Lexer,
  Schema,
  Type,
} from "../parser/index.js"
import type { Reporter } from "../PageServer/index.js"
import { LlmLabeler } from "./LlmLabeler/index.js"

export const ProductType = Symbol("Product")

const getLabels =
  (title: string, python: LlmLabeler) => async (tokens: Token[]) => {
    const words = tokens.map((t) => t.originalText)
    const labels = await python.send({ title, words })
    return labels.properties.map((l) => l.labels[0])
  }

const getSchemas =
  (python: LlmLabeler) =>
  (lexer: Lexer): Schema[] => [
    {
      [Type]: ProductType,
      [Required]: {
        key: "@type",
        value: "Product",
      },
      title: {
        name: "name",
        parse: {
          as: "properties",
          with: (title: string) =>
            lexer.fromText(title, getLabels(title, python)),
        },
      },
    },
  ]

export const compilerFixture = (reporter: Reporter) => {
  const python = LlmLabeler(reporter)
  const compiler = Compiler(getSchemas(python))
  return [
    compiler,
    () => Promise.all([compiler?.close(), python?.close()]),
  ] as const
}
