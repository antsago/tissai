import { TaskContext, TestContext } from "vitest"
import { MockPg } from "./MockPg.js"

export type mockDbFixture = MockPg

export const mockDbFixture = async (
  {}: TaskContext & TestContext,
  use: (pg: mockDbFixture) => any,
) => {
  const { MockPg } = await import("./MockPg.js")
  const pg = MockPg()
  pg.pool.query.mockResolvedValue({ rows: [] })

  use(pg)
}
