import React, { Children, cloneElement, isValidElement, type ReactElement, useState } from 'react'
import type { TreeNode, Nodes } from './tree-view'

interface TreeViewProps {
  nodes: Nodes
  children: React.ReactNode
}

export function TreeView({ nodes, children }: TreeViewProps) {
  // Track only user-driven overrides. This allows the component to
  // treat incoming `nodes.intent` as a one-time command (expanded/collapsed)
  // without calling setState inside an effect. The effective expanded
  // state for a node is computed from the intent + any user override.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  const getEffective = (id: string, localOverrides: Record<string, boolean>) => {
    if (Object.prototype.hasOwnProperty.call(localOverrides, id)) return localOverrides[id]
    if (nodes.intent === 'expanded') return true
    if (nodes.intent === 'collapsed') return false
    // preserve: default to false unless user has toggled
    return false
  }

  const renderNode = (node: TreeNode) => {
    return Children.map(children, (child) => {
      if (isValidElement(child)) {
        return cloneElement(child as ReactElement<{ node: TreeNode }>, { node })
      }
      return null
    })
  }

  const toggleNode = (nodeId: string) => {
    setOverrides((prev) => {
      const current = getEffective(nodeId, prev)
      return { ...prev, [nodeId]: !current }
    })
  }

  const renderTree = (treeNodes: TreeNode[], depth = 0) => {
    const rendered: React.ReactElement[] = []

    for (const node of treeNodes) {
      const hasChildren = node.children.length > 0
      const userExpanded = getEffective(node.id, overrides)
      const isExpanded = hasChildren && userExpanded

      rendered.push(
        <div key={node.id} className="tree-row" style={{ marginLeft: depth * 12 }}>
          {hasChildren && (
            <button className="tree-toggle" onClick={() => toggleNode(node.id)}>
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

  return <div className="tree-container">{renderTree(nodes.nodes)}</div>
}
