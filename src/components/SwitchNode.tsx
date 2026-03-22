import type { TreeNode } from '../tree-view'

interface SwitchPresenterProps {
  node?: TreeNode
}

export function SwitchPresenter({ node }: SwitchPresenterProps) {
  if (!node || node.type !== 'switch') return null

  const { ratedVoltage } = node.data as { ratedVoltage?: number }

  return (
    <>
      <span className={`tree-node ${node.type}`}>{node.name}</span>
      <span className="tree-meta">({node.type})</span>
      {ratedVoltage != null && (
        <span className="tree-meta">• Rated: {ratedVoltage}kV</span>
      )}
    </>
  )
}
