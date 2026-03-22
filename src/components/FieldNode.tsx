import type { TreeNode } from './tree-view'

interface FieldPresenterProps {
  node?: TreeNode
}

export function FieldPresenter({ node }: FieldPresenterProps) {
  if (!node || node.type !== 'field') return null

  const { operatingVoltage } = node.data as { operatingVoltage?: number }

  return (
    <>
      <span className={`tree-node ${node.type}`}>{node.name}</span>
      <span className="tree-meta">({node.type})</span>
      {operatingVoltage != null && (
        <span className="tree-meta">• Op voltage: {operatingVoltage}kV</span>
      )}
    </>
  )
}
