import { CATEGORY_LABEL } from "@tissai/db"
import { Compiler, Required, Tokenizer, Schema, Type } from "../parser/index.js"
import type { Reporter } from "../PageServer/index.js"
import { LLM } from "./LlmLabeler/index.js"
import { extractSchemas } from "./extractSchemas.js"
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

            const propertyCandidates = await getProperties(
              llm,
              title,
              words.map((w) => w.text),
            )

            const schemas = extractSchemas(propertyCandidates)

            const categoryProperty = schemas.find(
              (s) => s.label === CATEGORY_LABEL,
            )
            if (!categoryProperty) {
              throw new Error("No property categoría found")
            }
            const properties = schemas.filter((s) => s.label !== CATEGORY_LABEL)

            return {
              category: categoryProperty.value,
              properties: properties,
            }
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
