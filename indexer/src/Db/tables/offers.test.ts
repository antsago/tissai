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
    const offerId = "a7a9160a-b3fd-4fed-97fe-7032322da08c"
    const productId = "1a13b49d-b43d-4eba-838d-a77c9d94f743"
    await create(connection)(PAGE.id, offerId, PAGE.url, PAGE.site,
productId, OFFER.seller, OFFER.price, OFFER.curency)

    expect(pg).toHaveInserted(OFFERS, [offerId, PAGE.url, PAGE.site,
productId, OFFER.seller, OFFER.price, OFFER.curency])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, OFFERS.toString(), offerId])
  })
})
