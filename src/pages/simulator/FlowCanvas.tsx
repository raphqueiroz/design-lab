import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Flow } from './flowRegistry'
import { getFlowGraph, saveFlowGraph } from './flowGraphStore'
import { autoGenerateFlowGraph } from './flowGraphAutoGen'
import { nodeTypes } from './nodes'
import type { FlowNodeType, FlowNodeData } from './flowGraph.types'
import FlowCanvasToolbar from './FlowCanvasToolbar'
import FlowViewAnnotationsPanel from './FlowViewAnnotationsPanel'

interface FlowCanvasProps {
  flow: Flow
  onNavigateToScreen: (screenId: string) => void
}

function FlowCanvasInner({ flow, onNavigateToScreen }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const initializedRef = useRef<string | null>(null)

  // Load or auto-generate graph when flow changes
  useEffect(() => {
    if (initializedRef.current === flow.id) return
    initializedRef.current = flow.id

    const existing = getFlowGraph(flow.id)
    if (existing) {
      setNodes(existing.nodes as Node[])
      setEdges(existing.edges as Edge[])
    } else {
      const generated = autoGenerateFlowGraph(flow)
      setNodes(generated.nodes as Node[])
      setEdges(generated.edges as Edge[])
      saveFlowGraph(flow.id, generated.nodes, generated.edges)
    }
    setSelectedNode(null)
  }, [flow.id, flow, setNodes, setEdges])

  // Debounced save
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      setNodes((currentNodes) => {
        setEdges((currentEdges) => {
          saveFlowGraph(flow.id, currentNodes, currentEdges)
          return currentEdges
        })
        return currentNodes
      })
    }, 500)
  }, [flow.id, setNodes, setEdges])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
      scheduleSave()
    },
    [setEdges, scheduleSave],
  )

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node)
    },
    [],
  )

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const data = node.data as FlowNodeData
      if (data.screenId) {
        onNavigateToScreen(data.screenId)
      }
    },
    [onNavigateToScreen],
  )

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const handleNodeDragStop = useCallback(() => {
    scheduleSave()
  }, [scheduleSave])

  // Toolbar: Add node
  const handleAddNode = useCallback(
    (nodeType: FlowNodeType) => {
      const id = `node-${Date.now()}`
      const labels: Record<FlowNodeType, string> = {
        screen: 'New Screen',
        decision: 'Decision',
        error: 'Error State',
      }
      const newNode: Node = {
        id,
        type: nodeType,
        position: { x: 300, y: (nodes.length + 1) * 200 },
        data: {
          label: labels[nodeType],
          screenId: null,
          nodeType,
          description: '',
        } satisfies FlowNodeData,
      }
      setNodes((nds) => [...nds, newNode])
      scheduleSave()
    },
    [nodes.length, setNodes, scheduleSave],
  )

  // Toolbar: Reset to linear
  const handleResetToLinear = useCallback(() => {
    const generated = autoGenerateFlowGraph(flow)
    setNodes(generated.nodes as Node[])
    setEdges(generated.edges as Edge[])
    saveFlowGraph(flow.id, generated.nodes, generated.edges)
    setSelectedNode(null)
  }, [flow, setNodes, setEdges])

  // Annotations panel: update node label/description
  const handleNodeUpdate = useCallback(
    (nodeId: string, label: string, description: string) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n
          return {
            ...n,
            data: { ...n.data, label, description },
          }
        }),
      )
      // Update selected node reference
      setSelectedNode((prev) => {
        if (!prev || prev.id !== nodeId) return prev
        return {
          ...prev,
          data: { ...prev.data, label, description },
        }
      })
      scheduleSave()
    },
    [setNodes, scheduleSave],
  )

  // Open in prototype
  const handleOpenInPrototype = useCallback(() => {
    const data = selectedNode?.data as FlowNodeData | undefined
    if (data?.screenId) {
      onNavigateToScreen(data.screenId)
    }
  }, [selectedNode, onNavigateToScreen])

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <FlowCanvasToolbar onAddNode={handleAddNode} onResetToLinear={handleResetToLinear} />
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onPaneClick={handlePaneClick}
            onNodeDragStop={handleNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            className="bg-shell-bg"
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#4ADE80', strokeWidth: 2 },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#3E3E3E"
            />
            <Controls
              className="!bg-shell-surface !border-shell-border !shadow-lg [&>button]:!bg-shell-surface [&>button]:!border-shell-border [&>button]:!text-shell-text [&>button:hover]:!bg-shell-hover"
            />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'screen': return '#4ADE80'
                  case 'decision': return '#FBBF24'
                  case 'error': return '#F87171'
                  default: return '#6B6B6B'
                }
              }}
              maskColor="rgba(30, 30, 30, 0.8)"
              className="!bg-shell-surface !border-shell-border"
            />
          </ReactFlow>
        </div>
      </div>
      <FlowViewAnnotationsPanel
        flow={flow}
        selectedNode={selectedNode}
        onOpenInPrototype={handleOpenInPrototype}
        onNodeUpdate={handleNodeUpdate}
      />
    </div>
  )
}

export default function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
