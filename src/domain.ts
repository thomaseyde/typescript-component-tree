// DTOs
export type SubmissionDTO = {
  id: string
  name: string
}

export type ComponentDTO = {
  id: string
  submissionId: string
  stationName: string
  stationBuildYear: number
  fieldName: string
  fieldOperatingVoltage: number
  switchName: string
  switchRatedVoltage: number
  name: string
}

// Domain types (type aliases only)
export type TreeNodeType = 'station' | 'field' | 'switch'

export type ComponentTreeNode = {
  id: string
  type: TreeNodeType
  name: string
  children: ComponentTreeNode[]
  parentId?: string
  buildYear?: number
  stationName?: string
  operatingVoltage?: number
  ratedVoltage?: number
}

export type TreeState = Record<string, boolean>

// Simulated backend data
const submissionFixture: SubmissionDTO = { id: 'submission-1', name: 'Customer Submission 1' }

const componentsFixture: ComponentDTO[] = [
  { id: 'c1', submissionId: 'submission-1', stationName: 'Station A', stationBuildYear: 2018, fieldName: 'Field X', fieldOperatingVoltage: 110, switchName: 'Switch 1', switchRatedVoltage: 12, name: 'Switch 1' },
  { id: 'c2', submissionId: 'submission-1', stationName: 'Station A', stationBuildYear: 2018, fieldName: 'Field X', fieldOperatingVoltage: 110, switchName: 'Switch 2', switchRatedVoltage: 24, name: 'Switch 2' },
  { id: 'c3', submissionId: 'submission-1', stationName: 'Station A', stationBuildYear: 2018, fieldName: 'Field Y', fieldOperatingVoltage: 115, switchName: 'Switch 3', switchRatedVoltage: 36, name: 'Switch 3' },
  { id: 'c4', submissionId: 'submission-1', stationName: 'Station B', stationBuildYear: 2021, fieldName: 'Field Z', fieldOperatingVoltage: 120, switchName: 'Switch 4', switchRatedVoltage: 12, name: 'Switch 4' },
  { id: 'c5', submissionId: 'submission-1', stationName: 'Station B', stationBuildYear: 2021, fieldName: 'Field Z', fieldOperatingVoltage: 120, switchName: 'Switch 5', switchRatedVoltage: 24, name: 'Switch 5' },
  { id: 'c6', submissionId: 'submission-1', stationName: 'Station B', stationBuildYear: 2021, fieldName: 'Field Z', fieldOperatingVoltage: 120, switchName: 'Switch 6', switchRatedVoltage: 36, name: 'Switch 6' },
]

// API simulation functions
export const retrieveSubmission = async (submissionId: string): Promise<SubmissionDTO | null> => {
  await new Promise((resolve) => setTimeout(resolve, 120))
  return submissionFixture.id === submissionId ? submissionFixture : null
}

export const retrieveComponents = async (
  submissionId: string,
  filterName?: string
): Promise<ComponentDTO[]> => {
  await new Promise((resolve) => setTimeout(resolve, 120))

  const components = componentsFixture.filter((c) => c.submissionId === submissionId)

  if (!filterName || filterName.trim().length === 0) {
    return components
  }

  const normalized = filterName.trim().toLowerCase()
  return components.filter((c) => {
    return (
      c.name.toLowerCase().includes(normalized) ||
      c.switchName.toLowerCase().includes(normalized) ||
      c.fieldName.toLowerCase().includes(normalized) ||
      c.stationName.toLowerCase().includes(normalized)
    )
  })
}

export const buildComponentTree = (components: ComponentDTO[]): ComponentTreeNode[] => {
  const byStation = new Map<string, ComponentDTO[]>()

  for (const component of components) {
    const stationComponents = byStation.get(component.stationName) ?? []
    stationComponents.push(component)
    byStation.set(component.stationName, stationComponents)
  }

  return Array.from(byStation.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([stationName, stationComponents]) => {
      const byField = new Map<string, ComponentDTO[]>()
      for (const component of stationComponents) {
        const fieldComponents = byField.get(component.fieldName) ?? []
        fieldComponents.push(component)
        byField.set(component.fieldName, fieldComponents)
      }

      const fieldNodes: ComponentTreeNode[] = Array.from(byField.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fieldName, fieldComponents]) => {
          const first = fieldComponents[0]
          return {
            id: `field:${stationName}:${fieldName}`,
            type: 'field',
            name: fieldName,
            parentId: `station:${stationName}`,
            stationName,
            operatingVoltage: first.fieldOperatingVoltage,
            children: fieldComponents
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((component) => ({
                id: `switch:${component.id}`,
                type: 'switch',
                name: component.name,
                parentId: `field:${stationName}:${fieldName}`,
                ratedVoltage: component.switchRatedVoltage,
                children: [],
              })),
          }
        })

      return {
        id: `station:${stationName}`,
        type: 'station',
        name: stationName,
        buildYear: stationComponents[0]?.stationBuildYear,
        children: fieldNodes,
      }
    })
}

export const getAllNodeIds = (nodes: ComponentTreeNode[]): string[] => {
  const ids: string[] = []
  const walk = (node: ComponentTreeNode) => {
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

export const expandAll = (nodes: ComponentTreeNode[]): TreeState => {
  const ids = getAllNodeIds(nodes)
  const expanded: TreeState = {}
  for (const id of ids) {
    expanded[id] = true
  }
  return expanded
}

export const collapseAll = (): TreeState => ({})

export const expandOne = (state: TreeState, nodeId: string): TreeState => ({ ...state, [nodeId]: true })

export const collapseOne = (state: TreeState, nodeId: string): TreeState => {
  const next: TreeState = { ...state }
  delete next[nodeId]
  return next
}

export const filterTree = (
  nodes: ComponentTreeNode[],
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

  const walk = (node: ComponentTreeNode, ancestors: ComponentTreeNode[]) => {
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
