import { expect, describe, test, beforeEach } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { PythonPool } from "@tissai/python-pool"
import { mockDbFixture, PAGE } from "@tissai/db/mocks"
import { Db, ATTRIBUTES } from "@tissai/db"
import attributes from "./attributes.js"

type Fixtures = {
  mockPython: mockPythonFixture
  pg: mockDbFixture
}

const it = test.extend<Fixtures>({
  mockPython: [mockPythonFixture, { auto: true }],
  pg: [mockDbFixture as any, { auto: true }],
})

describe("attributes", () => {
  let db: Db
  let pool: PythonPool<any, any>
  beforeEach<Fixtures>(async ({ pg }) => {
    db = Db()
    pool = PythonPool("script", { log: () => {} })

    pg.pool.query.mockResolvedValue({ rows: [] })
  })

  it("extracts attribute", async ({ mockPython, pg }) => {
    const TITLE = "attribute"
    const foundAttributes = [{ label: "test", value: "attribute", offset: 0 }]
    mockPython.mockReturnValue({ attributes: foundAttributes })

    const result = await attributes(TITLE, PAGE, pool, db)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        page: PAGE.id,
        label: foundAttributes[0].label,
        value: foundAttributes[0].value,
      },
    ])
    expect(mockPython.worker.send).toHaveBeenCalledWith({
      method: "attributes",
      input: TITLE,
    })
    expect(pg).toHaveInserted(ATTRIBUTES, [
      foundAttributes[0].label,
      foundAttributes[0].value,
      PAGE.id,
    ])
  })

  it("extracts multiple attributes", async ({ mockPython, pg }) => {
    const TITLE = "attribute value"
    const foundAttributes = [
      { label: "first", value: "attribute", offset: 0 },
      { label: "second", value: "value", offset: 10 },
    ]
    mockPython.mockReturnValue({ attributes: foundAttributes })

    const result = await attributes(TITLE, PAGE, pool, db)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        page: PAGE.id,
        label: foundAttributes[0].label,
        value: foundAttributes[0].value,
      },
      {
        id: expect.any(String),
        page: PAGE.id,
        label: foundAttributes[1].label,
        value: foundAttributes[1].value,
      },
    ])
    expect(pg).toHaveInserted(ATTRIBUTES, [foundAttributes[0].label])
    expect(pg).toHaveInserted(ATTRIBUTES, [foundAttributes[1].label])
  })

  it("merges consecutive attributes with same label", async ({ mockPython, pg }) => {
    const TITLE = "Product and title"
    const foundAttributes = [
      { label: "category", value: "Product", offet: 0 },
      { label: "category", value: "title", offset: 12 },
    ]
    mockPython.mockReturnValue({ attributes: foundAttributes })

    const result = await attributes(TITLE, PAGE, pool, db)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        page: PAGE.id,
        label: "category",
        value: TITLE,
      },
    ])
  })
})
