import { Db, query } from "@tissai/db"
import { PythonPool } from "@tissai/python-pool"
import { reporter } from "../Reporter.js"
import { type Token, Lexer } from "../lexer/index.js"
import { type Label, getLabels } from "./labelTokens.js"
import { LabelMap } from "../parser/types.js"
import { Attributes, Ontology, Required } from "../parser/grammar/index.js"
import { TokenReader } from "../parser/TokenReader.js"

const updateMapping = (
  mapping: LabelMap,
  labeled: (Token & { labels: string[] })[],
) =>
  labeled
    .filter((t) => t.isMeaningful && !!t.labels.length)
    .flatMap(({ labels, text }) => labels.map(label => ({ label, text })))
    .forEach(({ label, text }) => {
      mapping[text] = {
        ...(mapping[text] ?? {}),
        [label]: (mapping[text]?.[label] ?? 0) + 1,
      }
    })

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
      as: "parsedTitle",
      with: async (title: string) => {
        const tokens = await lexer.fromText(title, getLabels(title, python))
        const attributes = await Attributes(TokenReader(tokens))
        return { attributes, tokens }
      }
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
      const products = entities
        .filter(entity => typeof(entity) !== "symbol" && "parsedTitle" in entity)
        .map(product => product.parsedTitle)

      updateMapping(TOKEN_LABEL_MAPPING, products.map(p => p.tokens).flat())
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
