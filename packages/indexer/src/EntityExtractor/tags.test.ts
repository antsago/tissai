import { expect, describe, test, beforeEach } from "vitest"
import { mockPythonFixture } from "@tissai/python-pool/mocks"
import { PythonPool } from "@tissai/python-pool"
import { mockDbFixture } from "@tissai/db/mocks"
import { Db, TAGS } from "@tissai/db"
import tags from "./tags.js"

type Fixtures = {
  mockPython: mockPythonFixture
  pg: mockDbFixture
}

const it = test.extend<Fixtures>({
  mockPython: [mockPythonFixture, { auto: true }],
  pg: [mockDbFixture as any, { auto: true }],
})

describe("tags", () => {
  const TITLE = "Product title"
  let db: Db
  let pool: PythonPool<any, any>
  beforeEach<Fixtures>(async ({ pg }) => {
    db = Db()
    pool = PythonPool("script", { log: () => {} })

    pg.pool.query.mockResolvedValue({ rows: [] })
  })

  it("extracts tag", async ({ mockPython, pg }) => {
    const foundTags = ["myTag"]
    mockPython.mockReturnValue({ tags: foundTags })

    const result = await tags(TITLE, pool, db)

    expect(result).toStrictEqual([
      {
        name: foundTags[0],
      },
    ])
    expect(mockPython.worker.send).toHaveBeenCalledWith({
      method: "tags",
      input: TITLE,
    })
    expect(pg).toHaveInserted(TAGS, foundTags)
  })

  it("extracts multiple tags", async ({ mockPython, pg }) => {
    const foundTags = ["two", "tags"]
    mockPython.mockReturnValue({ tags: foundTags })

    const result = await tags(TITLE, pool, db)

    expect(result).toStrictEqual([
      { name: foundTags[0] },
      { name: foundTags[1] },
    ])
    expect(pg).toHaveInserted(TAGS, [foundTags[0]])
    expect(pg).toHaveInserted(TAGS, [foundTags[1]])
  })
})
