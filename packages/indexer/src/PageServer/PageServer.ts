import { Db, Page, query } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { runStream } from "./runStream.js"

const dbFixture = async () => {
  const db = Db()
  await db.initialize()

  return [db, () => db.close()] as const
}

type OnPage<T> = (page: Page, state: { compiler: T; db: Db }) => Promise<any>
type Fixture<T> = (reporter: Reporter) => [T, () => {}]

export class PageServer<T> {
  private processPage?: OnPage<T>
  private compilerFixture?: Fixture<T>

  extend = (fix: Fixture<T>) => {
    this.compilerFixture = fix
    return this
  }
  onPage = (fn: OnPage<T>) => {
    this.processPage = fn
    return this
  }

  start = async () => {
    let closeDb: Awaited<ReturnType<typeof dbFixture>>[1]
    let closeCompiler: Awaited<ReturnType<Fixture<T>>>[1]
    const reporter = Reporter()

    const closeFixtures = () =>
      Promise.all([closeDb && closeDb(), closeCompiler && closeCompiler()])
    const initFixtures = async () => {
      if (!this.compilerFixture) {
        throw new Error("No compiler fixture given")
      }
      let db, compiler
      ;[db, closeDb] = await dbFixture()
      ;[compiler, closeCompiler] = this.compilerFixture(reporter)

      return { db, compiler }
    }

    try {
      reporter.progress("Initializing...")

      const helpers = await initFixtures()
      const { db } = helpers

      const baseQuery = query.selectFrom("pages")
      const [{ total }] = await db.query(
        baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
      )
      const pages = db.stream<Page>(baseQuery.selectAll().compile())

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
      await closeFixtures()
    }
  }
}
