import type { ComponentNode } from '../domain'

interface FieldNodeProps {
  node: ComponentNode
}

export function FieldNode({ node }: FieldNodeProps) {
  return (
    <>
      <span className={`tree-node ${node.type}`}>{node.name}</span>
      <span className="tree-meta">({node.type})</span>
      {node.operatingVoltage != null && (
        <span className="tree-meta">• Op voltage: {node.operatingVoltage}kV</span>
      )}
    </>
  )
}
