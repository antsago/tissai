import { type Token, type LabelMap, type Model } from "../parser/index.js"

const updateMapping = (
  vocabulary: LabelMap,
  labeled: (Token & { label?: string })[],
) =>
  labeled
    .filter((t) => t.isMeaningful && t.label !== undefined)
    .forEach(({ label, text }) => {
      vocabulary[text] = {
        ...(vocabulary[text] ?? {}),
        [label!]: (vocabulary[text]?.[label!] ?? 0) + 1,
      }
    })
const CATEGORY_LABEL = "categoría"
const updateSchemas = (
  schemas: LabelMap,
  labeled: (Token & { label?: string })[],
) => {
  const categories = labeled
    .filter((word) => word.label === CATEGORY_LABEL)
    .map((word) => word.text)
  const otherLabels = labeled
    .map((att) => att.label)
    .filter((label) => !!label && label !== CATEGORY_LABEL)

  categories.forEach((cat) =>
    otherLabels.forEach((label) => {
      schemas[cat] = {
        ...(schemas[cat] ?? {}),
        // Add an extra count so unknown categories can have a phantom count
        [label!]: (schemas[cat]?.[label!] ?? 1) + 1,
      }
    }),
  )
}

export const updateModel = (entities: any[], { vocabulary, schemas }: Model) => {
  const products = entities
    .filter(
      (entity) => typeof entity !== "symbol" && "parsedTitle" in entity,
    )
    .map((product) => product.parsedTitle)

  updateMapping(vocabulary, products.flat())
  products.forEach((product) => updateSchemas(schemas, product))
}
