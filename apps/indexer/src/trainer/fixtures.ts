import { Db } from "@tissai/db"
import { Tokenizer } from "@tissai/tokenizer"
import type { Fixture } from "../Crawler/index.js"
import { LLM } from "./labeler/index.js"

export const dbFixture: Fixture<Db> = async () => {
  const db = Db()
  await db.initialize()

  return [db, () => db.close()] as const
}

export const llmFixture: Fixture<LLM> = (reporter) => {
  const llm = LLM(reporter)
  return [llm, () => llm?.close()] as const
}

export const tokenizerFixture: Fixture<Tokenizer> = () => {
  const tokenizer = Tokenizer()
  return [tokenizer, () => tokenizer?.close()] as const
}
