import { expect, describe, it, beforeEach } from "vitest"
import { MockPg, PAGE, DERIVED_DATA } from "#mocks"
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
    const tag = {
      name: DERIVED_DATA.tags[0],
    }
    await create(connection)(PAGE.id, tag)

    expect(pg).toHaveInserted(TAGS, [tag.name])
    expect(pg).toHaveInserted(TRACES, [PAGE.id, TAGS.toString(), tag.name])
  })
})
