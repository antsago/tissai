import { CATEGORY_LABEL } from "@tissai/db"
import type { Tokenizer } from "@tissai/tokenizer"
import type { LLM } from "./LLM/index.js"
import { assignLabels } from "./assignLabels.js"
import { getProperties } from "./getProperties.js"
import { ParsedInfo } from "../parsePage/index.js"

export const label =
  (llm: LLM, tokenizer: Tokenizer) => async (info: ParsedInfo) => {
    if (!info.title) {
      throw new Error("No title found")
    }

    const words = await tokenizer.fromText(info.title)
    const propertyCandidates = await getProperties(
      llm,
      info.title,
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
