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
import { extractSchemas } from "./extractSchemas.js"

export const ProductType = Symbol("Product")

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
          as: "schemas",
          with: async (title: string) => {
            const words = await lexer.fromText(title)
            const result = await python.send({
              title,
              words: words.map((w) => w.text),
            })
            return extractSchemas(result.category, result.properties)
          },
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
