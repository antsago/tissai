import { Db, Page } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { streamFor } from "./streamFor.js"
import { type Fixture, FixtureManager, OptionalPromise } from "./FixtureManager.js"
import { dbFixture } from "./dbFixture.js"
import { Compiler } from "../parser/Compiler.js"

export type Helpers = { compiler: Compiler; db: Db }
export type OnPage = (page: Page, helpers: Helpers) => Promise<any>
type CreateStream = (helper: Helpers) => OptionalPromise<{ total: number, pages: AsyncGenerator<Page, void, unknown>}>

export class PageServer {
  private processPage?: OnPage
  private fixtures?: ReturnType<typeof FixtureManager<Compiler>>

  constructor(private createStream: CreateStream) {}

  with = (fixture: Fixture<Compiler>) => {
    this.fixtures = FixtureManager(fixture, dbFixture)
    return this
  }
  onPage = (fn: OnPage) => {
    this.processPage = fn
    return this
  }

  start = async () => {
    if (!this.fixtures) {
      throw new Error("No compiler fixture given")
    }

    const reporter = Reporter()
    try {
      reporter.progress("Initializing...")

      const helpers = await this.fixtures.init(reporter)
      const { total, pages } = await this.createStream(helpers)

      const processedPages = await streamFor(
        pages,
        async (page, index) => {
          reporter.progress(
            `Processing page ${index}/${total}: ${page.id} (${page.url})`,
          )

          if (this.processPage) {
            await this.processPage(page, helpers)
          }
        },
        (err, page) => {
          const message = err instanceof Error ? err.message : String(err)
          reporter.error(`[${page.id} (${page.url})]: ${message}`)
        },
      )

      reporter.succeed(`Processed ${processedPages} pages`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.fail(`Fatal error: ${message}`)
    } finally {
      await this.fixtures.close()
    }
  }
}
