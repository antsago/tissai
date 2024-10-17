import { Page } from "@tissai/db"
import { Reporter } from "./Reporter.js"
import { streamFor } from "./streamFor.js"
import {
  type OptionalPromise,
  type ToFixtures,
  FixtureManager,
} from "./FixtureManager.js"

type Helpers<F> = F & { reporter: Reporter }
type TotalFn<F> = (helpers: Helpers<F>) => OptionalPromise<number>
type ProcessingFn<F> = (page: Page, helpers: Helpers<F>) => Promise<any>
type StreamFn<F> = (
  helpers: Helpers<F>,
) => OptionalPromise<AsyncGenerator<Page, void, unknown>>

export class Crawler<F extends Record<string, unknown>> {
  private fixtures?: FixtureManager<F>
  private totalFn?: TotalFn<F>
  private streamFn?: StreamFn<F>
  private processingFn?: ProcessingFn<F>

  constructor(fixtures: ToFixtures<F>) {
    this.fixtures = FixtureManager(fixtures)
  }

  over = (fn: StreamFn<F>) => {
    this.streamFn = fn
    return this
  }
  expect = (fn: TotalFn<F>) => {
    this.totalFn = fn
    return this
  }
  forEach = (fn: ProcessingFn<F>) => {
    this.processingFn = fn
    return this
  }

  crawl = async () => {
    if (!this.streamFn || !this.processingFn || !this.fixtures) {
      throw new Error("No query or processing function specified given") // Fixtures should never be unassigned
    }

    const reporter = Reporter()
    try {
      reporter.progress("Initializing...")

      const helpers = { ...(await this.fixtures.init(reporter)), reporter }
      const total = await this.totalFn?.(helpers)
      const items = await this.streamFn(helpers)

      const itemsWithoutErrors = await streamFor(
        items,
        async (page, index) => {
          reporter.progress(
            total
              ? `Processing item ${index}/${total}: ${page.id} (${page.url})`
              : `Processing item ${index}: ${page.id} (${page.url})`,
          )
          await this.processingFn?.(page, helpers)
        },
        (err, page) => {
          const message = err instanceof Error ? err.message : String(err)
          reporter.error(`[${page.id} (${page.url})]: ${message}`)
        },
      )

      reporter.succeed(
        total
          ? `Successfully processed ${itemsWithoutErrors}/${total} items`
          : `Successfully processed ${itemsWithoutErrors} items`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      reporter.fail(`Fatal error: ${message}`)
    } finally {
      await this.fixtures.close()
    }
  }
}
