import React from 'react'
import type { ComponentNode } from '../domain'
import type { ExpandedState } from '../tree-view'

interface TreeViewProps {
  nodes: ComponentNode[]
  expanded: ExpandedState
  visibleNodeIds: Set<string>
  visibleNodeWithAncestors: Set<string>
  onToggle: (nodeId: string) => void
  renderNode: (node: ComponentNode) => React.ReactNode
  hasQuery: boolean
}

export function TreeView({
  nodes,
  expanded,
  visibleNodeIds,
  visibleNodeWithAncestors,
  onToggle,
  renderNode,
  hasQuery,
}: TreeViewProps) {
  const renderTree = (treeNodes: ComponentNode[], depth = 0) => {
    const rendered: React.ReactElement[] = []

    for (const node of treeNodes) {
      const visible = !hasQuery ? true : visibleNodeIds.has(node.id)
      if (!visible) {
        continue
      }

      const hasChildren = node.children.length > 0
      const userExpanded = !!expanded[node.id]
      const autoExpandedForFilter = hasQuery && visibleNodeWithAncestors.has(node.id)
      const isExpanded = hasChildren && (autoExpandedForFilter || userExpanded)

      rendered.push(
        <div key={node.id} className="tree-row" style={{ marginLeft: depth * 12 }}>
          {hasChildren && (
            <button className="tree-toggle" onClick={() => onToggle(node.id)}>
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="tree-toggle-placeholder" />}
          {renderNode(node)}
        </div>
      )

      if (hasChildren && isExpanded) {
        rendered.push(...renderTree(node.children, depth + 1))
      }
    }

    return rendered
  }

  return <div className="tree-container">{renderTree(nodes)}</div>
}
