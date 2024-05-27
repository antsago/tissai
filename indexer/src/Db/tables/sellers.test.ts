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
    const seller = {
      name: OFFER.seller,
    }
    await create(connection)(PAGE.id, seller)

    expect(pg).toHaveInserted(SELLERS, [seller.name])
    expect(pg).toHaveInserted(TRACES, [
      PAGE.id,
      SELLERS.toString(),
      seller.name,
    ])
  })
})
