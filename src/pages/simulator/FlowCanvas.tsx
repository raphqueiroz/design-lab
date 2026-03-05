import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  SelectionMode,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  BackgroundVariant,
  ReactFlowProvider,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Flow } from './flowRegistry'
import { refreshDynamicFlow, updateFlowMeta, getFlowsLinkingTo } from './flowRegistry'
import { getFlowGraph, saveFlowGraph } from './flowGraphStore'
import { autoGenerateFlowGraph } from './flowGraphAutoGen'
import { alignNodes } from './alignNodes'
import { addScreenToFlow, updateScreenInFlow, getDynamicFlow, saveDynamicFlow } from './dynamicFlowStore'
import { nodeTypes } from './nodes'
import type { FlowNodeType, FlowNodeData } from './flowGraph.types'
import { syncNodeLabelToScreen } from './flowGraphSync'
import FloatingCanvasToolbar from './FloatingCanvasToolbar'
import FlowViewAnnotationsPanel from './FlowViewAnnotationsPanel'
import InsertableEdge from './InsertableEdge'
import HelperLines from './HelperLines'
import { getHelperLines, type HelperLineResult } from './getHelperLines'

interface FlowCanvasProps {
  flow: Flow
  onNavigateToScreen: (screenId: string) => void
  onNavigateToFlow?: (flowId: string) => void
  onFlowChanged?: () => void
}

interface UndoState {
  nodes: Node[]
  edges: Edge[]
}

const MAX_UNDO = 50

const edgeTypes = { insertable: InsertableEdge }

function FlowCanvasInner({ flow, onNavigateToScreen, onNavigateToFlow, onFlowChanged }: FlowCanvasProps) {
  const [nodes, setNodes, applyNodeChanges] = useNodesState<Node>([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [helperLines, setHelperLines] = useState<HelperLineResult>({})
  const [spacePressed, setSpacePressed] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const initializedRef = useRef<string | null>(null)

  // Undo/redo stacks
  const undoStackRef = useRef<UndoState[]>([])
  const redoStackRef = useRef<UndoState[]>([])
  const [undoCount, setUndoCount] = useState(0)
  const [redoCount, setRedoCount] = useState(0)

  const pushUndo = useCallback((n: Node[], e: Edge[]) => {
    undoStackRef.current.push({
      nodes: JSON.parse(JSON.stringify(n)),
      edges: JSON.parse(JSON.stringify(e)),
    })
    if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift()
    redoStackRef.current = []
    setUndoCount(undoStackRef.current.length)
    setRedoCount(0)
  }, [])

  // Custom onNodesChange: intercept drag to compute alignment guides + snap
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const hasDrag = changes.some((c) => c.type === 'position' && c.dragging)
      if (hasDrag) {
        const { lines, adjustedChanges } = getHelperLines(changes, nodes, edges)
        setHelperLines(lines)
        applyNodeChanges(adjustedChanges)
      } else {
        // Clear guides when drag stops
        const dragStopped = changes.some((c) => c.type === 'position' && c.dragging === false)
        if (dragStopped) setHelperLines({})
        applyNodeChanges(changes)
      }
    },
    [nodes, edges, applyNodeChanges],
  )

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
    undoStackRef.current = []
    redoStackRef.current = []
    setUndoCount(0)
    setRedoCount(0)
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
      setNodes((currentNodes) => {
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          return addEdge(connection, currentEdges)
        })
        return currentNodes
      })
      scheduleSave()
    },
    [setNodes, setEdges, scheduleSave, pushUndo],
  )

  // Edge reconnection: drag an existing edge endpoint to a new handle
  const edgeReconnectSuccessful = useRef(true)

  const handleReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false
  }, [])

  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true
      setNodes((currentNodes) => {
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          return reconnectEdge(oldEdge, newConnection, currentEdges)
        })
        return currentNodes
      })
      scheduleSave()
    },
    [setNodes, setEdges, scheduleSave, pushUndo],
  )

  const handleReconnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        // Edge was dropped in empty space — delete it
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            pushUndo(currentNodes, currentEdges)
            return currentEdges.filter((e) => e.id !== edge.id)
          })
          return currentNodes
        })
        scheduleSave()
      }
    },
    [setNodes, setEdges, scheduleSave, pushUndo],
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
      if (data.nodeType === 'flow-reference' && data.targetFlowId) {
        onNavigateToFlow?.(data.targetFlowId)
      } else if (data.screenId) {
        onNavigateToScreen(data.screenId)
      }
    },
    [onNavigateToScreen, onNavigateToFlow],
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
      const nodeId = `node-${Date.now()}`
      const labels: Record<FlowNodeType, string> = {
        screen: 'New Screen',
        page: 'New Page',
        decision: 'Decision',
        error: 'Error State',
        'flow-reference': 'Flow Reference',
        action: 'User Action',
        overlay: 'Overlay',
        'api-call': 'API Call',
        delay: 'Delay',
        note: 'Note',
        'entry-point': 'Entry Points',
      }

      // For dynamic flows, creating a screen node also creates a linked screen
      let linkedScreenId: string | null = null
      if (nodeType === 'screen' && flow.isDynamic) {
        linkedScreenId = `screen-${Date.now()}`
        addScreenToFlow(flow.id, {
          id: linkedScreenId,
          title: labels[nodeType],
          description: '',
          componentsUsed: [],
        })
        refreshDynamicFlow(flow.id)
        onFlowChanged?.()
      }

      setNodes((currentNodes) => {
        // Only one entry-point node per flow
        if (nodeType === 'entry-point' && currentNodes.some((n) => (n.data as FlowNodeData).nodeType === 'entry-point')) {
          return currentNodes
        }
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          return currentEdges
        })
        const maxY = currentNodes.reduce((max, n) => Math.max(max, n.position.y), 0)
        const nodeData: FlowNodeData = {
          label: labels[nodeType],
          screenId: linkedScreenId,
          nodeType,
          description: '',
        }
        const newNode: Node = {
          id: nodeId,
          type: nodeType,
          position: { x: 300, y: maxY + 200 },
          data: nodeData,
        }
        return [...currentNodes, newNode]
      })
      scheduleSave()
    },
    [setNodes, setEdges, scheduleSave, pushUndo, flow.id, flow.isDynamic, onFlowChanged],
  )

  // Insert node on edge
  const handleInsertNodeOnEdge = useCallback(
    (edgeId: string, nodeType: FlowNodeType, position: { x: number; y: number }) => {
      const nodeId = `node-${Date.now()}`
      const labels: Record<FlowNodeType, string> = {
        screen: 'New Screen', page: 'New Page', decision: 'Decision',
        error: 'Error State', 'flow-reference': 'Flow Reference',
        action: 'User Action', overlay: 'Overlay', 'api-call': 'API Call',
        delay: 'Delay', note: 'Note', 'entry-point': 'Entry Points',
      }

      let linkedScreenId: string | null = null
      if (nodeType === 'screen' && flow.isDynamic) {
        linkedScreenId = `screen-${Date.now()}`
        addScreenToFlow(flow.id, {
          id: linkedScreenId,
          title: labels[nodeType],
          description: '',
          componentsUsed: [],
        })
        refreshDynamicFlow(flow.id)
        onFlowChanged?.()
      }

      const nodeData: FlowNodeData = {
        label: labels[nodeType],
        screenId: linkedScreenId,
        nodeType,
        description: '',
      }

      setNodes((currentNodes) => {
        // Only one entry-point node per flow
        if (nodeType === 'entry-point' && currentNodes.some((n) => (n.data as FlowNodeData).nodeType === 'entry-point')) {
          return currentNodes
        }
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          const edge = currentEdges.find((e) => e.id === edgeId)
          if (!edge) return currentEdges

          // Remove old edge, create two new edges: source→new, new→target
          const newEdges = currentEdges.filter((e) => e.id !== edgeId)
          newEdges.push({
            id: `${edge.source}->${nodeId}`,
            source: edge.source,
            target: nodeId,
            sourceHandle: edge.sourceHandle,
            targetHandle: 'top',
            type: 'insertable',
          })
          newEdges.push({
            id: `${nodeId}->${edge.target}`,
            source: nodeId,
            target: edge.target,
            sourceHandle: 'bottom',
            targetHandle: edge.targetHandle,
            type: 'insertable',
          })
          return newEdges
        })

        const newNode: Node = {
          id: nodeId,
          type: nodeType,
          position: { x: position.x, y: position.y },
          data: nodeData,
        }
        return [...currentNodes, newNode]
      })
      scheduleSave()
    },
    [setNodes, setEdges, scheduleSave, pushUndo, flow.id, flow.isDynamic, onFlowChanged],
  )

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return
    const prev = undoStackRef.current.pop()!
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        redoStackRef.current.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
        })
        setRedoCount(redoStackRef.current.length)
        return prev.edges as Edge[]
      })
      return prev.nodes as Node[]
    })
    setUndoCount(undoStackRef.current.length)
    scheduleSave()
  }, [setNodes, setEdges, scheduleSave])

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return
    const next = redoStackRef.current.pop()!
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        undoStackRef.current.push({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
        })
        setUndoCount(undoStackRef.current.length)
        return next.edges as Edge[]
      })
      return next.nodes as Node[]
    })
    setRedoCount(redoStackRef.current.length)
    scheduleSave()
  }, [setNodes, setEdges, scheduleSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('screen')
      } else if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('decision')
      } else if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('error')
      } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('flow-reference')
      } else if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('action')
      } else if (e.key === 'o' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('overlay')
      } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('api-call')
      } else if (e.key === 'w' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('delay')
      } else if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('note')
      } else if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleAddNode('entry-point')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo, handleRedo, handleAddNode])

  // Space key: toggle lasso selection mode
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        setSpacePressed(true)
      }
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacePressed(false)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // Align nodes: reposition all nodes in a centered layered layout
  const handleAlignNodes = useCallback(() => {
    const result = { nodes: null as Node[] | null, edges: null as Edge[] | null }
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        pushUndo(currentNodes, currentEdges)
        const aligned = alignNodes(currentNodes, currentEdges)
        result.nodes = aligned.nodes as Node[]
        result.edges = aligned.edges as Edge[]
        return result.edges
      })
      return result.nodes ?? currentNodes
    })
    if (result.nodes && result.edges) {
      saveFlowGraph(flow.id, result.nodes, result.edges)
    }
    setSelectedNode(null)
  }, [flow.id, setNodes, setEdges, pushUndo])

  // Annotations panel: update node data fields
  const handleNodeUpdate = useCallback(
    (nodeId: string, updates: Record<string, unknown>) => {
      // Sync label/description changes to the linked dynamic screen
      if (updates.label || 'description' in updates) {
        const nd = nodes.find((n) => n.id === nodeId)?.data as FlowNodeData | undefined
        if (nd?.screenId) {
          if (updates.label) {
            syncNodeLabelToScreen(flow.id, nd.screenId, updates.label as string, !!flow.isDynamic)
          }
          if ('description' in updates && flow.isDynamic) {
            updateScreenInFlow(flow.id, nd.screenId, { description: (updates.description as string) ?? '' })
            refreshDynamicFlow(flow.id)
            onFlowChanged?.()
          }
        }
      }

      // Auto-generate action node labels when actionType or actionTarget changes
      const nodeData = nodes.find((n) => n.id === nodeId)?.data as FlowNodeData | undefined
      if (nodeData?.nodeType === 'action') {
        const hasTypeOrTargetChange = 'actionType' in updates || 'actionTarget' in updates
        const isDirectLabelEdit = 'label' in updates && !hasTypeOrTargetChange

        if (isDirectLabelEdit) {
          updates.labelManuallyEdited = true
        } else if (hasTypeOrTargetChange && !nodeData.labelManuallyEdited) {
          const verbMap: Record<string, string> = {
            tap: 'taps', swipe: 'swipes', input: 'inputs',
            scroll: 'scrolls', 'long-press': 'long-presses',
          }
          const actionType = (updates.actionType as string) ?? nodeData.actionType ?? 'tap'
          const actionTarget = (updates.actionTarget as string) ?? nodeData.actionTarget ?? ''
          const verb = verbMap[actionType] ?? actionType
          if (actionTarget) {
            updates.label = `User ${verb} ${actionTarget}`
          }
        }
      }

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n
          return {
            ...n,
            data: { ...n.data, ...updates },
          }
        }),
      )
      setSelectedNode((prev) => {
        if (!prev || prev.id !== nodeId) return prev
        return {
          ...prev,
          data: { ...prev.data, ...updates },
        }
      })
      scheduleSave()
    },
    [setNodes, scheduleSave, nodes, flow.id, flow.isDynamic, onFlowChanged],
  )

  // Update edge label (for decision edges)
  const handleEdgeLabelChange = useCallback(
    (edgeId: string, label: string) => {
      setEdges((currentEdges) =>
        currentEdges.map((e) =>
          e.id === edgeId ? { ...e, label } : e,
        ),
      )
      scheduleSave()
    },
    [setEdges, scheduleSave],
  )

  // Update flow name/description
  const handleFlowMetaUpdate = useCallback(
    (updates: { name?: string; description?: string }) => {
      updateFlowMeta(flow.id, updates)
      // Persist for dynamic flows
      const dynFlow = getDynamicFlow(flow.id)
      if (dynFlow) {
        if (updates.name !== undefined) dynFlow.name = updates.name
        if (updates.description !== undefined) dynFlow.description = updates.description
        saveDynamicFlow(dynFlow)
      }
      onFlowChanged?.()
    },
    [flow.id, onFlowChanged],
  )

  // Update screen description directly (from annotations panel)
  const handleScreenDescriptionUpdate = useCallback(
    (screenId: string, description: string) => {
      if (flow.isDynamic) {
        updateScreenInFlow(flow.id, screenId, { description })
        refreshDynamicFlow(flow.id)
        onFlowChanged?.()
      }
      // Also update the graph node description to keep them in sync
      setNodes((nds) => {
        const node = nds.find((n) => (n.data as FlowNodeData).screenId === screenId)
        if (!node) return nds
        return nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, description } } : n,
        )
      })
      setSelectedNode((prev) => {
        if (!prev) return prev
        const nd = prev.data as FlowNodeData
        if (nd.screenId !== screenId) return prev
        return { ...prev, data: { ...prev.data, description } }
      })
      scheduleSave()
    },
    [flow.id, flow.isDynamic, setNodes, scheduleSave, onFlowChanged],
  )

  // Open in prototype
  const handleOpenInPrototype = useCallback(() => {
    const data = selectedNode?.data as FlowNodeData | undefined
    if (data?.screenId) {
      onNavigateToScreen(data.screenId)
    }
  }, [selectedNode, onNavigateToScreen])

  // Enrich entry-point nodes with auto-computed data
  const enrichedNodes = useMemo(() => {
    return nodes.map((n) => {
      const d = n.data as FlowNodeData
      if (d.nodeType !== 'entry-point') return n
      return {
        ...n,
        data: {
          ...d,
          autoEntryPoints: flow.entryPoints ?? [],
          linkedFromFlows: getFlowsLinkingTo(flow.id).map((f) => ({ id: f.id, name: f.name })),
        },
      }
    })
  }, [nodes, flow])

  // Enrich edges with insert callback, insertable type, and decision-node styling
  const enrichedEdges = useMemo(() => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    return edges.map((e) => {
      const sourceNode = nodeMap.get(e.source)
      const targetNode = nodeMap.get(e.target)
      const sourceType = (sourceNode?.data as FlowNodeData | undefined)?.nodeType
      const targetType = (targetNode?.data as FlowNodeData | undefined)?.nodeType
      const isDecisionEdge = sourceType === 'decision' || targetType === 'decision'

      return {
        ...e,
        type: e.type || 'insertable',
        data: {
          ...e.data,
          onInsertNode: handleInsertNodeOnEdge,
          onEdgeLabelChange: handleEdgeLabelChange,
          isDecisionEdge,
        },
        ...(isDecisionEdge ? {
          style: { stroke: '#FBBF24', strokeWidth: 2 },
          label: e.label || '',
        } : {}),
      }
    })
  }, [edges, nodes, handleInsertNodeOnEdge, handleEdgeLabelChange])

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={enrichedNodes}
            edges={enrichedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onReconnectStart={handleReconnectStart}
            onReconnect={handleReconnect}
            onReconnectEnd={handleReconnectEnd}
            reconnectRadius={20}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onPaneClick={handlePaneClick}
            onNodeDragStop={handleNodeDragStop}
            nodeTypes={nodeTypes}
            selectionOnDrag={spacePressed}
            selectionMode={SelectionMode.Partial}
            panOnDrag={!spacePressed}
            snapToGrid
            snapGrid={[20, 20]}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{
              type: 'insertable',
              style: { stroke: '#4ADE80', strokeWidth: 2 },
            }}
          >
            <Background
              variant={BackgroundVariant.Lines}
              gap={20}
              lineWidth={1}
              color="#2A2A2A"
              bgColor="#1E1E1E"
            />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'screen': return '#4ADE80'
                  case 'page': return '#4ADE80'
                  case 'decision': return '#FBBF24'
                  case 'error': return '#F87171'
                  case 'flow-reference': return '#60A5FA'
                  case 'action': return '#A78BFA'
                  case 'overlay': return '#2DD4BF'
                  case 'api-call': return '#22D3EE'
                  case 'delay': return '#FB923C'
                  case 'note': return '#78716C'
                  case 'entry-point': return '#F472B6'
                  default: return '#6B6B6B'
                }
              }}
              maskColor="rgba(30, 30, 30, 0.8)"
              className="!bg-shell-surface !border-shell-border"
            />
          </ReactFlow>
          <HelperLines horizontal={helperLines.horizontal} vertical={helperLines.vertical} />
        </div>
        <FloatingCanvasToolbar
          onAddNode={handleAddNode}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoCount > 0}
          canRedo={redoCount > 0}
        />
      </div>
      <FlowViewAnnotationsPanel
        flow={flow}
        selectedNode={selectedNode}
        nodes={nodes}
        edges={edges}
        onOpenInPrototype={handleOpenInPrototype}
        onNodeUpdate={handleNodeUpdate}
        onScreenDescriptionUpdate={handleScreenDescriptionUpdate}
        onAlignNodes={handleAlignNodes}
        onFlowMetaUpdate={handleFlowMetaUpdate}
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
