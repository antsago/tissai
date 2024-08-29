import { Page } from "@tissai/db"
import { type Token as LexerToken, Lexer, Required } from "../lexer/index.js"
import { TokenReader } from "./TokenReader.js"
import mapping from "./mapping.js"
import { Ontology, Attributes } from "./grammar/index.js"
import { parsePage } from "../lexer/parsePage.js"
import { LabelMap } from "./types.js"

const getLabels = (map: LabelMap) => (tokens: LexerToken[]) =>
  tokens.map((t) => t.text in map ? Object.keys(map[t.text]) : ["unknown"])

const testPage: Page = {
  id: "test-id",
  site: "site-id",
  url: "https://example.com/page.html",
  body: `
    <html>
      <head>
          <script type="application/ld+json">
            ${JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              name: "The name of the product",
              productID: "121230",
              description: "The description",
              image: [
                "https://example.com/image.jpg",
                "https://example.com/image2.jpg",
                2,
              ],
              brand: {
                "@type": "Brand",
                name: "WEDZE",
                image: ["https://brand.com/image.jpg"],
              },
            })}
          </script>
      </head>
    </html>
  `,
}

const tokens = parsePage(testPage)
const reader = TokenReader(tokens)
const lexer = Lexer()

const Product = Ontology([
  {
    [Required]: {
      key: "@type",
      value: "Product",
    },
    title: {
      name: "name",
      parse: {
        as: "attributes",
        with: async (title: string) => {
          const tokens = await lexer.fromText(title, getLabels(mapping))
          return Attributes(TokenReader(tokens))
        },
      },
    },
    brand: {
      name: "brand",
      isReference: true,
    },
    description: "description",
    images: "image",
  },
  {
    [Required]: {
      key: "@type",
      value: "Brand",
    },
    name: "name",
    icon: "image",
  },
])

const result = await Product(reader)

await lexer.close()
console.dir(result, { depth: null })
