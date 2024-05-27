import { expect, describe, it, beforeEach } from "vitest"
import { DERIVED_DATA, MockPg, PAGE } from "#mocks"
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
    const category = {
      name: DERIVED_DATA.category
    }

    await create(connection)(PAGE.id, category)

    expect(pg).toHaveInserted(CATEGORIES, [category.name])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, CATEGORIES.toString(), category.name])
  })
})
