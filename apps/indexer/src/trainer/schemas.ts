import { Compiler, Required, Tokenizer, Schema, Type } from "../parser/index.js"
import type { Reporter } from "../PageServer/index.js"
import { LLM } from "./LlmLabeler/index.js"
import { label } from "./labeler/index.js"

export const ProductType = Symbol("Product")

const getSchemas =
  (llm: LLM) =>
  (tokenizer: Tokenizer): Schema[] => [
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
          with: label(llm, tokenizer),
        },
      },
    },
  ]

export const compilerFixture = (reporter: Reporter) => {
  const llm = LLM(reporter)
  const compiler = Compiler(getSchemas(llm))
  return [
    compiler,
    () => Promise.all([compiler?.close(), llm?.close()]),
  ] as const
}
