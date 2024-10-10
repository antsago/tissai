import type { MatchedNodes } from "@tissai/db"

export type Node = {
  name: string
  tally: number
}
export type Property = {
  label: Node
  value?: Node
}
export type Interpretation = {
  category: Node
  properties: Property[]
}

function combineProperties(
  children: NonNullable<MatchedNodes[number]["children"]>,
  properties: Property[] = [],
): Property[][] {
  if (children.length === 0) {
    return [properties]
  }

  const child = children[0]
  const label = { name: child.name, tally: child.tally }
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
      name: root.name,
      tally: root.tally,
    },
    properties,
  }))
}
