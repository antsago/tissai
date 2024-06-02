import { expect, describe, it, beforeEach } from "vitest"
import { MockPg, PAGE, TAG } from "#mocks"
import { Connection } from "../Connection"
import { TABLE as TRACES } from "./traces"
import { TABLE as TAGS, create } from "./tags"

describe("tags", () => {
  let pg: MockPg
  let connection: Connection
  beforeEach(() => {
    pg = MockPg()
    connection = Connection()
  })

  it("inserts new row", async () => {
    await create(connection)(PAGE.id, TAG)

    expect(pg).toHaveInserted(TAGS, [TAG.name])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, TAGS.toString(), TAG.name])
  })
})
