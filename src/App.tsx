import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { SubmissionDTO, ComponentDTO } from './domain'
import type { TreeNode, ExpandedState } from './tree-view'
import {
  retrieveSubmission,
  retrieveComponents,
  buildComponentTree,
} from './domain'
import {
  collapseAll,
  collapseOne,
  expandAll,
  expandOne,
  filterTree,
} from './tree-view'
import { TreeView } from './components/TreeView'
import { StationPresenter } from './components/StationNode'
import { FieldPresenter } from './components/FieldNode'
import { SwitchPresenter } from './components/SwitchNode'

function App() {
  const [submission, setSubmission] = useState<SubmissionDTO | null>(null)
  const [components, setComponents] = useState<ComponentDTO[]>([])
  const [tree, setTree] = useState<TreeNode[]>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})
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
          <TreeView
            nodes={tree}
            expanded={expanded}
            visibleNodeIds={visibleNodeIds}
            visibleNodeWithAncestors={visibleNodeWithAncestors}
            onToggle={toggleNode}
            hasQuery={query.length > 0}
          >
            <StationPresenter />
            <FieldPresenter />
            <SwitchPresenter />
          </TreeView>
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
