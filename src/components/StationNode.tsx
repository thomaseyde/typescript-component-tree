import type { TreeNode } from './tree-view'

interface StationPresenterProps {
  node?: TreeNode
}

export function StationPresenter({ node }: StationPresenterProps) {
  if (!node || node.type !== 'station') return null

  const { buildYear } = node.data as { buildYear?: number }

  return (
    <>
      <span className={`tree-node ${node.type}`}>{node.name}</span>
      <span className="tree-meta">({node.type})</span>
      {buildYear != null && (
        <span className="tree-meta">• Build year: {buildYear}</span>
      )}
    </>
  )
}
