import type { Db } from "@tissai/db"
import { type OnPage } from "../PageServer/index.js"
import { type Tokenizer } from "@tissai/tokenizer"
import { type LLM, label } from "./labeler/index.js"
import { updateNetwork } from "./updateNetwork.js"
import { parsePage } from "./parsePage/index.js"

export const processPage: OnPage<{
  llm: LLM
  tokenizer: Tokenizer
  db: Db
}> = async (page, { llm, tokenizer, db, reporter }) => {
  const product = await parsePage(page.body)

  if (!product.title) {
    reporter.log(`No title found for page ${page.id} (${page.url})`)
    return
  }

  const interpretation = await label(llm, tokenizer)(product.title)

  await updateNetwork(interpretation, db)
}
