export type Schema = {
  category: string
  categoryWord: string
  attributes: string[]
}

export type Schemas = Record<
  string,
  {
    attributes: Record<string, number>
    labels: Record<string, number>
  }
>

export function addSchema(
  { category, attributes, categoryWord }: Schema,
  schemas: Schemas,
) {
  const oldSchema = schemas[category] ?? { labels: {}, attributes: {} }

  return {
    ...schemas,
    [category]: {
      labels: {
        ...oldSchema.labels,
        [categoryWord]: (oldSchema.labels[categoryWord] ?? 0) + 1,
      },
      attributes: {
        ...oldSchema.attributes,
        ...Object.fromEntries(
          attributes.map((a) => [a, (oldSchema.attributes[a] ?? 0) + 1]),
        ),
      },
    },
  }
}
