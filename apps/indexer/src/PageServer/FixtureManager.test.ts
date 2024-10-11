import { describe, it, beforeEach, vi } from "vitest"
import { FixtureManager } from "./FixtureManager.js"

describe("FixtureManager", () => {
  const reporter = {} as any
  const db = {}
  const closeDb = vi.fn()
  const compiler = {}
  const closeCompiler = vi.fn()
  const dbFixture = vi.fn()
  const compilerFixture = vi.fn()

  let manager: FixtureManager<any>
  beforeEach(() => {
    vi.resetAllMocks()

    closeDb.mockResolvedValue(undefined)
    closeCompiler.mockResolvedValue(undefined)
    dbFixture.mockResolvedValue([db, closeDb])
    compilerFixture.mockResolvedValue([compiler, closeCompiler])

    manager = FixtureManager({ compiler: compilerFixture, db: dbFixture })
  })

  it("initializes passed fixtures", async ({ expect }) => {
    const result = await manager.init(reporter)

    expect(result).toStrictEqual({ db, compiler })
    expect(dbFixture).toHaveBeenCalledWith(reporter)
    expect(compilerFixture).toHaveBeenCalledWith(reporter)
  })

  it("closes initalized fixtures", async ({ expect }) => {
    await manager.init(reporter)

    await manager.close()

    expect(closeDb).toHaveBeenCalled()
    expect(closeCompiler).toHaveBeenCalled()
  })

  it("handles initialization errors", async ({ expect }) => {
    compilerFixture.mockRejectedValueOnce(new Error("Booh!"))

    try {
      await manager.init(reporter)
    } catch {}
    await manager.close()

    expect(closeDb).toHaveBeenCalled()
    expect(closeCompiler).not.toHaveBeenCalled()
  })
})
