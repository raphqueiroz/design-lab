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
  type EdgeChange,
  applyEdgeChanges,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Flow } from './flowRegistry'
import { refreshDynamicFlow, updateFlowMeta, getFlowsLinkingTo, renameFlowIdCascade } from './flowRegistry'
import { getFlowGraph, saveFlowGraph } from './flowGraphStore'
import { autoGenerateFlowGraph } from './flowGraphAutoGen'
import { alignNodes } from './alignNodes'
import { addScreenToFlow, updateScreenInFlow, removeScreenFromFlow, getDynamicFlow, saveDynamicFlow } from './dynamicFlowStore'
import { createScreenFile, deleteScreenFile, writeFlowIndex } from './flowFileApi'
import { generateFlowIndex, type FlowIndexDef } from './flowIndexGenerator'
import { resolveFilePath } from './screenResolver'
import { nodeTypes } from './nodes'
import type { CreatableNodeType, FlowNodeData } from './flowGraph.types'
import { syncNodeLabelToScreen } from './flowGraphSync'
import { NODE_LABELS, NODE_COLORS, SHORTCUT_TO_NODE_TYPE } from './nodeTypeConfig'
import FloatingCanvasToolbar from './FloatingCanvasToolbar'
import FlowViewAnnotationsPanel from './FlowViewAnnotationsPanel'
import InsertableEdge from './InsertableEdge'
import HelperLines from './HelperLines'
import { getHelperLines, type HelperLineResult } from './getHelperLines'
import { useUndoRedo } from './useUndoRedo'

interface FlowCanvasProps {
  flow: Flow
  onNavigateToScreen: (screenId: string) => void
  onNavigateToFlow?: (flowId: string) => void
  onFlowChanged?: () => void
}

const edgeTypes = { insertable: InsertableEdge }

function FlowCanvasInner({ flow, onNavigateToScreen, onNavigateToFlow, onFlowChanged }: FlowCanvasProps) {
  const [nodes, setNodes, applyNodeChanges] = useNodesState<Node>([] as Node[])
  const [edges, setEdges] = useEdgesState<Edge>([] as Edge[])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [helperLines, setHelperLines] = useState<HelperLineResult>({})
  const [spacePressed, setSpacePressed] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const initializedRef = useRef<string | null>(null)

  const { pushUndo, undo, redo, reset: resetUndoRedo, canUndo, canRedo } = useUndoRedo()
  const { fitView } = useReactFlow()

  // Debounced save — must be defined before onNodesChange which references it
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

  // Custom onNodesChange: intercept drag to compute alignment guides + snap,
  // and intercept remove to clean up linked screen files + real edges behind merged edges.
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const removes = changes.filter((c) => c.type === 'remove')
      if (removes.length > 0) {
        const removedIds = new Set(removes.map((c) => c.type === 'remove' ? c.id : ''))

        // Push undo state before applying removes
        setEdges((currentEdges) => {
          pushUndo(nodes, currentEdges)
          return currentEdges
        })

        for (const change of removes) {
          if (change.type !== 'remove') continue
          const node = nodes.find((n) => n.id === change.id)
          if (!node) continue
          const nd = node.data as FlowNodeData

          // Screen node deletion: remove linked screen + .tsx file
          if ((nd.nodeType === 'screen' || nd.nodeType === 'page') && nd.screenId) {
            const dynFlow = getDynamicFlow(flow.id)
            const dynScreen = dynFlow?.screens.find((s) => s.id === nd.screenId)
            if (dynScreen?.filePath) {
              deleteScreenFile(dynScreen.filePath)
            }
            removeScreenFromFlow(flow.id, nd.screenId)
            refreshDynamicFlow(flow.id)
            onFlowChanged?.()
          }
        }

        // Remove real edges connected to deleted nodes (React Flow only sees
        // enriched/merged edges, so it can't clean up the originals).
        // Also remove orphaned action nodes that were hidden behind merged edges.
        setEdges((currentEdges) => {
          const cleaned = currentEdges.filter(
            (e) => !removedIds.has(e.source) && !removedIds.has(e.target),
          )
          // After cleaning edges, also remove orphaned action nodes (those
          // that lost their incoming or outgoing connection).
          setTimeout(() => {
            setNodes((curNodes) => {
              let latestEdges: Edge[] = []
              setEdges((ce) => { latestEdges = ce; return ce })
              const sources = new Set(latestEdges.map((e) => e.source))
              const targets = new Set(latestEdges.map((e) => e.target))
              return curNodes.filter((n) => {
                const d = n.data as FlowNodeData
                if (d.nodeType !== 'action') return true
                return targets.has(n.id) && sources.has(n.id)
              })
            })
          }, 0)
          return cleaned
        })

        scheduleSave()
      }

      // Only apply non-remove changes via the standard path, since we
      // already handled removes above (including edge cleanup + undo).
      const nonRemoves = changes.filter((c) => c.type !== 'remove')
      if (removes.length > 0 && nonRemoves.length === 0) {
        // All changes were removes — apply them to remove the nodes
        applyNodeChanges(changes)
        return
      }

      const hasDrag = nonRemoves.some((c) => c.type === 'position' && c.dragging)
      if (hasDrag) {
        const { lines, adjustedChanges } = getHelperLines(changes, nodes, edges)
        setHelperLines(lines)
        applyNodeChanges(adjustedChanges)
      } else {
        // Clear guides when drag stops
        const dragStopped = nonRemoves.some((c) => c.type === 'position' && c.dragging === false)
        if (dragStopped) setHelperLines({})
        applyNodeChanges(changes)
      }
    },
    [nodes, edges, applyNodeChanges, setEdges, setNodes, pushUndo, scheduleSave, flow.id, onFlowChanged],
  )

  // Custom onEdgesChange: skip remove changes for merged edge IDs (those are
  // virtual — onNodesChange already handles cleaning up the real edges behind them).
  // All other edge changes (select, etc.) are applied normally.
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Filter out remove changes for merged edges — they don't exist in real state
      const filtered = changes.filter(
        (c) => !(c.type === 'remove' && c.id.startsWith('merged-')),
      )
      if (filtered.length > 0) {
        setEdges((currentEdges) => applyEdgeChanges(filtered, currentEdges))
      }
    },
    [setEdges],
  )

  // Load or auto-generate graph when flow changes
  useEffect(() => {
    if (initializedRef.current === flow.id) return
    initializedRef.current = flow.id

    const existing = getFlowGraph(flow.id)
    let graphNodes: Node[]
    if (existing) {
      graphNodes = existing.nodes as Node[]
      setNodes(graphNodes)
      setEdges(existing.edges as Edge[])
    } else {
      const generated = autoGenerateFlowGraph(flow)
      graphNodes = generated.nodes as Node[]
      setNodes(graphNodes)
      setEdges(generated.edges as Edge[])
      saveFlowGraph(flow.id, generated.nodes, generated.edges)
    }

    // Reconcile: prune dynamic screens not referenced by any graph node
    const dynFlow = getDynamicFlow(flow.id)
    if (dynFlow) {
      const referencedScreenIds = new Set(
        graphNodes
          .map((n) => (n.data as FlowNodeData).screenId)
          .filter(Boolean),
      )
      const orphans = dynFlow.screens.filter((s) => !referencedScreenIds.has(s.id))
      if (orphans.length > 0) {
        for (const orphan of orphans) {
          removeScreenFromFlow(flow.id, orphan.id)
        }
        refreshDynamicFlow(flow.id)
        onFlowChanged?.()
      }
    }

    setSelectedNode(null)
    resetUndoRedo()
  }, [flow.id, flow, setNodes, setEdges, resetUndoRedo])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  // Remove action nodes that have become orphaned (no incoming OR no outgoing edges).
  // Called after edge deletion / reconnection to clean up stale collapsed action nodes.
  const removeOrphanedActionNodes = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]): Node[] => {
      const sources = new Set(currentEdges.map((e) => e.source))
      const targets = new Set(currentEdges.map((e) => e.target))
      return currentNodes.filter((n) => {
        const d = n.data as FlowNodeData
        if (d.nodeType !== 'action') return true
        // Keep if it has both incoming and outgoing edges
        return targets.has(n.id) && sources.has(n.id)
      })
    },
    [],
  )

  // Node types that already represent a "reason" — no auto-insert needed
  const AUTO_INSERT_SOURCE_TYPES = new Set(['screen', 'page', 'overlay', 'flow-reference'])

  const handleConnect = useCallback(
    (connection: Connection) => {
      setNodes((currentNodes) => {
        const sourceNode = currentNodes.find((n) => n.id === connection.source)
        const targetNode = currentNodes.find((n) => n.id === connection.target)
        const sourceType = (sourceNode?.data as FlowNodeData | undefined)?.nodeType
        const targetType = (targetNode?.data as FlowNodeData | undefined)?.nodeType

        // Only auto-insert action when source is a screen-like node and target is not an overlay
        const shouldAutoInsert =
          sourceType && AUTO_INSERT_SOURCE_TYPES.has(sourceType) && targetType !== 'overlay'

        if (!shouldAutoInsert) {
          // Plain edge — no action node
          setEdges((currentEdges) => {
            pushUndo(currentNodes, currentEdges)
            return addEdge(connection, currentEdges)
          })
          return currentNodes
        }

        // Auto-insert an action placeholder between source and target
        const actionNodeId = `node-${Date.now()}`
        const sourcePos = sourceNode!.position
        const targetPos = targetNode!.position
        const midX = (sourcePos.x + targetPos.x) / 2
        const midY = (sourcePos.y + targetPos.y) / 2

        const actionNode: Node = {
          id: actionNodeId,
          type: 'action',
          position: { x: midX, y: midY },
          data: {
            label: 'Action',
            nodeType: 'action',
            actionType: 'tap',
            screenId: null,
            description: '',
          } as FlowNodeData,
        }

        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          const newEdges = [
            ...currentEdges,
            {
              id: `${connection.source}->${actionNodeId}`,
              source: connection.source,
              target: actionNodeId,
              sourceHandle: connection.sourceHandle ?? undefined,
              targetHandle: 'top',
              type: 'insertable',
            },
            {
              id: `${actionNodeId}->${connection.target}`,
              source: actionNodeId,
              target: connection.target,
              sourceHandle: 'bottom',
              targetHandle: connection.targetHandle ?? undefined,
              type: 'insertable',
            },
          ]
          return newEdges
        })

        // Auto-select the new action node so annotations panel opens
        const newNode = actionNode
        setTimeout(() => setSelectedNode(newNode), 0)

        return [...currentNodes, actionNode]
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
      const isMerged = oldEdge.id.startsWith('merged-')
      const edgeData = oldEdge.data as Record<string, unknown> | undefined
      const originalInId = isMerged ? (edgeData?._originalIncomingEdgeId as string) : null
      const originalOutId = isMerged ? (edgeData?._originalOutgoingEdgeId as string) : null

      setNodes((currentNodes) => {
        let nextEdges: Edge[] = []
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          if (isMerged && originalInId && originalOutId) {
            // Remove both original edges and add the new connection
            const filtered = currentEdges.filter((e) => e.id !== originalInId && e.id !== originalOutId)
            nextEdges = addEdge(newConnection, filtered)
          } else {
            nextEdges = reconnectEdge(oldEdge, newConnection, currentEdges)
          }
          return nextEdges
        })
        return removeOrphanedActionNodes(currentNodes, nextEdges)
      })
      scheduleSave()
    },
    [setNodes, setEdges, scheduleSave, pushUndo, removeOrphanedActionNodes],
  )

  const handleReconnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        // Edge was dropped in empty space — delete it
        const edgeData = edge.data as Record<string, unknown> | undefined
        const isMerged = edge.id.startsWith('merged-')
        // For merged edges, remove both original edges that were collapsed
        const originalInId = isMerged ? (edgeData?._originalIncomingEdgeId as string) : null
        const originalOutId = isMerged ? (edgeData?._originalOutgoingEdgeId as string) : null

        setNodes((currentNodes) => {
          let nextEdges: Edge[] = []
          setEdges((currentEdges) => {
            pushUndo(currentNodes, currentEdges)
            if (isMerged && originalInId && originalOutId) {
              nextEdges = currentEdges.filter((e) => e.id !== originalInId && e.id !== originalOutId)
            } else {
              nextEdges = currentEdges.filter((e) => e.id !== edge.id)
            }
            return nextEdges
          })
          return removeOrphanedActionNodes(currentNodes, nextEdges)
        })
        scheduleSave()
      }
    },
    [setNodes, setEdges, scheduleSave, pushUndo, removeOrphanedActionNodes],
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

  // Shared: create a linked screen in the dynamic store + file on disk
  const createLinkedScreen = useCallback(
    (nodeType: CreatableNodeType): string | null => {
      if (nodeType !== 'screen') return null
      const linkedScreenId = `screen-${Date.now()}`
      const dynFlow = getDynamicFlow(flow.id)
      const screenIndex = (dynFlow?.screens.length ?? flow.screens.length) + 1
      const title = NODE_LABELS[nodeType]
      addScreenToFlow(flow.id, {
        id: linkedScreenId,
        title,
        description: '',
        componentsUsed: [],
        pageId: linkedScreenId,
      })
      createScreenFile(flow.id, screenIndex, title).then((filePath) => {
        if (filePath) updateScreenInFlow(flow.id, linkedScreenId, { filePath })
      })
      refreshDynamicFlow(flow.id)
      onFlowChanged?.()
      return linkedScreenId
    },
    [flow.id, flow.screens.length, onFlowChanged],
  )

  // Toolbar: Add node
  const handleAddNode = useCallback(
    (nodeType: CreatableNodeType) => {
      const nodeId = `node-${Date.now()}`
      const linkedScreenId = createLinkedScreen(nodeType)

      setNodes((currentNodes) => {
        if (nodeType === 'entry-point' && currentNodes.some((n) => (n.data as FlowNodeData).nodeType === 'entry-point')) {
          return currentNodes
        }
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          return currentEdges
        })
        const maxY = currentNodes.reduce((max, n) => Math.max(max, n.position.y), 0)
        const newNode: Node = {
          id: nodeId,
          type: nodeType,
          position: { x: 300, y: maxY + 200 },
          data: { label: NODE_LABELS[nodeType], screenId: linkedScreenId, nodeType, description: '' } as FlowNodeData,
        }
        return [...currentNodes, newNode]
      })
      scheduleSave()
    },
    [setNodes, setEdges, scheduleSave, pushUndo, createLinkedScreen],
  )

  // Insert node on edge
  const handleInsertNodeOnEdge = useCallback(
    (edgeId: string, nodeType: CreatableNodeType, position: { x: number; y: number }) => {
      const nodeId = `node-${Date.now()}`
      const linkedScreenId = createLinkedScreen(nodeType)
      const nodeData: FlowNodeData = {
        label: NODE_LABELS[nodeType],
        screenId: linkedScreenId,
        nodeType,
        description: '',
      }

      setNodes((currentNodes) => {
        if (nodeType === 'entry-point' && currentNodes.some((n) => (n.data as FlowNodeData).nodeType === 'entry-point')) {
          return currentNodes
        }
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          const edge = currentEdges.find((e) => e.id === edgeId)
          if (!edge) return currentEdges

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
    [setNodes, setEdges, scheduleSave, pushUndo, createLinkedScreen],
  )

  const handleUndo = useCallback(() => {
    undo(setNodes, setEdges)
    scheduleSave()
  }, [undo, setNodes, setEdges, scheduleSave])

  const handleRedo = useCallback(() => {
    redo(setNodes, setEdges)
    scheduleSave()
  }, [redo, setNodes, setEdges, scheduleSave])

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
      } else if (!e.ctrlKey && !e.metaKey) {
        const nodeType = SHORTCUT_TO_NODE_TYPE[e.key]
        if (nodeType) {
          e.preventDefault()
          handleAddNode(nodeType)
        }
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
  const handleAlignNodes = useCallback(async () => {
    // Snapshot current state for undo and as input
    let currentNodes: Node[] = []
    let currentEdges: Edge[] = []
    setNodes((n) => { currentNodes = n; return n })
    setEdges((e) => { currentEdges = e; return e })

    pushUndo(currentNodes, currentEdges)

    const aligned = await alignNodes(currentNodes, currentEdges)
    setNodes(aligned.nodes as Node[])
    setEdges(aligned.edges as Edge[])
    saveFlowGraph(flow.id, aligned.nodes, aligned.edges)
    setSelectedNode(null)
    // Fit view after a tick so React Flow has time to apply new positions
    setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 50)
  }, [flow.id, setNodes, setEdges, pushUndo, fitView])

  // Annotations panel: update node data fields
  const handleNodeUpdate = useCallback(
    (nodeId: string, updates: Record<string, unknown>) => {
      // Sync label/description changes to the linked dynamic screen
      if (updates.label || 'description' in updates) {
        const nd = nodes.find((n) => n.id === nodeId)?.data as FlowNodeData | undefined
        if (nd?.screenId) {
          if (updates.label) {
            syncNodeLabelToScreen(flow.id, nd.screenId, updates.label as string)
          }
          if ('description' in updates) {
            updateScreenInFlow(flow.id, nd.screenId, { description: (updates.description as string) ?? '' })
          }
          refreshDynamicFlow(flow.id)
          onFlowChanged?.()
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
    [setNodes, scheduleSave, nodes, flow.id, onFlowChanged],
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

  // Rename flow ID cascade
  const handleRenameFlow = useCallback(
    async (newId: string): Promise<boolean> => {
      const ok = await renameFlowIdCascade(flow.id, newId)
      if (ok) {
        onNavigateToFlow?.(newId)
        onFlowChanged?.()
      }
      return ok
    },
    [flow.id, onNavigateToFlow, onFlowChanged],
  )

  // Save to code: generate index.ts, write to disk
  const handleSaveToCode = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    const graph = getFlowGraph(flow.id)
    if (!graph) return { ok: false, error: 'No flow graph found' }

    // Build FlowIndexDef from dynamic store or from in-memory Flow
    const dynFlow = getDynamicFlow(flow.id)
    const flowDef: FlowIndexDef = dynFlow ?? {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      domain: flow.domain,
      level: flow.level,
      linkedFlows: flow.linkedFlows ? [...flow.linkedFlows] : undefined,
      entryPoints: flow.entryPoints ? [...flow.entryPoints] : undefined,
      screens: flow.screens.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        componentsUsed: [...s.componentsUsed],
        filePath: resolveFilePath(s.component) ?? undefined,
        pageId: s.pageId,
        states: s.states?.map((st) => ({ ...st })),
        interactiveElements: s.interactiveElements
          ? s.interactiveElements.map((ie) => ({ ...ie }))
          : undefined,
      })),
    }

    // Check all screens have file paths
    const missingFiles = flowDef.screens.filter((s) => !s.filePath)
    if (missingFiles.length > 0) {
      return { ok: false, error: `${missingFiles.length} screen(s) have no file on disk` }
    }

    // Generate index.ts content
    const content = generateFlowIndex({
      flow: flowDef,
      nodes: graph.nodes,
      edges: graph.edges,
    })

    // Write to disk (force overwrite)
    const result = await writeFlowIndex(flow.id, content, true)
    if (!result) return { ok: false, error: 'Failed to write file (dev server unavailable)' }
    if (!result.written) {
      return { ok: false, error: result.reason ?? 'Unknown error' }
    }

    return { ok: true }
  }, [flow])

  // Update screen description directly (from annotations panel)
  const handleScreenDescriptionUpdate = useCallback(
    (screenId: string, description: string) => {
      updateScreenInFlow(flow.id, screenId, { description })
      refreshDynamicFlow(flow.id)
      onFlowChanged?.()
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
    [flow.id, setNodes, scheduleSave, onFlowChanged],
  )

  // Open in prototype
  const handleOpenInPrototype = useCallback(() => {
    const data = selectedNode?.data as FlowNodeData | undefined
    if (data?.screenId) {
      onNavigateToScreen(data.screenId)
    }
  }, [selectedNode, onNavigateToScreen])

  // Determine which action nodes should be visually hidden (collapsed into edge labels).
  // An action node is hidden when:
  //  - it has exactly 1 incoming edge
  //  - it does NOT bridge to an overlay node (overlay layout depends on visible action nodes)
  const hiddenActionNodeIds = useMemo(() => {
    const hidden = new Set<string>()
    const incomingCount = new Map<string, number>()
    const outgoingTargets = new Map<string, string[]>()

    for (const e of edges) {
      incomingCount.set(e.target, (incomingCount.get(e.target) ?? 0) + 1)
      if (!outgoingTargets.has(e.source)) outgoingTargets.set(e.source, [])
      outgoingTargets.get(e.source)!.push(e.target)
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    for (const n of nodes) {
      const d = n.data as FlowNodeData
      if (d.nodeType !== 'action') continue
      if ((incomingCount.get(n.id) ?? 0) !== 1) continue

      // Check if any outgoing target is an overlay node — if so, keep visible
      const targets = outgoingTargets.get(n.id) ?? []
      const bridgesToOverlay = targets.some((tid) => {
        const t = nodeMap.get(tid)
        return t && (t.data as FlowNodeData).nodeType === 'overlay'
      })
      if (bridgesToOverlay) continue

      // Also keep visible if it has no outgoing edges (dangling / being authored)
      if (targets.length === 0) continue

      hidden.add(n.id)
    }
    return hidden
  }, [nodes, edges])

  // Enrich entry-point nodes + hide collapsed action nodes
  const enrichedNodes = useMemo(() => {
    return nodes.map((n) => {
      const d = n.data as FlowNodeData

      if (hiddenActionNodeIds.has(n.id)) {
        return { ...n, hidden: true }
      }

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
  }, [nodes, flow, hiddenActionNodeIds])

  // Select a hidden action node (clicked from an edge label pill)
  const handleSelectActionNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (node) setSelectedNode(node)
    },
    [nodes],
  )

  // Enrich edges: merge edge pairs through hidden action nodes into single annotated edges.
  // For each hidden action: remove incoming edge + outgoing edges, create merged edges
  // that go directly from the upstream source to the downstream targets.
  const enrichedEdges = useMemo(() => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    // Build maps of edges entering/leaving hidden action nodes
    const incomingToHidden = new Map<string, Edge>()
    const outgoingFromHidden = new Map<string, Edge[]>()
    const edgeIdsToRemove = new Set<string>()

    for (const e of edges) {
      if (hiddenActionNodeIds.has(e.target)) {
        incomingToHidden.set(e.target, e)
        edgeIdsToRemove.add(e.id)
      }
      if (hiddenActionNodeIds.has(e.source)) {
        if (!outgoingFromHidden.has(e.source)) outgoingFromHidden.set(e.source, [])
        outgoingFromHidden.get(e.source)!.push(e)
        edgeIdsToRemove.add(e.id)
      }
    }

    // Create merged edges for each hidden action node
    const mergedEdges: Edge[] = []
    for (const actionNodeId of hiddenActionNodeIds) {
      const incoming = incomingToHidden.get(actionNodeId)
      const outgoing = outgoingFromHidden.get(actionNodeId) ?? []
      if (!incoming) continue

      const actionNode = nodeMap.get(actionNodeId)
      const actionData = actionNode?.data as FlowNodeData | undefined

      for (const out of outgoing) {
        mergedEdges.push({
          id: `merged-${incoming.id}-${out.id}`,
          source: incoming.source,
          target: out.target,
          sourceHandle: incoming.sourceHandle,
          targetHandle: out.targetHandle,
          type: 'insertable',
          data: {
            isActionEdge: true,
            actionNodeId,
            actionLabel: actionData?.label ?? 'Action',
            actionType: actionData?.actionType ?? 'tap',
            actionTarget: actionData?.actionTarget ?? '',
            _originalIncomingEdgeId: incoming.id,
            _originalOutgoingEdgeId: out.id,
            onSelectActionNode: handleSelectActionNode,
            onInsertNode: handleInsertNodeOnEdge,
            onEdgeLabelChange: handleEdgeLabelChange,
          },
          style: { stroke: '#4ADE80', strokeWidth: 1.5 },
        })
      }
    }

    // Process remaining (non-removed) edges normally
    const normalEdges = edges
      .filter((e) => !edgeIdsToRemove.has(e.id))
      .map((e) => {
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

    return [...normalEdges, ...mergedEdges]
  }, [edges, nodes, hiddenActionNodeIds, handleInsertNodeOnEdge, handleEdgeLabelChange, handleSelectActionNode])

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
            onDelete={({ edges: deletedEdges }) => {
              if (deletedEdges.length > 0) {
                // For merged edges, remove the original real edges behind them
                const realIdsToRemove = new Set<string>()
                for (const e of deletedEdges) {
                  if (e.id.startsWith('merged-')) {
                    const data = e.data as Record<string, unknown> | undefined
                    const inId = data?._originalIncomingEdgeId as string | undefined
                    const outId = data?._originalOutgoingEdgeId as string | undefined
                    if (inId) realIdsToRemove.add(inId)
                    if (outId) realIdsToRemove.add(outId)
                  }
                }
                setNodes((currentNodes) => {
                  let nextEdges: Edge[] = []
                  setEdges((currentEdges) => {
                    if (realIdsToRemove.size > 0) {
                      pushUndo(currentNodes, currentEdges)
                    }
                    nextEdges = realIdsToRemove.size > 0
                      ? currentEdges.filter((e) => !realIdsToRemove.has(e.id))
                      : currentEdges
                    return nextEdges
                  })
                  return removeOrphanedActionNodes(currentNodes, nextEdges)
                })
                scheduleSave()
              }
            }}
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
            defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
            proOptions={{ hideAttribution: true }}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{
              type: 'insertable',
              style: { stroke: '#4ADE80', strokeWidth: 1.5 },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              color="#444"
              bgColor="#1a1a1a"
            />
            <MiniMap
              nodeColor={(node) => NODE_COLORS[node.type ?? ''] ?? '#6B6B6B'}
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
          canUndo={canUndo}
          canRedo={canRedo}
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
        onRenameFlow={handleRenameFlow}
        onSaveToCode={handleSaveToCode}
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
