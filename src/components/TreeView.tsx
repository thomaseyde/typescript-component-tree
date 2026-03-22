import React, { Children, cloneElement, isValidElement, type ReactElement } from 'react'
import type { TreeNode } from '../tree-view'
import type { ExpandedState } from '../tree-view'

interface TreeViewProps {
  nodes: TreeNode[]
  expanded: ExpandedState
  visibleNodeIds: Set<string>
  visibleNodeWithAncestors: Set<string>
  onToggle: (nodeId: string) => void
  hasQuery: boolean
  children: React.ReactNode
}

export function TreeView({
  nodes,
  expanded,
  visibleNodeIds,
  visibleNodeWithAncestors,
  onToggle,
  hasQuery,
  children,
}: TreeViewProps) {
  const renderNode = (node: TreeNode) => {
    // Render all valid children, each decides if it handles this node type
    return Children.map(children, (child) => {
      if (isValidElement(child)) {
        return cloneElement(child as ReactElement<{ node: TreeNode }>, { node })
      }
      return null
    })
  }

  const renderTree = (treeNodes: TreeNode[], depth = 0) => {
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
