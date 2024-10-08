import type { MatchedNodes } from "@tissai/db"

type Node = {
  id: string
  tally: number
}
type Property = {
  label: Node
  value?: Node
}
type Interpretation = {
  category: Node
  properties: Property[]
}

function calculateProbability({ category, properties }: Interpretation) {
  const multiply = (a: number, b: number) => a * b
  return properties
    .map(({ value, label }) =>
      value !== undefined
        ? value.tally / category.tally
        : (category.tally - label.tally) / category.tally,
    )
    .reduce(multiply, category.tally)
}

function normalize(root: MatchedNodes[number]): Interpretation[] {
  const noValues = root.children?.[0].children?.length ?? 1

  return new Array(noValues).fill(null).map((_, i) => ({
    category: {
      id: root.id,
      tally: root.tally,
    },
    properties:
      root.children?.map((l) => ({
        label: {
          id: l.id,
          tally: l.tally,
        },
        value:
          l.children !== null
            ? {
                id: l.children[i].id,
                tally: l.children[i].tally,
              }
            : undefined,
      })) ?? [],
  }))
}

export function createInterpretations(nodes: MatchedNodes) {
  const interpretations = nodes.map(normalize).flat()

  return interpretations.map((interpretation) => {
    const attributes = interpretation.properties
      .map(({ value }) => value?.id)
      .filter((id) => !!id)

    return {
      probability: calculateProbability(interpretation),
      score: attributes.length + 1,
      attributes,
      category: interpretation.category.id,
    }
  })
}
