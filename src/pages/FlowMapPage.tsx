import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import AppHeader from '../components/AppHeader'
import { getAllFlows } from './simulator/flowRegistry'
import FlowMapNode from './flow-map/FlowMapNode'
import type { FlowMapNodeData } from './flow-map/FlowMapNode'
import { layoutFlowMap } from './flow-map/layoutFlowMap'

const nodeTypes = { flowMap: FlowMapNode }

export default function FlowMapPage() {
  const navigate = useNavigate()

  const { nodes, edges } = useMemo(() => {
    const flows = getAllFlows()

    // Build nodes
    const rawNodes: Node[] = flows.map((flow) => ({
      id: flow.id,
      type: 'flowMap',
      position: { x: 0, y: 0 },
      data: {
        flowId: flow.id,
        label: flow.id,
        domain: flow.domain,
        screenCount: flow.screens.length,
        entryPoints: flow.entryPoints,
      } satisfies FlowMapNodeData,
    }))

    // Build edges from linkedFlows
    const flowIds = new Set(flows.map((f) => f.id))
    const rawEdges: Edge[] = []
    for (const flow of flows) {
      if (!flow.linkedFlows) continue
      for (const targetId of flow.linkedFlows) {
        if (flowIds.has(targetId)) {
          rawEdges.push({
            id: `${flow.id}->${targetId}`,
            source: flow.id,
            target: targetId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#4ADE80', strokeWidth: 2 },
          })
        }
      }
    }

    // Layout
    const laidOutNodes = layoutFlowMap(rawNodes, rawEdges)
    return { nodes: laidOutNodes, edges: rawEdges }
  }, [])

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    navigate(`/flows?flow=${node.id}`)
  }

  return (
    <div className="h-screen flex flex-col bg-shell-bg">
      <AppHeader />
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          nodesDraggable={false}
          nodesConnectable={false}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--token-color-shell-border)" />
          <MiniMap
            nodeColor="var(--token-color-shell-active)"
            maskColor="rgba(0,0,0,0.6)"
            style={{ background: 'var(--token-color-shell-surface)' }}
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  )
}
