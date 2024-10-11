import { Db, Page } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { streamFor } from "./streamFor.js"
import {
  type Fixture,
  FixtureManager,
  OptionalPromise,
} from "./FixtureManager.js"
import { dbFixture } from "./dbFixture.js"

export type Helpers<Fixtures> = {
  db: Db
  reporter: Reporter
} & Fixtures
export type OnPage<Fixtures> = (
  page: Page,
  helpers: Helpers<Fixtures>,
) => Promise<any>
type CreateStream<Fixtures> = (helper: Helpers<Fixtures>) => OptionalPromise<{
  total: number
  pages: AsyncGenerator<Page, void, unknown>
}>

export class PageServer<Compiler> {
  private processPage?: OnPage<{ compiler: Compiler }>
  private fixtures?: FixtureManager<Compiler>

  constructor(private createStream: CreateStream<{ compiler: Compiler }>) {}

  with = (fixture: Fixture<Compiler>) => {
    this.fixtures = FixtureManager(fixture, dbFixture)
    return this
  }
  onPage = (fn: OnPage<{ compiler: Compiler }>) => {
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

      const helpers = { ...(await this.fixtures.init(reporter)), reporter }
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

      reporter.succeed(
        `Successfully processed ${processedPages}/${total} pages`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.fail(`Fatal error: ${message}`)
    } finally {
      await this.fixtures.close()
    }
  }
}
