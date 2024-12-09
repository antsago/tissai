import _ from "lodash"
import { extractValues } from "./extractValues.js"
import titles from "./titles.js"

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

const values = extractValues(titles.map((title) => normalizeString(title)))

console.log(JSON.stringify(values, null, 2))
