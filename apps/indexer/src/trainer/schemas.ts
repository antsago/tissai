import { Compiler, Required, Tokenizer, Schema, Type } from "../parser/index.js"
import type { Reporter } from "../PageServer/index.js"
import { LLM } from "./LlmLabeler/index.js"
import { extractSchemas } from "./extractSchemas.js"
import { getCategory } from "./getCategory.js"
import { getProperties } from "./getProperties.js"

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
          with: async (title: string) => {
            const words = await tokenizer.fromText(title)
            const category = await getCategory(llm, title)

            if (!category) {
              throw new Error("No category detected")
            }

            const properties = await getProperties(
              llm,
              title,
              words.map((w) => w.text),
            )

            const schemas = extractSchemas(category, properties)

            if (!schemas.find((s) => s.label === "categoría")) {
              throw new Error("No property categoría found")
            }

            return schemas
          },
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
