import { addSchema, type Schemas } from "./addSchema.js"
import titles from "./titles.js"
import { LLM } from "../trainer/label/index.js"
import { Tokenizer } from "@tissai/tokenizer"
import { getSchema as getSchemaRaw } from "./getSchema.js"

const llm = LLM()
const tokenizer = Tokenizer()

const getSchema = getSchemaRaw(tokenizer, llm)

const finalSchemas = (await Promise.all([titles[0], titles[1]].map(getSchema)))
  .filter((s) => !!s)
  .reduce((schemas, schema) => addSchema(schema, schemas), {} as Schemas)

console.log(JSON.stringify(finalSchemas, null, 2))

llm.close()
tokenizer.close()
