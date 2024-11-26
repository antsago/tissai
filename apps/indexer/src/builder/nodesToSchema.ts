import { randomUUID, type UUID } from "node:crypto"

export type TreeNode = {
  name: string[]
  children: TreeNode[]
  properties: TreeNode[]
}
export type Node = {
  id: UUID
  name: string[]
  children: UUID[]
  properties: UUID[]
}

type NodeDb = Record<UUID, Node>

function treeNodesToDb(nodes: TreeNode[], initial: NodeDb) {
  return nodes.reduce(
    ({ nodes, ids }, node) => {
      const { nodes: withNode, id: nodeId } = treeNodeToDb(node, nodes)
      return {
        nodes: withNode,
        ids: [...ids, nodeId],
      }
    },
    { nodes: initial, ids: [] as UUID[] },
  )
}

function treeNodeToDb(
  node: TreeNode,
  initial: NodeDb = {},
): { nodes: NodeDb; id: UUID } {
  const { nodes: withChildren, ids: childIds } = treeNodesToDb(
    node.children,
    initial,
  )
  const { nodes: withProperties, ids: propertyIds } = treeNodesToDb(
    node.properties,
    withChildren,
  )

  const id = randomUUID()
  return {
    nodes: {
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

function dbToTree(nodes: NodeDb, nodeId: UUID): TreeNode {
  const node = nodes[nodeId]

  return {
    name: node.name,
    children: node.children.map(id => dbToTree(nodes, id)),
    properties: node.properties.map(id => dbToTree(nodes, id)),
  }
}

export function Schema(tree: TreeNode) {
  const { nodes: nodes, id: rootId} = treeNodeToDb(tree)

  const addNode = (name: string[], parent: UUID = rootId) => {
    const node = {
      id: randomUUID(),
      name,
      children: [],
      properties: [],
    }

    nodes[node.id] = node
    nodes[parent].children = [...nodes[parent].children, node.id]

    return node.id
  }

  const splitNode = (id: UUID, atIndex: number) => {
    const node = nodes[id]

    const newChild = {
      id: randomUUID(),
      name: node.name.slice(atIndex),
      properties: node.properties,
      children: node.children,
    }
    const updatedNode = {
      id: node.id,
      name: node.name.slice(0, atIndex),
      children: [newChild.id],
      properties: [],
    }

    nodes[newChild.id] = newChild
    nodes[node.id] = updatedNode

    return newChild.id
  }

  return {
    rootId,
    asTree: () => dbToTree(nodes, rootId),
    propertiesOf: (id: UUID) => nodes[id].properties.map(pId => nodes[pId]),
    childrenOf: (id: UUID) => nodes[id].children.map(cId => nodes[cId]),
    nameOf: (id: UUID) => nodes[id].name,
    addNode,
    splitNode,
  }
}
export type Schema = ReturnType<typeof Schema>
