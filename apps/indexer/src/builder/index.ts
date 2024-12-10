import _ from "lodash"
import { extractValues, matchTitle } from "./extractValues.js"
import { extractProperties } from "./extractProperties.js"
import titles from "./titles.js"

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

const cleanedTitles = titles.map((title) => normalizeString(title))
const values = extractValues(cleanedTitles)
const mostFrequentValues = _.uniqBy(
  cleanedTitles
    .map((title) => matchTitle(title, values))
    .map((match) => {
      const sentenceValues = match
        .filter((s) => s.nodeId !== undefined)
        .map((span) => values[span.nodeId!])
      const root = _.maxBy(sentenceValues, (v) => v.sentences.length)

      return root!
    }),
  'id'
)
// const properties = extractProperties(Object.values(values))

console.log(JSON.stringify(mostFrequentValues.sort((a, b) => b.sentences.length - a.sentences.length), null, 2))
