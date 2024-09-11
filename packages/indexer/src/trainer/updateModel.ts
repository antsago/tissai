import { type Token, type LabelMap, type Model } from "../parser/index.js"

export type Property = Token & { labels?: string[] }

const updateMapping = (
  vocabulary: LabelMap,
  labeled: Property[],
) =>
  labeled
    .filter((t) => t.isMeaningful && t.labels !== undefined)
    .map(({text, labels}) => ({ text, label: labels![0]}))
    .forEach(({ label, text }) => {
      vocabulary[text] = {
        ...(vocabulary[text] ?? {}),
        [label]: (vocabulary[text]?.[label] ?? 0) + 1,
      }
    })
const CATEGORY_LABEL = "categoría"
const updateSchemas = (
  schemas: LabelMap,
  product: Property[],
) => {
  const labeled = product
    .map(({ labels, text}) => ({ text, label: labels?.[0] }))

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

export const updateModel = (
  products: Property[][],
  { vocabulary, schemas }: Model,
) => {
  updateMapping(vocabulary, products.flat())
  products.forEach((product) => updateSchemas(schemas, product))
}
