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

function combineProperties(
  children: NonNullable<MatchedNodes[number]["children"]>,
  properties: Property[] = [],
): Property[][] {
  if (children.length === 0) {
    return [properties]
  }

  const child = children[0]
  const label = { id: child.id, tally: child.tally }
  const propertyCandidates: Property[] = !child.children
    ? [{ label }]
    : child.children.map((value) => ({ label, value }))

  const otherChildren = children.slice(1)
  return propertyCandidates
    .map((candidate) =>
      combineProperties(otherChildren, [...properties, candidate]),
    )
    .flat()
}

export function normalize(root: MatchedNodes[number]): Interpretation[] {
  const combinations = combineProperties(root.children ?? [])

  return combinations.map((properties) => ({
    category: {
      id: root.id,
      tally: root.tally,
    },
    properties,
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
