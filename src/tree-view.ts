import type { ComponentNode } from './domain'

// Tree view state - tracks which nodes are expanded/collapsed
export type ExpandedState = Record<string, boolean>

export const getAllNodeIds = (nodes: ComponentNode[]): string[] => {
  const ids: string[] = []
  const walk = (node: ComponentNode) => {
    ids.push(node.id)
    for (const child of node.children) {
      walk(child)
    }
  }
  for (const node of nodes) {
    walk(node)
  }
  return ids
}

export const expandAll = (nodes: ComponentNode[]): ExpandedState => {
  const ids = getAllNodeIds(nodes)
  const expanded: ExpandedState = {}
  for (const id of ids) {
    expanded[id] = true
  }
  return expanded
}

export const collapseAll = (): ExpandedState => ({})

export const expandOne = (state: ExpandedState, nodeId: string): ExpandedState => ({ ...state, [nodeId]: true })

export const collapseOne = (state: ExpandedState, nodeId: string): ExpandedState => {
  const next: ExpandedState = { ...state }
  delete next[nodeId]
  return next
}

export const filterTree = (
  nodes: ComponentNode[],
  query: string
): { visibleNodeIds: Set<string>; visibleNodeWithAncestors: Set<string> } => {
  const normalizedQuery = query.trim().toLowerCase()
  const visibleNodeIds = new Set<string>()
  const visibleNodeWithAncestors = new Set<string>()

  if (normalizedQuery.length === 0) {
    const allIds = getAllNodeIds(nodes)
    allIds.forEach((id) => visibleNodeIds.add(id))
    allIds.forEach((id) => visibleNodeWithAncestors.add(id))
    return { visibleNodeIds, visibleNodeWithAncestors }
  }

  const walk = (node: ComponentNode, ancestors: ComponentNode[]) => {
    const matches = node.name.toLowerCase().includes(normalizedQuery)
    let hasMatchInSubtree = matches

    for (const child of node.children) {
      const childHasMatch = walk(child, [...ancestors, node])
      hasMatchInSubtree = hasMatchInSubtree || childHasMatch
    }

    if (hasMatchInSubtree) {
      visibleNodeIds.add(node.id)
      for (const ancestor of ancestors) {
        visibleNodeWithAncestors.add(ancestor.id)
      }
      visibleNodeWithAncestors.add(node.id)
    }

    return hasMatchInSubtree
  }

  for (const node of nodes) {
    walk(node, [])
  }

  return { visibleNodeIds, visibleNodeWithAncestors }
}
