import { expect, describe, it, beforeEach } from "vitest"
import { OFFER, MockPg } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as OFFERS, create } from "./offers"

describe("offers", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(OFFER)

    expect(pg).toHaveInserted(OFFERS, [
      OFFER.id,
      OFFER.url,
      OFFER.site,
      OFFER.product,
      OFFER.seller,
      OFFER.price,
      OFFER.currency,
    ])
  })
})
