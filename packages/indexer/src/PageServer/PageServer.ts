import { Db, Page, query } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { runStream } from "./runStream.js"
import { type Fixture, FixtureManager } from "./FixtureManager.js"

type OnPage<T> = (page: Page, state: { compiler: T; db: Db }) => Promise<any>

const createStream = async (db: Db) => {
  const baseQuery = query.selectFrom("pages")
  const [{ total }] = await db.query(
    baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
  )
  const pages = db.stream<Page>(baseQuery.selectAll().compile())

  return { total, pages }
}

export class PageServer<T> {
  private processPage?: OnPage<T>
  private fixtures?: ReturnType<typeof FixtureManager<T>>

  with = (fixture: Fixture<T>) => {
    this.fixtures = FixtureManager(fixture)
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
      const { total, pages } = await createStream(helpers.db)

      const processedPages = await runStream(
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
