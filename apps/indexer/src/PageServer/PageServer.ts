import { Db, Page } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { streamFor } from "./streamFor.js"
import {
  type OptionalPromise,
  type ToFixtures,
  FixtureManager,
} from "./FixtureManager.js"

export type Helpers<Fixtures> = {
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
  private processPage?: OnPage<{ compiler: Compiler, db: Db }>
  private fixtures?: FixtureManager<{ compiler: Compiler, db: Db }>

  constructor(private createStream: CreateStream<{ compiler: Compiler, db: Db }>) {}

  with = (fixtures: ToFixtures<{ compiler: Compiler, db: Db }>) => {
    this.fixtures = FixtureManager(fixtures)
    return this
  }
  onPage = (fn: OnPage<{ compiler: Compiler, db: Db }>) => {
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
