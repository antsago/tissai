import { Db, Page, query } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { streamFor } from "./streamFor.js"
import { type Fixture, FixtureManager, OptionalPromise } from "./FixtureManager.js"
import { dbFixture } from "./dbFixture.js"

export type Helpers<T> = { compiler: T; db: Db }
export type OnPage<T> = (page: Page, helpers: Helpers<T>) => Promise<any>
type CreateStream<T> = (helper: Helpers<T>) => OptionalPromise<{ total: number, pages: AsyncGenerator<Page, void, unknown>}>

export class PageServer<T> {
  private processPage?: OnPage<T>
  private fixtures?: ReturnType<typeof FixtureManager<T>>

  constructor(private createStream: CreateStream<T>) {}

  with = (fixture: Fixture<T>) => {
    this.fixtures = FixtureManager(fixture, dbFixture)
    return this
  }
  onPage = (fn: OnPage<T>) => {
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
