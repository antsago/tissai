import { type Token, Required, Lexer, Schema, Type } from "../parser/index.js"
import type { LlmLabeler } from "./LlmLabeler/index.js"

export const ProductType = Symbol("Product")

export const getLabels =
  (title: string, python: LlmLabeler) => async (tokens: Token[]) => {
    const words = tokens.map((t) => t.originalText)
    const labels = await python.send({ title, words })
    return labels.map((l) => l.label)
  }

export const getSchemas =
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
          as: "parsedTitle",
          with: (title: string) =>
            lexer.fromText(title, getLabels(title, python)),
        },
      },
    },
  ]
