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
    const offer = {
      id: "a7a9160a-b3fd-4fed-97fe-7032322da08c",
      product: "1a13b49d-b43d-4eba-838d-a77c9d94f743",
      url: PAGE.url,
      site: PAGE.site,
      seller: OFFER.seller,
      price: OFFER.price,
      currency: OFFER.currency,
    }

    await create(connection)(PAGE.id, offer)

    expect(pg).toHaveInserted(OFFERS, [offer.id, offer.url, offer.site,
offer.product, offer.seller, offer.price, offer.currency])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, OFFERS.toString(), offer.id])
  })
})
