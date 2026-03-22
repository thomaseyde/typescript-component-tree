import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type {
  SubmissionDTO,
  ComponentDTO,
  ComponentTreeNode,
  TreeState,
} from './domain'
import {
  retrieveSubmission,
  retrieveComponents,
  buildComponentTree,
  collapseAll,
  collapseOne,
  expandAll,
  expandOne,
  filterTree,
} from './domain'

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

  const renderTree = (nodes: ComponentTreeNode[], depth = 0) => {
    const rendered: React.ReactElement[] = []

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
