import { Lexer, Ontology, type Schema, TokenReader } from "../parser/index.js"
import { getSchemas } from "./schemas.js"
import { Compiler } from "./Compiler.js"

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

const compiler = Compiler(getSchemas)
const result = await compiler.parse(testPage)
await compiler.close()

console.dir(result, { depth: null })
