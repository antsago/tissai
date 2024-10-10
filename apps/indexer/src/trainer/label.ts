import { CATEGORY_LABEL } from "@tissai/db"
import type { Tokenizer } from "../parser/index.js"
import type { LLM } from "./LlmLabeler/index.js"
import { extractSchemas } from "./extractSchemas.js"
import { getProperties } from "./getProperties.js"

export const label = (llm: LLM, tokenizer: Tokenizer) =>
  async (title: string) => {
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
  }
