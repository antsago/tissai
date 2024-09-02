import { randomUUID } from "node:crypto"
import {
  Equals,
  ValueSeparator,
  PropertyEnd,
  EntityStart,
  EntityEnd,
  PropertyStart,
  Id,
} from "./symbols.js"
import { expandEntry, parseAndExpand } from "./parseAndExpand.js"
import { parse } from "node-html-parser"

export type EntityToken = string | symbol | number | boolean

type Expanded = {
  [key: string]: (string | number | boolean | Expanded)[]
}

const tokenizeJson = (json: Expanded) => {
  let tokens = [] as EntityToken[]
  const extractEntity = (entityObject: Expanded) => {
    const entityId = randomUUID()
    const tokensForEntity = [
      EntityStart,
      entityId,
      Object.entries(entityObject).map(([key, values]) => [
        PropertyStart,
        key,
        Equals,
        values
          .map((value) => [
            typeof value === "object" ? [Id, extractEntity(value)] : value,
            ValueSeparator,
          ])
          .flat()
          .slice(0, -1),
        PropertyEnd,
      ]),
      EntityEnd,
    ].flat(Infinity) as EntityToken[]

    tokens = tokens.concat(tokensForEntity)
    return entityId
  }

  extractEntity(json)

  return tokens
}

export const parsePage = (body: string) => {
  const page = parse(body)
  const ldTokens = parseAndExpand(
    page
      .querySelectorAll('script[type="application/ld+json"]')
      .map((t) => t.rawText),
  )
    .map(tokenizeJson)
    .flat()
  
  const og = Object.fromEntries(
    page
      .querySelectorAll('meta[property^="og:"]')
      .map((t) => [t.getAttribute("property"), t.getAttribute("content")])
  )
  const ogTokens = tokenizeJson(expandEntry(og))

  return [...ldTokens, ...ogTokens]
}
