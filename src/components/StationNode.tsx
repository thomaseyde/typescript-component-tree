import type { ComponentNode } from '../domain'

interface StationNodeProps {
  node: ComponentNode
}

export function StationNode({ node }: StationNodeProps) {
  return (
    <>
      <span className={`tree-node ${node.type}`}>{node.name}</span>
      <span className="tree-meta">({node.type})</span>
      {node.buildYear != null && (
        <span className="tree-meta">• Build year: {node.buildYear}</span>
      )}
    </>
  )
}
