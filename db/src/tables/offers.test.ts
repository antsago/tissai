import { expect, describe, it, beforeEach } from "vitest"
import { OFFER, MockPg, PAGE } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as TRACES } from "./traces"
import { TABLE as OFFERS, create } from "./offers"

describe("offers", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(PAGE.id, OFFER)

    expect(pg).toHaveInserted(OFFERS, [
      OFFER.id,
      OFFER.url,
      OFFER.site,
      OFFER.product,
      OFFER.seller,
      OFFER.price,
      OFFER.currency,
    ])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, OFFERS.toString(), OFFER.id])
  })
})
