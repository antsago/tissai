import { CATEGORY_LABEL } from "@tissai/db"
import type { Tokenizer } from "../../parser/index.js"
import type { LLM } from "./LLM/index.js"
import { assignLabels } from "./assignLabels.js"
import { getProperties } from "./getProperties.js"

export const label =
  (llm: LLM, tokenizer: Tokenizer) => async (title: string) => {
    const words = await tokenizer.fromText(title)
    const propertyCandidates = await getProperties(
      llm,
      title,
      words.map((w) => w.text),
    )

    const properties = assignLabels(propertyCandidates)

    const category = properties.find((s) => s.label === CATEGORY_LABEL)
    if (!category) {
      throw new Error("No property categoría found")
    }

    return {
      category: category.value,
      attributes: properties.filter((s) => s.label !== CATEGORY_LABEL),
    }
  }
