import { Compiler, Required, Tokenizer, Schema, Type } from "../parser/index.js"
import type { Reporter } from "../PageServer/index.js"
import { LLM, label } from "./labeler/index.js"

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

export const llmFixture = (reporter: Reporter) => {
  const llm = LLM(reporter)
  return [
    llm,
    () => llm?.close(),
  ] as const
}
export const tokenizerFixture = () => {
  const tokenizer = Tokenizer()
  return [
    tokenizer,
    () => tokenizer?.close(),
  ] as const
}
