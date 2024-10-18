import { describe, test, beforeEach } from "vitest"
import { mockDbFixture, queries } from "@tissai/db/mocks"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { Tokenizer } from "@tissai/tokenizer"
import { Db } from "@tissai/db"
import { extractEntities } from "./extractEntities.js"

type Fixtures = { db: mockDbFixture, python: mockPythonFixture }

const it = test.extend<Fixtures>({
  db: [mockDbFixture, { auto: true }],
  python: [mockPythonFixture, { auto: true }],
})

describe("extractEntities", () => {
  const FULL_INFO = {
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
  const NODES = {
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

  let db: Db
  let tokenizer: Tokenizer
  beforeEach<Fixtures>(({ python, db: pg }) => {
    db = Db()
    tokenizer = Tokenizer()

    pg.pool.query.mockResolvedValue({ rows: [NODES]})
    python.mockReturnValue([{ text: FULL_INFO.title }])
  })

  it("extracts entities", async ({ expect, python, db: pg }) => {
    const result = await extractEntities(FULL_INFO, tokenizer, db)

    expect(python.worker.send).toHaveBeenCalledWith(FULL_INFO.title)
    expect(pg).toHaveExecuted(queries.nodes.match([FULL_INFO.title]))
    expect(result).toStrictEqual({
      brand: {
        name: FULL_INFO.brandName,
        logo: FULL_INFO.brandLogo, 
      },
      product: {
        title: FULL_INFO.title,
        description: FULL_INFO.description,
        images: FULL_INFO.images,
        category: NODES.name,
        attributes: [{ label: NODES.children[0].name, value: NODES.children[0].children[0].name }],
      },
      offers: FULL_INFO.offers,
    })
  })

  it("throws if no title", async ({ expect }) => {
    const info = {
      ...FULL_INFO,
      title: undefined,
    }

    const act = extractEntities(info, tokenizer, db)

    expect(act).rejects.toThrow()
  })
})
