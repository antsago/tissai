import { expect, describe, it, beforeEach } from "vitest"
import { MockPg, SELLER } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as SELLERS, create } from "./sellers"

describe("sellers", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(SELLER)

    expect(pg).toHaveInserted(SELLERS, [SELLER.name])
  })
})
