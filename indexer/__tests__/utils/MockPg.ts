import { vi } from "vitest"
import { setPg } from "../../src/Db/index.js"

export function MockPg() {
  const Pool = vi.fn()
  const end = vi.fn()
  const query = vi.fn().mockResolvedValue({ rows: [] })
  Pool.mockReturnValue({
    query,
    end,
  })
  setPg(Pool as any)

  return { Pool, query, end }
}
export type MockPg = ReturnType<typeof MockPg>
