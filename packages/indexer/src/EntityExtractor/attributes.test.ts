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
  const TITLE = "Product title"
  let db: Db
  let pool: PythonPool<any, any>
  beforeEach<Fixtures>(async ({ pg }) => {
    db = Db()
    pool = PythonPool("script", { log: () => {} })

    pg.pool.query.mockResolvedValue({ rows: [] })
  })

  it("extracts attribute", async ({ mockPython, pg }) => {
    const foundAttributes = [{ label: "test", value: "attribute" }]
    mockPython.mockReturnValue({ attributes: foundAttributes })

    const result = await attributes(TITLE, PAGE, pool, db)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        page: PAGE.id,
        ...foundAttributes[0],
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

  it("extracts multiple tags", async ({ mockPython, pg }) => {
    const foundAttributes = [
      { label: "first", value: "attribute" },
      { label: "second", value: "value" },
    ]
    mockPython.mockReturnValue({ attributes: foundAttributes })

    const result = await attributes(TITLE, PAGE, pool, db)

    expect(result).toStrictEqual([
      {
        id: expect.any(String),
        page: PAGE.id,
        ...foundAttributes[0],
      },
      {
        id: expect.any(String),
        page: PAGE.id,
        ...foundAttributes[1],
      },
    ])
    expect(pg).toHaveInserted(ATTRIBUTES, [foundAttributes[0].label])
    expect(pg).toHaveInserted(ATTRIBUTES, [foundAttributes[1].label])
  })
})
