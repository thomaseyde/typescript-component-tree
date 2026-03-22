import type { ComponentNode } from '../domain'

interface SwitchNodeProps {
  node: ComponentNode
}

export function SwitchNode({ node }: SwitchNodeProps) {
  return (
    <>
      <span className={`tree-node ${node.type}`}>{node.name}</span>
      <span className="tree-meta">({node.type})</span>
      {node.ratedVoltage != null && (
        <span className="tree-meta">• Rated: {node.ratedVoltage}kV</span>
      )}
    </>
  )
}
