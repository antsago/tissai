import { randomUUID, type UUID } from "node:crypto"
import type { Schema, Node, Interpreter } from "./nodesToSchema.js"

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

type Interpretation = { node: UUID; matched: string[] }[]

function removeProperties(words: string[], properties: Node[]) {
  return words.filter((word) =>
    properties.every((property) => property.name[0] !== word),
  )
}

function interpret(
  words: string[],
  parentId: UUID,
  interpreter: Interpreter,
): { remainingWords: string[]; path: Interpretation } {
  const unmatchedWords = removeProperties(
    words,
    interpreter.propertiesOf(parentId),
  )

  for (let child of interpreter.childrenOf(parentId)) {
    const matched = commonStartBetween(unmatchedWords, child.name)
    if (!matched.length) {
      continue
    }

    const { remainingWords, path } = interpret(
      unmatchedWords.slice(matched.length),
      child.id,
      interpreter,
    )

    return {
      remainingWords,
      path: [
        {
          node: child.id,
          matched,
        },
        ...path,
      ],
    }
  }

  return { remainingWords: unmatchedWords, path: [] }
}

function addNewNode(words: string[], path: Interpretation, interpreter: Interpreter) {
  if (!words.length) {
    return path
  }
  
  return [
    ...path,
    {
      node: interpreter.addNode(words, path.at(-1)?.node),
      matched: words
    },
  ]
}

function splitNodes(path: Interpretation, interpreter: Interpreter) {
  path.forEach(({ node, matched }) => {
    if (matched.length === interpreter.nameOf(node).length) {
      return
    }

    interpreter.splitNode(node, matched.length)
  })

  return path
}

// function extractProperties(path: Interpretation, parentId: string, interpreter: Interpreter) {
//   if (!path.length) {
//     return
//   }

//   const { node: nodeId } = path[0]

//   extractProperties(path.slice(1), nodeId, interpreter)

//   const node = schema[nodeId]
//   const parent = schema[parentId] 

//   const childMatches = node.children.reduce(
//     (cM, childId) => ({
//       ...cM,
//       [childId]: parent.children.some((siblingId) => {
//         if (siblingId === nodeId) {
//           return false
//         }

//         const sibling = schema[siblingId]
//         const nieceMatches = sibling.children.reduce((nM, nieceId) => ({
//           ...nM,
//           [nieceId]: !!commonStartBetween(schema[childId].name, schema[nieceId].name).length
//         }), {} as Record<string, boolean>)

//         schema[siblingId] = {
//           ...sibling,
//           children: sibling.children.filter(nieceId => !nieceMatches[nieceId])
//         }

//         return Object.values(nieceMatches).some(match => match)
//       })
//     }),
//     {} as Record<string, boolean>,
//   )

//   schema[nodeId] = {
//     ...node,
//     children: node.children.filter(childId => !childMatches[childId]),
//   }

//   schema[parentId] = {
//     ...parent,
//     properties: [
//       ...parent.properties,
//       ...node.children.filter(childId => childMatches[childId]),
//     ]
//   }

//   return
// }

export function addToSchema(title: string, interpreter: Interpreter) {
  const words = title.split(" ")
  let { remainingWords, path } = interpret(words, interpreter.rootId, interpreter)
  path = splitNodes(path, interpreter)
  path = addNewNode(remainingWords, path, interpreter)
  // extractProperties(path, interpreter.rootId, interpreter)
  return interpreter
}
