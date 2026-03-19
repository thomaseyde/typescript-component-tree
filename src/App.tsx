import { useEffect, useMemo, useState } from 'react'
import './App.css'

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

function App() {
  const [submission, setSubmission] = useState<SubmissionDTO | null>(null)
  const [components, setComponents] = useState<ComponentDTO[]>([])
  const [tree, setTree] = useState<ComponentTreeNode[]>([])
  const [expanded, setExpanded] = useState<TreeState>({})
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const loaded = await retrieveSubmission('submission-1')
      setSubmission(loaded)
      const fetched = await retrieveComponents('submission-1')
      setComponents(fetched)
      const built = buildComponentTree(fetched)
      setTree(built)
      setExpanded(collapseAll())
      setLoading(false)
    }

    load()
  }, [])

  useEffect(() => {
    if (!submission) {
      return
    }
    const fetchAndBuild = async () => {
      setLoading(true)
      const filteredComponents = await retrieveComponents(submission.id, query)
      setComponents(filteredComponents)
      const built = buildComponentTree(filteredComponents)
      setTree(built)
      setLoading(false)
    }
    fetchAndBuild()
  }, [query, submission])

  const { visibleNodeIds, visibleNodeWithAncestors } = useMemo(
    () => filterTree(tree, query),
    [tree, query]
  )

  const isCollapsedAll = Object.keys(expanded).length === 0

  const toggleNode = (nodeId: string) => {
    const isOpen = !!expanded[nodeId]
    setExpanded((prev) => (isOpen ? collapseOne(prev, nodeId) : expandOne(prev, nodeId)))
  }

  const renderTree = (nodes: ComponentTreeNode[], depth = 0): JSX.Element[] => {
    const rendered: JSX.Element[] = []

    for (const node of nodes) {
      const visible = query.length === 0 ? true : visibleNodeIds.has(node.id)
      if (!visible) {
        continue
      }

      const hasChildren = node.children.length > 0
      const userExpanded = !!expanded[node.id]
      const autoExpandedForFilter = query.length > 0 && visibleNodeWithAncestors.has(node.id)
      const isExpanded = hasChildren && (autoExpandedForFilter || userExpanded)

      rendered.push(
        <div key={node.id} className="tree-row" style={{ marginLeft: depth * 12 }}>
          {hasChildren && (
            <button className="tree-toggle" onClick={() => toggleNode(node.id)}>
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="tree-toggle-placeholder" />}
          <span className={`tree-node ${node.type}`}>{node.name}</span>
          <span className="tree-meta">({node.type})</span>
          {node.type === 'station' && node.buildYear != null && (
            <span className="tree-meta">• Build year: {node.buildYear}</span>
          )}
          {node.type === 'field' && node.operatingVoltage != null && (
            <span className="tree-meta">• Op voltage: {node.operatingVoltage}kV</span>
          )}
          {node.type === 'switch' && node.ratedVoltage != null && (
            <span className="tree-meta">• Rated: {node.ratedVoltage}kV</span>
          )}
        </div>
      )

      if (hasChildren && isExpanded) {
        rendered.push(...renderTree(node.children, depth + 1))
      }
    }

    return rendered
  }

  return (
    <div className="app">
      <div className="panel">
        <div className="header-row">
          <div>
            <h1>Submission Component Tree</h1>
            <p className="subtitle">Single submission + tree from backend components</p>
          </div>
          <div className="header-actions">
            <button onClick={() => setExpanded(expandAll(tree))}>Expand all</button>
            <button onClick={() => setExpanded(collapseAll())}>Collapse all</button>
          </div>
        </div>

        <div className="info-row">
          <div>
            <strong>Submission:</strong> {submission?.name ?? 'loading...'}
          </div>
          <div>
            <strong>Components:</strong> {components.length}
          </div>
        </div>

        <div className="filter-row">
          <label>
            Filter by component name:
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter..."
            />
          </label>
        </div>

        {loading ? (
          <div className="status">Loading...</div>
        ) : (
          <div className="tree-container">{renderTree(tree)}</div>
        )}

        <div className="note">
          {query.length > 0 && isCollapsedAll
            ? 'All is collapsed with a text filter; matching nodes are shown with ancestors expanded automatically.'
            : 'Toggle any node to expand/collapse individually.'}
        </div>
      </div>
    </div>
  )
}

export default App
