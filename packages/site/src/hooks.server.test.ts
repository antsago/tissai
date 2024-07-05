import type { Handle } from "./$types"
import { describe, it, expect, vi, beforeEach } from "vitest"

describe("Server hooks", () => {
  const resolve = vi.fn()
  const event: any = { locals: {} }

  let handle: Handle
  beforeEach(async () => {
    vi.resetModules()

    const hooks = await import("./hooks.server")
    handle = hooks.handle
  })

  it("initializes db", async () => {
    const expected = "The result"
    resolve.mockResolvedValue(expected)

    const result = await handle({ event, resolve })

    expect(result).toStrictEqual(expected)
    expect(resolve).toHaveBeenCalledWith(event)
    expect(event.locals.db).not.toBe(undefined)
  })

  it("reuses initialized db", async () => {
    const event2: any = { locals: {} }
    await handle({ event, resolve })
    await handle({ event: event2, resolve })

    expect(event.locals.db).toBe(event2.locals.db)
  })
})
