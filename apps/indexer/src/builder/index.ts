import _ from "lodash"
import { extractValues } from "./extractValues.js"
import { extractProperties } from "./extractProperties.js"
import titles from "./titles.js"

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

const values = extractValues(titles.map((title) => normalizeString(title)))
const properties = extractProperties(Object.values(values))

console.log(
  JSON.stringify(
    properties.map((p) =>
      p.map((v) => ({ name: v.name, tally: v.sentences.length })),
    ),
    null,
    2,
  ),
)
