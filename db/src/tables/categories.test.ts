import { expect, describe, it, beforeEach } from "vitest"
import { CATEGORY, MockPg, PAGE } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as TRACES } from "./traces"
import { TABLE as CATEGORIES, create } from "./categories"

describe("categories", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(PAGE.id, CATEGORY)

    expect(pg).toHaveInserted(CATEGORIES, [CATEGORY.name])
    expect(pg).toHaveInserted(TRACES, [
      PAGE.id,
      CATEGORIES.toString(),
      CATEGORY.name,
    ])
  })
})
