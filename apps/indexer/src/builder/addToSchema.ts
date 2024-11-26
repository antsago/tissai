import { type UUID } from "node:crypto"
import type { Schema } from "./nodesToSchema.js"

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

function matchNode(
  words: string[],
  parentId: UUID,
  schema: Schema,
): [Required<Span>[], string[]] {
  if (!words.length) {
    return [[], []]
  }

  for (let child of schema.childrenOf(parentId)) {
    const matched = commonStartBetween(words, child.name)
    if (!matched.length) {
      continue
    }

    const [spans, unmatchedWords] = matchNode(
      words.slice(matched.length),
      child.id,
      schema,
    )

    return [
      [
        {
          nodeId: child.id,
          words: matched,
        },
        ...spans,
      ],
      unmatchedWords,
    ]
  }

  return [[], words]
}

function interpret(words: string[], schema: Schema): Span[] {
  const [nodeSpans, unmatchedWords] = matchNode(words, schema.rootId, schema)

  if (!unmatchedWords.length) {
    return nodeSpans
  }

  const { spans, remainingWords } = [
    schema.rootId,
    ...nodeSpans.map((s) => s.nodeId),
  ]
    .flatMap((id) => schema.propertiesOf(id))
    .reduce(
      ({ spans, remainingWords }, property) => {
        const matched = commonStartBetween(remainingWords, property.name)

        if (!matched.length) {
          return { spans, remainingWords }
        }

        return {
          spans: [...spans, { nodeId: property.id, words: matched }],
          remainingWords: remainingWords.slice(matched.length),
        }
      },
      { spans: nodeSpans, remainingWords: unmatchedWords },
    )

  if (!remainingWords.length) {
    return spans
  }

  return [...spans, { words: remainingWords }]
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
