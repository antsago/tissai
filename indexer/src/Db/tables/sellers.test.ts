import { expect, describe, it, beforeEach } from "vitest"
import { MockPg, PAGE, OFFER } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as TRACES } from "./traces"
import { TABLE as SELLERS, create } from "./sellers"

describe("sellers", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(PAGE.id, OFFER.seller)

    expect(pg).toHaveInserted(SELLERS, [OFFER.seller])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, SELLERS.toString(), OFFER.seller])
  })
})
