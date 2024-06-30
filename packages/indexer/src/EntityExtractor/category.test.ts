import { expect, describe, test } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { PythonPool } from "@tissai/python-pool"
import { mockDbFixture } from "@tissai/db/mocks"
import { Db, CATEGORIES } from "@tissai/db"
import { DERIVED_DATA } from "#mocks"
import category from "./category"

type Fixtures = {
  mockPython: mockPythonFixture
  pg: mockDbFixture
}

const it = test.extend<Fixtures>({
  mockPython: [mockPythonFixture, { auto: true }],
  pg: [mockDbFixture as any, { auto: true }],
})

describe("categories", () => {
  it("extracts category", async ({ mockPython, pg }) => {
    const TITLE = "The title of the product"
    const pool = PythonPool<any, any>("script", {
      log: () => {},
    })
    mockPython.mockReturnValue(DERIVED_DATA)
    const db = Db()
    pg.pool.query.mockResolvedValue({ rows: [] })

    const result = await category(TITLE, pool, db)

    expect(result).toStrictEqual({
      name: DERIVED_DATA.category,
    })
    expect(mockPython.worker.send).toHaveBeenCalledWith({
      method: "category",
      input: TITLE,
    })
    expect(pg).toHaveInserted(CATEGORIES, [DERIVED_DATA.category])
  })
})
