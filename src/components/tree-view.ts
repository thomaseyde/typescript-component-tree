// Tree structure - completely decoupled from domain
export type TreeNode = {
  id: string
  type: string
  name: string
  children: TreeNode[]
  parentId?: string
  data: Record<string, unknown>
}

// Tree view state - tracks which nodes are expanded/collapsed
export type ExpandedState = Record<string, boolean>

export const getAllNodeIds = (nodes: TreeNode[]): string[] => {
  const ids: string[] = []
  const walk = (node: TreeNode) => {
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

export const expandAll = (nodes: TreeNode[]): ExpandedState => {
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
  nodes: TreeNode[],
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

  const walk = (node: TreeNode, ancestors: TreeNode[]) => {
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

// Intent-based node payloads for communicating commands + data
export type ExpandedNodes = { intent: 'expanded'; nodes: TreeNode[] }
export type CollapsedNodes = { intent: 'collapsed'; nodes: TreeNode[] }
export type PreserveNodes = { intent: 'preserve'; nodes: TreeNode[] }

export type Nodes = ExpandedNodes | CollapsedNodes | PreserveNodes
