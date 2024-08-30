import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import { type Token, Lexer } from "../lexer/index.js"
import { type Label, getLabels } from "./labelTokens.js"
import { LabelMap } from "../parser/types.js"
import { Ontology, Required } from "../parser/grammar/index.js"
import { TokenReader } from "../parser/TokenReader.js"

const updateMapping = (
  mapping: LabelMap,
  labeled: (Token & { labels: string[] })[],
) =>
  labeled
    .filter((t) => t.isMeaningful && !!t.labels.length)
    .forEach(({ labels, text }) => labels.forEach(label => {
      mapping[text] = {
        ...(mapping[text] ?? {}),
        [label]: (mapping[text]?.[label] ?? 0) + 1,
      }
    }))

reporter.progress("Initializing database and pools")

const db = Db()
const lexer = Lexer()
const python = PythonPool<{ title: string; words: string[] }, Label[]>(
  `./labelWords.py`,
  console,
)
const Parser = Ontology([{
  [Required]: {
    key: "@type",
    value: "Product",
  },
  title: {
    name: "name",
    parse: {
      as: "tokens",
      with: async (title: string) => lexer.fromText(title, getLabels(title, python))
    },
  }
}])

const [{ count: pageCount }] = await db.query(
  query
    .selectFrom("pages")
    .select(({ fn }) => fn.count("id").as("count"))
    .compile(),
)
const products = await db.stream(
  query.selectFrom("pages").select(["body", "url", "id"]).compile(),
)

const TOKEN_LABEL_MAPPING = {} as LabelMap
let index = 1
for await (let { id, body, url } of products) {
  try {
    reporter.progress(
      `Processing page ${index}/${pageCount}: ${id} (${url})`,
    )

    const tokens = lexer.fromPage(body)
    const entities = await Parser(TokenReader(tokens))
    if (typeof entities !== "symbol") {
      const labeledTokens = entities
        .filter(entity => typeof(entity) !== "symbol" && "tokens" in entity)
        .map(product => product.tokens)
        .flat()
      updateMapping(TOKEN_LABEL_MAPPING, labeledTokens)
    }

    index += 1
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    reporter.error(`[${id} (${url})]: ${message}`)
  }
}

reporter.succeed(`Processed ${pageCount} pages`)
console.log(JSON.stringify(TOKEN_LABEL_MAPPING))

await db.close()
await lexer.close()
await python.close()
