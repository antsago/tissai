import { expect, describe, it, beforeEach } from "vitest"
import { BRAND, MockPg, PAGE } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as TRACES } from "./traces"
import { TABLE as BRANDS, create } from "./brands"

describe("brands", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(PAGE.id, BRAND.name, BRAND.logo)

    expect(pg).toHaveInserted(BRANDS, [BRAND.name, BRAND.logo])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, BRANDS.toString(), BRAND.name])
  })
})
