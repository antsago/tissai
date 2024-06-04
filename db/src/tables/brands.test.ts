import { expect, describe, it, beforeEach } from "vitest"
import { BRAND, MockPg } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as BRANDS, create } from "./brands"

describe("brands", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(BRAND)

    expect(pg).toHaveInserted(BRANDS, [BRAND.name, BRAND.logo])
  })
})
