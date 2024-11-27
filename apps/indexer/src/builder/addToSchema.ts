import { type UUID } from "node:crypto"
import type { Node, Schema } from "./nodesToSchema.js"

function commonStartBetween(a: string[], b: string[]) {
  let common = [] as string[]
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === undefined || a[i] !== b[i]) {
      return common
    }

    common = [...common, a[i]]
  }

  return common
}

type Span = {
  nodeId?: UUID
  words: string[]
}
type Match = {
  spans: Required<Span>[]
  remainingWords: string[]
}

function matchNode(words: string[], node: Node, schema: Schema): Match {
  const matched = commonStartBetween(words, node.name)
  if (!matched.length) {
    return {
      spans: [],
      remainingWords: words,
    }
  }

  const childMatch = matchNodes(
    words.slice(matched.length),
    schema.childrenOf(node.id),
    schema,
  )

  return {
    spans: [
      {
        nodeId: node.id,
        words: matched,
      },
      ...childMatch.spans,
    ],
    remainingWords: childMatch.remainingWords,
  }
}

function matchNodes(words: string[], nodes: Node[], schema: Schema): Match {
  if (!words.length) {
    return {
      spans: [],
      remainingWords: words,
    }
  }

  for (let node of nodes) {
    const match = matchNode(words, node, schema)
    if (match.spans.length) {
      return match
    }
  }

  return {
    spans: [],
    remainingWords: words,
  }
}

function matchProperties(
  words: string[],
  properties: Node[],
  schema: Schema,
): Span[] {
  let remainingWords = words
  let unmatchedProperties = properties
  let spans: Span[] = []

  outerLoop: while (remainingWords.length && unmatchedProperties.length) {
    for (let [propertyIndex, property] of unmatchedProperties.entries()) {
      const match = matchNode(remainingWords, property, schema)

      if (match.spans.length) {
        unmatchedProperties = unmatchedProperties.toSpliced(propertyIndex)
        spans = spans.concat(match.spans)
        remainingWords = match.remainingWords

        continue outerLoop
      }
    }

    spans = [...spans, { words: remainingWords.slice(0, 1) }]
    remainingWords = remainingWords.slice(1)
  }

  if (remainingWords.length) {
    spans = [...spans, { words: remainingWords }]
  }

  return spans.reduce((merged, span) => {
    const lastSpan = merged.at(-1)
    if (!span.nodeId && lastSpan && !lastSpan.nodeId) {
      return [
        ...merged.slice(0, -1),
        {
          words: [...lastSpan.words, ...span.words]
        }
      ]
    }

    return [...merged, span]
  }, [] as Span[])
}

function interpret(words: string[], schema: Schema): Span[] {
  const categoryMatch = matchNodes(words, schema.categories(), schema)

  const properties = [
    ...schema.commonProperties(),
    ...categoryMatch.spans
      .map((s) => s.nodeId)
      .flatMap((id) => schema.propertiesOf(id)),
  ]
  const propertySpans = matchProperties(
    categoryMatch.remainingWords,
    properties,
    schema,
  )

  return [...categoryMatch.spans, ...propertySpans]
}

function addNewNode(spans: Span[], schema: Schema) {
  return spans
    .map(({ nodeId, words }, index) => {
      if (nodeId) {
        return
      }

      return schema.addNode(words, spans.at(index - 1)?.nodeId)
    })
    .filter((id) => !!id)
}

function splitNodes(spans: Span[], schema: Schema) {
  return spans.flatMap(({ nodeId, words }) => {
    if (!nodeId || words.length === schema.nameOf(nodeId).length) {
      return []
    }

    return [schema.splitNode(nodeId, words.length), nodeId]
  })
}

function extractProperties(changedIds: UUID[], schema: Schema) {
  changedIds.forEach((nodeId) => {
    const parent = schema.parentOf(nodeId)
    if (!parent) {
      return
    }
    const grandparent = schema.parentOf(parent.id)
    if (!grandparent) {
      return
    }

    const nodeName = schema.nameOf(nodeId)
    const matchingCousins = grandparent.children
      .flatMap((auntId) =>
        auntId === parent.id ? [] : schema.childrenOf(auntId),
      )
      .filter(
        (cousin) => commonStartBetween(cousin.name, nodeName).length !== 0,
      )

    if (!matchingCousins.length) {
      return
    }

    matchingCousins.forEach((cousin) => {
      const currentName = schema.nameOf(nodeId)
      const match = commonStartBetween(cousin.name, currentName)
      const remainingCousin =
        match.length < cousin.name.length && cousin.name.slice(match.length)
      const remainingName = match.length < currentName.length

      if (remainingName) {
        const newNodeId = schema.splitNode(nodeId, match.length)
      }

      if (remainingCousin) {
        const newNodeId = schema.addNode(remainingCousin, nodeId)
      }

      schema.removeNode(cousin.id)
    })
    const node = schema.removeNode(nodeId)

    schema.addProperty(node, grandparent.id)
  })
}

export function addToSchema(title: string, schema: Schema) {
  const words = title.split(" ")
  const spans = interpret(words, schema)
  const splitIds = splitNodes(spans, schema)
  const addedIds = addNewNode(spans, schema)
  const changedIds = [...addedIds, ...splitIds]
  extractProperties(changedIds, schema)
  return schema
}
