import { type Tokenizer } from "@tissai/tokenizer"
import { type LLM } from "../trainer/label/LLM/index.js"
import { getCategory } from "./getCategory.js"
import { getAttributes } from "./getAttributes.js"
import { identifyCategoryWord } from "./identifyCategoryWord.js"
import { Schema } from "./addSchema.js"

export const getSchema =
  (tokenizer: Tokenizer, llm: LLM) =>
  async (title: string): Promise<Schema> => {
    const category = await getCategory(title, llm)
    const words = await getAttributes(title, tokenizer)

    const categoryWord = identifyCategoryWord(category, words)

    return {
      category,
      categoryWord,
      attributes: words.filter((w) => w !== categoryWord),
    }
  }
