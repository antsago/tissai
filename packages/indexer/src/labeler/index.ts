import {
  Compiler,
} from "../parser/index.js"
import { Helpers, PageServer } from "../PageServer/index.js"
import { getSchemas } from "./schemas.js"
import { Page, query } from "@tissai/db"
import { processPage } from "./processPage.js"

const createStream = async ({ db }: Helpers<Compiler>) => {
  const baseQuery = query.selectFrom("pages")
  const [{ total }] = await db.query(
    baseQuery.select(({ fn }) => fn.count("id").as("total")).compile(),
  )
  const pages = db.stream<Page>(baseQuery.selectAll().compile())

  return { total: total as number, pages }
}

const compilerFixture = () => {
  const compiler = Compiler(getSchemas)
  return [compiler, () => compiler.close()] as const
}

await new PageServer<Compiler>(createStream)
  .with(compilerFixture)
  .onPage(processPage)
  .start()
