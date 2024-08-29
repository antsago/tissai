import { TokenReader } from "./TokenReader.js"
import mapping from "./mapping.js"
import { Compiler } from "./Compiler.js"
import { Ontology, Attributes, Required } from "./grammar/index.js"
import { Page } from "@tissai/db"
import { parsePage } from "./parsePage.js"

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
const compiler = await Compiler(mapping)

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
        with: compiler.compile(Attributes),
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

await compiler.close()
console.dir(result, { depth: null })
