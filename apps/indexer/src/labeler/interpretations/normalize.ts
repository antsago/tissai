import type { MatchedNodes } from "@tissai/db"

export type Node = {
  id: string
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

function* combineProperties(
  children: NonNullable<MatchedNodes[number]["children"]>,
  properties: Property[] = [],
  matchedWords: string[] = [],
): Generator<Property[]> {
  if (children.length === 0) {
    return yield properties
  }

  const child = children[0]
  const label = { id: child.id, name: child.name, tally: child.tally }
  const propertyCandidates: Property[] = [
    { label },
    ...(child.children
      ?.filter((value) => !matchedWords.includes(value.name))
      .map((value) => ({ label, value })) ?? []),
  ]

  const otherChildren = children.slice(1)
  for (let candidate of propertyCandidates) {
    const combinations = combineProperties(
      otherChildren,
      [...properties, candidate],
      candidate.value?.name
        ? [...matchedWords, candidate.value.name]
        : matchedWords,
    )
    yield* combinations
  }
}

export function* normalize(root: MatchedNodes[number]) {
  for (let properties of combineProperties(root.children ?? [])) {
    yield {
      category: {
        id: root.id,
        name: root.name,
        tally: root.tally,
      },
      properties,
    }
  }
}
