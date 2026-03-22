import type { ComponentNode } from '../domain'
import { StationNode } from './StationNode'
import { FieldNode } from './FieldNode'
import { SwitchNode } from './SwitchNode'

interface NodeContentProps {
  node: ComponentNode
}

export function NodeContent({ node }: NodeContentProps) {
  switch (node.type) {
    case 'station':
      return <StationNode node={node} />
    case 'field':
      return <FieldNode node={node} />
    case 'switch':
      return <SwitchNode node={node} />
    default:
      return (
        <>
          <span className={`tree-node ${node.type}`}>{node.name}</span>
          <span className="tree-meta">({node.type})</span>
        </>
      )
  }
}
