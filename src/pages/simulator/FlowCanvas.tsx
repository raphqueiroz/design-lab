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
  type NodePositionChange,
  type EdgeChange,
  applyEdgeChanges,
  useReactFlow,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Flow } from './flowRegistry'
import { refreshDynamicFlow, updateFlowMeta, getFlowsLinkingTo, renameFlowIdCascade, getAllFlows } from './flowRegistry'
import { getFlowGraph, saveFlowGraph } from './flowGraphStore'
import { autoGenerateFlowGraph } from './flowGraphAutoGen'
import { alignNodes } from './alignNodes'
import { addScreenToFlow, updateScreenInFlow, removeScreenFromFlow, getDynamicFlow, saveDynamicFlow } from './dynamicFlowStore'
import { createScreenFile, createErrorScreenFile, deleteScreenFile } from './flowFileApi'
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
  const lastSnapRef = useRef<{ id: string; x?: number; y?: number } | null>(null)
  const [spacePressed, setSpacePressed] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const initializedRef = useRef<string | null>(null)

  const { pushUndo, undo, redo, reset: resetUndoRedo, canUndo, canRedo } = useUndoRedo()
  const { fitView, screenToFlowPosition } = useReactFlow()

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
  // and intercept remove to clean up linked screen files + orphaned action nodes.
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

        // Bridge edges through deleted pass-through nodes (action, api-call, decision, delay),
        // then remove edges connected to deleted nodes.
        setEdges((currentEdges) => {
          const bridgeEdges: Edge[] = []
          const existingKeys = new Set(currentEdges.map((e) => `${e.source}→${e.target}`))

          for (const id of removedIds) {
            const node = nodes.find((n) => n.id === id)
            if (!node) continue
            const nd = node.data as FlowNodeData
            const passThrough = ['action', 'api-call', 'decision', 'delay']
            if (!passThrough.includes(nd.nodeType)) continue

            const incoming = currentEdges.filter((e) => e.target === id && !removedIds.has(e.source))
            const outgoing = currentEdges.filter((e) => e.source === id && !removedIds.has(e.target))

            for (const inc of incoming) {
              for (const out of outgoing) {
                const key = `${inc.source}→${out.target}`
                if (existingKeys.has(key)) continue
                existingKeys.add(key)
                bridgeEdges.push({
                  id: `bridge-${inc.source}-${out.target}`,
                  source: inc.source,
                  target: out.target,
                })
              }
            }
          }

          return [
            ...currentEdges.filter(
              (e) => !removedIds.has(e.source) && !removedIds.has(e.target),
            ),
            ...bridgeEdges,
          ]
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
        // Remember last snapped position so we can apply it on drop
        const dragChange = nonRemoves.find(
          (c): c is NodePositionChange => c.type === 'position' && c.dragging === true,
        )
        if (dragChange) {
          lastSnapRef.current = { id: dragChange.id, x: lines.snapX, y: lines.snapY }
        }
        applyNodeChanges(adjustedChanges)
      } else {
        // When drag stops, re-apply the last snapped position so the node
        // doesn't jump to the unsnapped grid position on drop.
        const dragStopped = nonRemoves.find(
          (c): c is NodePositionChange => c.type === 'position' && c.dragging === false,
        )
        if (dragStopped && lastSnapRef.current?.id === dragStopped.id) {
          const snap = lastSnapRef.current
          const finalChanges = changes.map((c) => {
            if (c.type === 'position' && c.id === snap.id && c.position) {
              return {
                ...c,
                position: {
                  x: snap.x != null ? snap.x : c.position.x,
                  y: snap.y != null ? snap.y : c.position.y,
                },
              }
            }
            return c
          })
          lastSnapRef.current = null
          setHelperLines({})
          applyNodeChanges(finalChanges)
        } else {
          if (dragStopped) setHelperLines({})
          applyNodeChanges(changes)
        }
      }
    },
    [nodes, edges, applyNodeChanges, setEdges, setNodes, pushUndo, scheduleSave, flow.id, onFlowChanged],
  )

  // Apply edge changes (select, remove, etc.).
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.length > 0) {
        setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges))
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

    // Reconcile: sync action node actionTargets with current screen interactive elements.
    // Handles both code-defined graphs (where graph nodes store interactiveElements)
    // and dynamic/UI-created graphs (where screen nodes may lack interactiveElements).
    {
      // Build a map of screenId → current interactiveElements from the flow definition,
      // falling back to all registered flows for shared/reused screens (dynamic flows may
      // not store interactiveElements on their screen entries).
      const currentElementsByScreen = new Map<string, { id: string; component: string; label: string }[]>()
      for (const s of flow.screens) {
        if (s.interactiveElements?.length) {
          currentElementsByScreen.set(s.id, s.interactiveElements)
        } else {
          // Fallback: look up from all registered flows
          for (const f of getAllFlows()) {
            const found = f.screens.find(fs => fs.id === s.id)?.interactiveElements
            if (found?.length) { currentElementsByScreen.set(s.id, found); break }
          }
        }
      }

      // Build a set of all current valid targets for quick lookup
      const currentValidTargets = new Set<string>()
      for (const els of currentElementsByScreen.values()) {
        for (const el of els) currentValidTargets.add(`${el.component}: ${el.label}`)
      }

      // Build adjacency from edges (child → parent direction)
      const childToParents = new Map<string, string[]>()
      const graphEdges = existing ? existing.edges as Edge[] : []
      for (const e of graphEdges) {
        const list = childToParents.get(e.target) ?? []
        list.push(e.source)
        childToParents.set(e.target, list)
      }

      // For each action node with a stale actionTarget, find the parent screen
      // and match the element by component type to get the updated label
      let dirty = false
      graphNodes = graphNodes.map(n => {
        const nd = n.data as FlowNodeData
        if (nd.nodeType !== 'action' || !nd.actionTarget) return n
        // If the target is still valid, nothing to fix
        if (currentValidTargets.has(nd.actionTarget)) return n

        // Find parent screen node by walking edges backwards
        const parentIds = childToParents.get(n.id) ?? []
        let parentScreenId: string | null = null
        for (const pid of parentIds) {
          const pn = graphNodes.find(gn => gn.id === pid)
          const pd = pn?.data as FlowNodeData | undefined
          if (pd && (pd.nodeType === 'screen' || pd.nodeType === 'overlay')) {
            parentScreenId = pd.screenId ?? pd.pageId ?? null
            break
          }
        }
        if (!parentScreenId) return n

        const screenEls = currentElementsByScreen.get(parentScreenId)
        if (!screenEls) return n

        // Extract component type from old actionTarget ("Button: Ativar rendimento" → "Button")
        const colonIdx = nd.actionTarget.indexOf(': ')
        if (colonIdx < 0) return n
        const oldComponent = nd.actionTarget.slice(0, colonIdx)

        // Find matching element by same component type
        const matches = screenEls.filter(el => el.component === oldComponent)
        if (matches.length !== 1) return n // ambiguous or no match — don't auto-fix

        const newTarget = `${matches[0].component}: ${matches[0].label}`
        if (newTarget === nd.actionTarget) return n

        dirty = true
        const targetLabel = matches[0].label
        return {
          ...n,
          data: {
            ...nd,
            actionTarget: newTarget,
            ...(!nd.labelManuallyEdited ? { label: `User ${nd.actionType ?? 'tap'}s ${targetLabel}` } : {}),
          },
        }
      })

      if (dirty) {
        setNodes(graphNodes)
        saveFlowGraph(flow.id, graphNodes, graphEdges)
      }
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
      setNodes((currentNodes) => {
        let nextEdges: Edge[] = []
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          nextEdges = reconnectEdge(oldEdge, newConnection, currentEdges)
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
        setNodes((currentNodes) => {
          let nextEdges: Edge[] = []
          setEdges((currentEdges) => {
            pushUndo(currentNodes, currentEdges)
            nextEdges = currentEdges.filter((e) => e.id !== edge.id)
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
      if (nodeType !== 'screen' && nodeType !== 'error') return null
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
      const createFn = nodeType === 'error' ? createErrorScreenFile : createScreenFile
      createFn(flow.id, screenIndex, title).then((filePath) => {
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

      // Place node at the center of the current viewport
      const centerPos = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })

      setNodes((currentNodes) => {
        if (nodeType === 'entry-point' && currentNodes.some((n) => (n.data as FlowNodeData).nodeType === 'entry-point')) {
          return currentNodes
        }
        setEdges((currentEdges) => {
          pushUndo(currentNodes, currentEdges)
          return currentEdges
        })
        const newNode: Node = {
          id: nodeId,
          type: nodeType,
          position: { x: Math.round(centerPos.x / 20) * 20, y: Math.round(centerPos.y / 20) * 20 },
          data: {
            label: NODE_LABELS[nodeType],
            screenId: linkedScreenId,
            nodeType,
            description: '',
            ...(nodeType === 'error' ? { errorDisplay: 'full-screen' as const } : {}),
          } as FlowNodeData,
        }
        return [...currentNodes, newNode]
      })
      scheduleSave()
    },
    [setNodes, setEdges, scheduleSave, pushUndo, createLinkedScreen, screenToFlowPosition],
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
        ...(nodeType === 'error' ? { errorDisplay: 'full-screen' as const } : {}),
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

  // Enrich edges with callbacks and decision styling
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
            onDelete={() => {
              scheduleSave()
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
              markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#4ADE80' },
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
          onAlignNodes={handleAlignNodes}
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
        onFlowMetaUpdate={handleFlowMetaUpdate}
        onRenameFlow={handleRenameFlow}
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
