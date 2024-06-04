import { expect, describe, it, beforeEach } from "vitest"
import { CATEGORY, MockPg } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as CATEGORIES, create } from "./categories"

describe("categories", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(CATEGORY)

    expect(pg).toHaveInserted(CATEGORIES, [CATEGORY.name])
  })
})
