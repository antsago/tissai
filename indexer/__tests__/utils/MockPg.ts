import { vi } from "vitest"
import { setPg } from "../../src/Db/index.js"

function mockedClient() {
  const release = vi.fn()
  const query = vi.fn()

  return { release, query }
}
function mockedPool(client: ReturnType<typeof mockedClient>) {
  const Pool = vi.fn()
  const connect = vi.fn().mockReturnValue(client)
  const query = vi.fn().mockResolvedValue({ rows: [] })
  const end = vi.fn()

  Pool.mockReturnValue({
    connect,
    query,
    end,
  })

  return { Pool, connect, query, end }
}

export function MockPg() {
  const Cursor = vi.fn()
  const client = mockedClient()
  const poolMock = mockedPool(client)

  setPg(poolMock.Pool as any, Cursor as any)

  return { ...poolMock, Cursor, client }
}
export type MockPg = ReturnType<typeof MockPg>
