import { randomUUID } from "node:crypto"
import type { Schema } from "./addToSchema.js"

export type Node = {
  name: string[]
  children: Node[]
  properties: Node[]
}

function nodesToSchema(nodes: Node[], initial: Schema) {
  return nodes.reduce(
    ({ schema, ids }, node) => {
      const { schema: withNode, id: nodeId } = nodeToSchema(node, schema)
      return {
        schema: withNode,
        ids: [...ids, nodeId],
      }
    },
    { schema: initial, ids: [] as string[] },
  )
}

export function nodeToSchema(
  node: Node,
  initial: Schema = {},
): { schema: Schema; id: string } {
  const { schema: withChildren, ids: childIds } = nodesToSchema(
    node.children,
    initial,
  )
  const { schema: withProperties, ids: propertyIds } = nodesToSchema(
    node.properties,
    withChildren,
  )

  const id = randomUUID()
  return {
    schema: {
      ...withProperties,
      [id]: {
        id,
        name: node.name,
        children: childIds,
        properties: propertyIds,
      },
    },
    id,
  }
}

export function schemaToNode(schema: Schema, nodeId: string): Node {
  const node = schema[nodeId]

  return {
    name: node.name,
    children: node.children.map(id => schemaToNode(schema, id)),
    properties: node.properties.map(id => schemaToNode(schema, id)),
  }
}
