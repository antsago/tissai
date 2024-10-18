import { describe, test, beforeEach } from "vitest"
import { mockDbFixture, queries } from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Tokenizer } from "@tissai/tokenizer"
import { Db } from "@tissai/db"
import { extractEntities } from "./extractEntities.js"

const it = test.extend<{ db: mockDbFixture, python: mockPythonFixture }>({
  db: [mockDbFixture, { auto: true }],
  python: [mockPythonFixture, { auto: true }],
})

describe("extractEntities", () => {
  it("extracts entities", async ({ expect, python, db: pg }) => {
    const info = {
      title: "title",
      brandLogo: "logo",
      brandName: "brand name",
      description: "description",
      images: ["a.jpg"],
      offers: [{
        currency: "EUR",
        price: 10,
        seller: "seller",
      }]
    }
    const nodes = {
      name: "category",
      tally: 1,
      children: [{
        name: "label",
        tally: 1,
        children: [{
          name: "value",
          tally: 1,
        }]
      }],
    }
    python.mockReturnValue([{ text: info.title }])
    pg.pool.query.mockResolvedValue({ rows: [nodes]})
    const tokenizer = Tokenizer()
    const db = Db()

    const result = await extractEntities(info, tokenizer, db)

    expect(python.worker.send).toHaveBeenCalledWith(info.title)
    expect(pg).toHaveExecuted(queries.nodes.match([info.title]))
    expect(result).toStrictEqual({
      brand: {
        name: info.brandName,
        logo: info.brandLogo, 
      },
      product: {
        title: info.title,
        description: info.description,
        images: info.images,
        category: nodes.name,
        attributes: [{ label: nodes.children[0].name, value: nodes.children[0].children[0].name }],
      },
      offers: info.offers,
    })
  })
})
