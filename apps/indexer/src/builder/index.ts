import { getCategory } from "./getCategory.js"
import { getAttributes } from "./getAttributes.js"
import { addSchema, type Schemas } from "./addSchema.js"
import titles from "./titles.js"
import { LLM } from "../trainer/label/index.js"
import { Tokenizer } from "@tissai/tokenizer"

const llm = LLM()
const tokenizer = Tokenizer()

const finalSchemas = (await Promise.all(titles.map(async (title) => {
  const category = await getCategory(title, llm)
  const attributes = await getAttributes(title, tokenizer)
  return { category, attributes}
}))).reduce((schemas, schema) => addSchema(schema, schemas), {} as Schemas)

console.log(JSON.stringify(finalSchemas, null, 2))

llm.close()
tokenizer.close()
