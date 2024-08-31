import { Lexer } from "../lexer/index.js"
import { TokenReader } from "./TokenReader.js"
import { Ontology } from "./grammar/index.js"
import { getSchemas } from "./schemas.js"

const testPage = `
    <html>
      <head>
          <script type="application/ld+json">
            ${JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              name: "Jeans cropped marine azul",
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
  `

const lexer = Lexer()
const tokens = lexer.fromPage(testPage)
const reader = TokenReader(tokens)

const Product = Ontology(getSchemas(lexer))

const result = await Product(reader)

await lexer.close()
console.dir(result, { depth: null })
