import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RiAddLine, RiArrowDownSLine, RiArrowRightSLine, RiDeleteBinLine,
  RiPencilLine, RiCheckLine, RiCloseLine, RiFolderAddLine, RiFileCopyLine,
  RiExpandUpDownLine, RiCollapseDiagonalLine, RiArchiveLine, RiInboxUnarchiveLine,
} from '@remixicon/react'
import { getFlow, getFlowsByDomain, getAllDomains, getDomain, registerDynamicFlow, unregisterFlow, markFlowDeleted, updateFlowMeta, type Flow } from './flowRegistry'
import { saveDynamicFlow, deleteDynamicFlow, getDynamicFlow, type DynamicFlowDef } from './dynamicFlowStore'
import { getFlowGraph, saveFlowGraph, deleteFlowGraph } from './flowGraphStore'
import {
  getGroupsForDomain, getFlowIdsInGroup, getMembershipForFlow,
  createGroup, deleteGroup, renameGroup, setGroupCollapsed, getGroup,
  assignFlowToGroup, removeFlowFromGroup, reorderFlowsInGroup,
  reorderGroupsInDomain, subscribeToGroupChanges, type FlowGroup,
  archiveFlow, unarchiveFlow, archiveGroup, unarchiveGroup,
  isFlowArchived, isGroupArchived, getArchivedFlowIds, getArchivedGroupIds,
  getUngroupedFlowOrder, setUngroupedFlowOrder, addToUngroupedOrder,
} from './flowGroupStore'
import NewFlowDialog from './NewFlowDialog'
import { uniqueId } from '../../lib/slugify'

interface FlowSidebarProps {
  selectedFlowId: string | null
  onSelect: (flowId: string) => void
  onFlowCreated?: () => void
  onFlowDeleted?: () => void
}

// ── Drag state ──

type DragState =
  | { kind: 'flow'; flowId: string; sourceDomainId: string; sourceGroupId: string | null }
  | { kind: 'group'; groupId: string; sourceDomainId: string }

function ArchiveSection({
  selectedFlowId: _selectedFlowId,
  onSelect: _onSelect,
  renderFlowItem,
  renderGroupHeader,
}: {
  selectedFlowId: string | null
  onSelect: (flowId: string) => void
  renderFlowItem: (flow: Flow, groupId: string | null, domainId: string, archiveMode: 'archive' | 'unarchive') => React.ReactNode
  renderGroupHeader: (group: FlowGroup, flowCount: number, domainId: string, archiveMode: 'archive' | 'unarchive') => React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(true)

  const archivedFlowIds = getArchivedFlowIds()
  const archivedGroupIds = getArchivedGroupIds()

  if (archivedFlowIds.length === 0 && archivedGroupIds.length === 0) return null

  // Resolve archived groups and their flows
  const archivedGroups: FlowGroup[] = []
  const flowsInArchivedGroups = new Set<string>()

  for (const gid of archivedGroupIds) {
    const group = getGroup(gid)
    if (group) {
      archivedGroups.push(group)
      for (const fid of getFlowIdsInGroup(gid)) {
        flowsInArchivedGroups.add(fid)
      }
    }
  }

  // Ungrouped archived flows (not in any archived group)
  const ungroupedArchivedFlows: Flow[] = []
  for (const fid of archivedFlowIds) {
    if (flowsInArchivedGroups.has(fid)) continue
    const flow = getFlow(fid)
    if (flow) ungroupedArchivedFlows.push(flow)
  }

  const totalCount = archivedFlowIds.length
  const ChevronIcon = collapsed ? RiArrowRightSLine : RiArrowDownSLine

  return (
    <div className="border-t border-shell-border mt-[var(--token-spacing-1)]">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-[var(--token-spacing-1)] w-full px-[var(--token-spacing-md)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary/60 uppercase tracking-wider hover:text-shell-text-tertiary transition-colors cursor-pointer"
      >
        <ChevronIcon size={14} className="shrink-0" />
        <span className="flex-1 text-left">Archive</span>
        <span className="text-[length:10px] tabular-nums">{totalCount}</span>
      </button>
      {!collapsed && (
        <div className="opacity-60">
          {/* Ungrouped archived flows */}
          {ungroupedArchivedFlows.map((flow) =>
            renderFlowItem(flow, null, flow.domain, 'unarchive')
          )}

          {/* Archived groups */}
          {archivedGroups.map((group) => {
            const flowIds = getFlowIdsInGroup(group.id)
            const groupFlows: Flow[] = []
            for (const fid of flowIds) {
              const flow = getFlow(fid)
              if (flow) groupFlows.push(flow)
            }
            return (
              <div key={group.id}>
                {renderGroupHeader(group, groupFlows.length, group.domainId, 'unarchive')}
                {!group.collapsed && groupFlows.length > 0 && (
                  <div className="ml-[calc(var(--token-spacing-md)+18px)] border-l border-shell-border">
                    {groupFlows.map((flow) =>
                      renderFlowItem(flow, group.id, flow.domain, 'unarchive')
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function FlowSidebar({ selectedFlowId, onSelect, onFlowCreated, onFlowDeleted }: FlowSidebarProps) {
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Group CRUD state
  const [creatingGroupInDomain, setCreatingGroupInDomain] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string | null>(null)

  // DnD state
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [dropTarget, setDropTarget] = useState<{ type: 'group' | 'ungrouped' | 'flow' | 'domain'; id: string } | null>(null)

  // Re-render on group store changes
  const [, setVersion] = useState(0)
  useEffect(() => {
    return subscribeToGroupChanges(() => setVersion((v) => v + 1))
  }, [])

  const grouped = getFlowsByDomain()
  const allDomains = getAllDomains()

  const orderedDomainIds: string[] = allDomains.map((d) => d.id)
  for (const key of Object.keys(grouped)) {
    if (!orderedDomainIds.includes(key)) orderedDomainIds.push(key)
  }

  // Start with all domains collapsed, except the one containing the selected flow
  const seededRef = useRef(false)
  useEffect(() => {
    if (!seededRef.current && orderedDomainIds.length > 0) {
      seededRef.current = true
      const selectedFlow = selectedFlowId ? getFlow(selectedFlowId) : null
      const initialCollapsed = new Set(orderedDomainIds)
      if (selectedFlow) initialCollapsed.delete(selectedFlow.domain)
      setCollapsedDomains(initialCollapsed)
    }
  }, [orderedDomainIds.length, selectedFlowId])

  const allCollapsed = orderedDomainIds.length > 0 && orderedDomainIds.every((id) => collapsedDomains.has(id))

  const toggleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedDomains(new Set())
    } else {
      setCollapsedDomains(new Set(orderedDomainIds))
    }
  }

  const toggleCollapse = (domainId: string) => {
    setCollapsedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domainId)) next.delete(domainId)
      else next.add(domainId)
      return next
    })
  }

  const handleCreateFlow = (slug: string, domain: string, description: string, groupId?: string) => {
    const def: DynamicFlowDef = {
      id: slug,
      name: slug,
      domain,
      description,
      screens: [],
    }
    saveDynamicFlow(def)
    registerDynamicFlow(def)
    if (groupId) {
      assignFlowToGroup(slug, groupId)
    }
    setShowNewDialog(false)
    onSelect(slug)
    onFlowCreated?.()
  }

  const handleDeleteFlow = (flowId: string) => {
    deleteDynamicFlow(flowId)
    deleteFlowGraph(flowId)
    markFlowDeleted(flowId)
    unregisterFlow(flowId)
    removeFlowFromGroup(flowId)
    setConfirmDeleteId(null)
    if (selectedFlowId === flowId) {
      onSelect('')
    }
    onFlowDeleted?.()
  }

  const handleDuplicateFlow = (flowId: string) => {
    const source = getFlow(flowId)
    if (!source) return

    const newId = uniqueId(flowId + '-copy', (id) => !!getFlow(id) || !!getDynamicFlow(id))
    const def: DynamicFlowDef = {
      id: newId,
      name: newId,
      domain: source.domain,
      description: source.description,
      screens: source.screens.map((s) => ({
        id: s.id.replace(flowId, newId),
        title: s.title,
        description: s.description,
        componentsUsed: [...s.componentsUsed],
      })),
    }
    saveDynamicFlow(def)
    registerDynamicFlow(def)

    // Copy flow graph if one exists
    const graph = getFlowGraph(flowId)
    if (graph) {
      const screenIdMap = new Map(source.screens.map((s, i) => [s.id, def.screens[i].id]))
      const newNodes = graph.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          ...(n.data.screenId && screenIdMap.has(n.data.screenId as string)
            ? { screenId: screenIdMap.get(n.data.screenId as string) }
            : {}),
        },
      }))
      saveFlowGraph(newId, newNodes, [...graph.edges])
    }

    // Copy group membership
    const membership = getMembershipForFlow(flowId)
    if (membership) {
      assignFlowToGroup(newId, membership.groupId)
    }

    onSelect(newId)
    onFlowCreated?.()
  }

  // ── Group CRUD handlers ──

  const handleCreateGroup = (domainId: string) => {
    if (!newGroupName.trim()) return
    createGroup(newGroupName.trim(), domainId)
    setNewGroupName('')
    setCreatingGroupInDomain(null)
  }

  const handleRenameGroup = (groupId: string) => {
    if (!renameValue.trim()) return
    renameGroup(groupId, renameValue.trim())
    setRenamingGroupId(null)
  }

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(groupId)
    setConfirmDeleteGroupId(null)
  }

  // ── Domain move helper ──

  const moveFlowToDomain = useCallback((flowId: string, newDomainId: string) => {
    // Update in-memory registry
    updateFlowMeta(flowId, { domain: newDomainId })
    // Persist for dynamic flows
    const dynFlow = getDynamicFlow(flowId)
    if (dynFlow) {
      dynFlow.domain = newDomainId
      saveDynamicFlow(dynFlow)
    }
    // Remove from any group (groups are domain-scoped)
    removeFlowFromGroup(flowId)
    onFlowCreated?.() // triggers re-render
  }, [onFlowCreated])

  // ── DnD handlers ──

  const handleDragStartFlow = useCallback((e: React.DragEvent, flow: Flow) => {
    const membership = getMembershipForFlow(flow.id)
    setDragState({
      kind: 'flow',
      flowId: flow.id,
      sourceDomainId: flow.domain,
      sourceGroupId: membership?.groupId ?? null,
    })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', flow.id)
  }, [])

  const handleDragStartGroup = useCallback((e: React.DragEvent, group: FlowGroup) => {
    setDragState({
      kind: 'group',
      groupId: group.id,
      sourceDomainId: group.domainId,
    })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', group.id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragState(null)
    setDropTarget(null)
  }, [])

  const handleDropOnGroup = useCallback((e: React.DragEvent, groupId: string, domainId: string) => {
    e.preventDefault()
    if (!dragState) return

    if (dragState.kind === 'flow') {
      // Move to different domain if needed
      if (dragState.sourceDomainId !== domainId) {
        moveFlowToDomain(dragState.flowId, domainId)
      }
      assignFlowToGroup(dragState.flowId, groupId)
    } else if (dragState.kind === 'group' && dragState.groupId !== groupId) {
      // Group reorder only within same domain
      if (dragState.sourceDomainId === domainId) {
        const groups = getGroupsForDomain(domainId)
        const ids = groups.map((g) => g.id).filter((id) => id !== dragState.groupId)
        const targetIdx = ids.indexOf(groupId)
        ids.splice(targetIdx >= 0 ? targetIdx : ids.length, 0, dragState.groupId)
        reorderGroupsInDomain(domainId, ids)
      }
    }

    setDragState(null)
    setDropTarget(null)
  }, [dragState, moveFlowToDomain])

  const handleDropOnUngrouped = useCallback((e: React.DragEvent, domainId: string) => {
    e.preventDefault()
    if (!dragState) return

    if (dragState.kind === 'flow') {
      // Move to different domain if needed
      if (dragState.sourceDomainId !== domainId) {
        moveFlowToDomain(dragState.flowId, domainId)
      } else {
        removeFlowFromGroup(dragState.flowId, domainId)
      }
      // Append to ungrouped order for the target domain
      addToUngroupedOrder(domainId, dragState.flowId)
    }
    // Dropping a group onto ungrouped zone is a no-op

    setDragState(null)
    setDropTarget(null)
  }, [dragState, moveFlowToDomain])

  const handleDropOnFlow = useCallback((e: React.DragEvent, targetFlowId: string, targetGroupId: string | null, domainId: string) => {
    e.preventDefault()
    if (!dragState || dragState.kind !== 'flow') { setDragState(null); setDropTarget(null); return }

    // Move to different domain if needed
    if (dragState.sourceDomainId !== domainId) {
      moveFlowToDomain(dragState.flowId, domainId)
    }

    if (targetGroupId) {
      // Dropping onto a flow within a group — assign to that group and reorder
      assignFlowToGroup(dragState.flowId, targetGroupId)
      const flowIds = getFlowIdsInGroup(targetGroupId)
      // Insert dragged flow before the target
      const filtered = flowIds.filter((id) => id !== dragState.flowId)
      const targetIdx = filtered.indexOf(targetFlowId)
      filtered.splice(targetIdx >= 0 ? targetIdx : filtered.length, 0, dragState.flowId)
      reorderFlowsInGroup(targetGroupId, filtered)
    } else {
      // Dropping onto an ungrouped flow — ungroup and insert before target
      removeFlowFromGroup(dragState.flowId, domainId)
      // Build new order: insert dragged flow before target
      const currentOrder = getUngroupedFlowOrder(domainId)
      const filtered = currentOrder.filter((id) => id !== dragState.flowId)
      const targetIdx = filtered.indexOf(targetFlowId)
      filtered.splice(targetIdx >= 0 ? targetIdx : filtered.length, 0, dragState.flowId)
      setUngroupedFlowOrder(domainId, filtered)
    }
    setDragState(null)
    setDropTarget(null)
  }, [dragState, moveFlowToDomain])

  // ── Inline input ref for auto-focus ──
  const newGroupInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creatingGroupInDomain) newGroupInputRef.current?.focus()
  }, [creatingGroupInDomain])

  useEffect(() => {
    if (renamingGroupId) renameInputRef.current?.focus()
  }, [renamingGroupId])

  // ── Render helpers ──

  const renderFlowItem = (flow: Flow, groupId: string | null, domainId: string, archiveMode: 'archive' | 'unarchive' = 'archive') => {
    const isConfirmingDelete = confirmDeleteId === flow.id
    const isSelected = selectedFlowId === flow.id
    const pageCount = flow.screens.length
    const isDropTargetFlow = dropTarget?.type === 'flow' && dropTarget.id === flow.id
    const isInGroup = groupId !== null

    return (
      <div
        key={flow.id}
        className={`group relative ${isDropTargetFlow ? 'border-t-2 border-shell-selected-text' : ''}`}
        draggable
        onDragStart={(e) => handleDragStartFlow(e, flow)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          handleDragOver(e)
          setDropTarget({ type: 'flow', id: flow.id })
        }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(e) => handleDropOnFlow(e, flow.id, groupId, domainId)}
      >
        <button
          type="button"
          onClick={() => onSelect(flow.id)}
          className={`
            w-full text-left pr-[var(--token-spacing-md)] py-[var(--token-spacing-2)]
            text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)]
            transition-colors duration-[var(--token-transition-fast)] cursor-pointer
            ${isInGroup ? 'pl-[var(--token-spacing-md)]' : 'pl-[calc(var(--token-spacing-md)+14px)]'}
            ${isSelected
              ? 'bg-shell-selected text-shell-selected-text font-medium'
              : 'text-shell-text hover:bg-shell-hover'
            }
          `}
        >
          <span className="font-mono">{flow.id}</span>
          <span className={`block text-[length:var(--token-font-size-caption)] ${isSelected ? 'text-shell-selected-text/60' : 'text-shell-text-tertiary'}`}>
            {pageCount} page{pageCount !== 1 ? 's' : ''}
          </span>
        </button>
        {/* Action buttons — visible on hover */}
        {!isConfirmingDelete && (
          <div className="absolute right-[var(--token-spacing-2)] top-1/2 -translate-y-1/2 items-center gap-[2px] hidden group-hover:flex">
            {archiveMode === 'archive' ? (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); archiveFlow(flow.id, domainId) }}
                  className="w-[20px] h-[20px] flex items-center justify-center rounded-[var(--token-radius-sm)] text-shell-text-tertiary hover:text-shell-selected-text hover:bg-shell-hover transition-colors cursor-pointer"
                  title="Archive flow"
                >
                  <RiArchiveLine size={12} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDuplicateFlow(flow.id) }}
                  className="w-[20px] h-[20px] flex items-center justify-center rounded-[var(--token-radius-sm)] text-shell-text-tertiary hover:text-shell-selected-text hover:bg-shell-hover transition-colors cursor-pointer"
                  title="Duplicate flow"
                >
                  <RiFileCopyLine size={12} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(flow.id) }}
                  className="w-[20px] h-[20px] flex items-center justify-center rounded-[var(--token-radius-sm)] text-shell-text-tertiary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  title="Delete flow"
                >
                  <RiDeleteBinLine size={12} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); unarchiveFlow(flow.id) }}
                className="w-[20px] h-[20px] flex items-center justify-center rounded-[var(--token-radius-sm)] text-shell-text-tertiary hover:text-shell-selected-text hover:bg-shell-hover transition-colors cursor-pointer"
                title="Unarchive flow"
              >
                <RiInboxUnarchiveLine size={12} />
              </button>
            )}
          </div>
        )}
        {/* Inline delete confirmation */}
        {isConfirmingDelete && (
          <div className="flex items-center gap-[var(--token-spacing-1)] px-[var(--token-spacing-md)] py-[var(--token-spacing-1)] bg-error/5 border-y border-error/20">
            <span className="text-[length:var(--token-font-size-caption)] text-error flex-1">
              Delete this flow?
            </span>
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="px-[var(--token-spacing-2)] py-[1px] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary hover:text-shell-text cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeleteFlow(flow.id)}
              className="px-[var(--token-spacing-2)] py-[1px] text-[length:var(--token-font-size-caption)] text-error hover:text-[#FCA5A5] font-medium cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderGroupHeader = (group: FlowGroup, flowCount: number, domainId: string, archiveMode: 'archive' | 'unarchive' = 'archive') => {
    const isCollapsed = group.collapsed
    const ChevronIcon = isCollapsed ? RiArrowRightSLine : RiArrowDownSLine
    const isRenaming = renamingGroupId === group.id
    const isConfirmingDelete = confirmDeleteGroupId === group.id
    const isDropTargetGroup = dropTarget?.type === 'group' && dropTarget.id === group.id

    const isDropTargetGroupReorder = dragState?.kind === 'group' && isDropTargetGroup

    return (
      <div
        key={group.id}
        className={`${isDropTargetGroup ? (isDropTargetGroupReorder ? 'border-t-2 border-shell-selected-text' : 'bg-shell-selected-text/10') : ''}`}
        draggable
        onDragStart={(e) => handleDragStartGroup(e, group)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          handleDragOver(e)
          setDropTarget({ type: 'group', id: group.id })
        }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(e) => handleDropOnGroup(e, group.id, domainId)}
      >
        <div className="group/grp flex items-center gap-[var(--token-spacing-1)] pl-[var(--token-spacing-md)] pr-[var(--token-spacing-2)] py-[var(--token-spacing-1)]">
          {isRenaming ? (
            <form
              className="flex items-center gap-[var(--token-spacing-1)] flex-1 min-w-0"
              onSubmit={(e) => { e.preventDefault(); handleRenameGroup(group.id) }}
            >
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setRenamingGroupId(null) }}
                className="flex-1 min-w-0 px-[var(--token-spacing-1)] py-0 text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text"
              />
              <button type="submit" className="w-[16px] h-[16px] flex items-center justify-center text-shell-selected-text cursor-pointer">
                <RiCheckLine size={12} />
              </button>
              <button type="button" onClick={() => setRenamingGroupId(null)} className="w-[16px] h-[16px] flex items-center justify-center text-shell-text-tertiary cursor-pointer">
                <RiCloseLine size={12} />
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setGroupCollapsed(group.id, !isCollapsed)}
                className="flex items-center gap-[var(--token-spacing-1)] flex-1 min-w-0 text-left text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary hover:text-shell-text transition-colors cursor-pointer"
              >
                <ChevronIcon size={12} className="shrink-0" />
                <span className="truncate">{group.name}</span>
                <span className="text-[length:10px] text-shell-text-tertiary tabular-nums shrink-0">{flowCount}</span>
              </button>
              <div className="hidden group-hover/grp:flex items-center gap-[var(--token-spacing-1)]">
                {archiveMode === 'archive' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => archiveGroup(group.id)}
                      className="w-[16px] h-[16px] flex items-center justify-center text-shell-text-tertiary hover:text-shell-text cursor-pointer"
                      title="Archive group"
                    >
                      <RiArchiveLine size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRenamingGroupId(group.id); setRenameValue(group.name) }}
                      className="w-[16px] h-[16px] flex items-center justify-center text-shell-text-tertiary hover:text-shell-text cursor-pointer"
                      title="Rename group"
                    >
                      <RiPencilLine size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteGroupId(group.id)}
                      className="w-[16px] h-[16px] flex items-center justify-center text-shell-text-tertiary hover:text-error cursor-pointer"
                      title="Delete group"
                    >
                      <RiDeleteBinLine size={10} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => unarchiveGroup(group.id)}
                    className="w-[16px] h-[16px] flex items-center justify-center text-shell-text-tertiary hover:text-shell-text cursor-pointer"
                    title="Unarchive group"
                  >
                    <RiInboxUnarchiveLine size={10} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        {/* Delete group confirmation */}
        {isConfirmingDelete && (
          <div className="flex items-center gap-[var(--token-spacing-1)] px-[var(--token-spacing-md)] py-[var(--token-spacing-1)] bg-error/5 border-y border-error/20">
            <span className="text-[length:var(--token-font-size-caption)] text-error flex-1">
              Delete group? Flows become ungrouped.
            </span>
            <button
              type="button"
              onClick={() => setConfirmDeleteGroupId(null)}
              className="px-[var(--token-spacing-2)] py-[1px] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary hover:text-shell-text cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeleteGroup(group.id)}
              className="px-[var(--token-spacing-2)] py-[1px] text-[length:var(--token-font-size-caption)] text-error hover:text-[#FCA5A5] font-medium cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <aside className="w-[240px] h-full shrink-0 overflow-y-auto border-r border-shell-border bg-shell-surface flex flex-col">
        <div className="p-[var(--token-spacing-md)] flex items-center justify-between">
          <h2 className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] font-semibold text-shell-text-tertiary uppercase tracking-wider">
            Flows
          </h2>
          <div className="flex items-center gap-[var(--token-spacing-1)]">
            <button
              type="button"
              onClick={toggleCollapseAll}
              title={allCollapsed ? 'Expand all' : 'Collapse all'}
              className="w-[24px] h-[24px] flex items-center justify-center rounded-[var(--token-radius-sm)] text-shell-text-tertiary hover:text-shell-selected-text hover:bg-shell-hover transition-colors cursor-pointer"
            >
              {allCollapsed ? <RiExpandUpDownLine size={14} /> : <RiCollapseDiagonalLine size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setShowNewDialog(true)}
              title="New Flow"
              className="w-[24px] h-[24px] flex items-center justify-center rounded-[var(--token-radius-sm)] text-shell-text-tertiary hover:text-shell-selected-text hover:bg-shell-hover transition-colors cursor-pointer"
            >
              <RiAddLine size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {orderedDomainIds.length === 0 && (
            <p className="px-[var(--token-spacing-md)] text-[length:var(--token-font-size-body-sm)] text-shell-text-tertiary">
              No flows yet
            </p>
          )}

          {orderedDomainIds.map((domainId) => {
            const domainDef = getDomain(domainId)
            const domainName = domainDef?.name ?? domainId
            const isCollapsed = collapsedDomains.has(domainId)
            const ChevronIcon = isCollapsed ? RiArrowRightSLine : RiArrowDownSLine
            const domainFlows = grouped[domainId] ?? []

            // Split flows into grouped and ungrouped (excluding archived)
            const groups = getGroupsForDomain(domainId).filter((g) => !isGroupArchived(g.id))
            const groupedFlowIds = new Set<string>()
            const groupFlowMap = new Map<string, Flow[]>()

            for (const group of groups) {
              const flowIds = getFlowIdsInGroup(group.id)
              const flows: Flow[] = []
              for (const fid of flowIds) {
                if (isFlowArchived(fid)) continue
                const flow = domainFlows.find((f) => f.id === fid)
                if (flow) {
                  flows.push(flow)
                  groupedFlowIds.add(fid)
                }
              }
              groupFlowMap.set(group.id, flows)
            }

            const ungroupedFlowsUnsorted = domainFlows.filter((f) => !groupedFlowIds.has(f.id) && !isFlowArchived(f.id))
            const persistedOrder = getUngroupedFlowOrder(domainId)
            const orderIndex = new Map(persistedOrder.map((id, i) => [id, i]))
            const ungroupedFlows = ungroupedFlowsUnsorted.sort((a, b) => {
              const ai = orderIndex.get(a.id) ?? Infinity
              const bi = orderIndex.get(b.id) ?? Infinity
              return ai - bi
            })
            const activeFlows = domainFlows.filter((f) => !isFlowArchived(f.id))
            const totalCount = activeFlows.length

            const isUngroupedDropTarget = dropTarget?.type === 'ungrouped' && dropTarget.id === domainId

            const isDomainDropTarget = dropTarget?.type === 'domain' && dropTarget.id === domainId
            const isCrossDomainDrop = dragState?.kind === 'flow' && dragState.sourceDomainId !== domainId

            return (
              <div key={domainId} className="mb-[var(--token-spacing-1)]">
                <div
                  className={`group/domain flex items-center px-[var(--token-spacing-md)] py-[var(--token-spacing-1)] transition-colors ${isDomainDropTarget && isCrossDomainDrop ? 'bg-shell-selected-text/10' : ''}`}
                  onDragOver={(e) => {
                    if (dragState?.kind === 'flow') {
                      handleDragOver(e)
                      setDropTarget({ type: 'domain', id: domainId })
                    }
                  }}
                  onDragLeave={() => {
                    if (dropTarget?.type === 'domain' && dropTarget.id === domainId) setDropTarget(null)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (!dragState || dragState.kind !== 'flow') { setDragState(null); setDropTarget(null); return }
                    if (dragState.sourceDomainId !== domainId) {
                      moveFlowToDomain(dragState.flowId, domainId)
                    } else {
                      removeFlowFromGroup(dragState.flowId)
                    }
                    // Auto-expand domain on drop
                    setCollapsedDomains((prev) => { const next = new Set(prev); next.delete(domainId); return next })
                    setDragState(null)
                    setDropTarget(null)
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapse(domainId)}
                    className="flex items-center gap-[var(--token-spacing-1)] flex-1 min-w-0 text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary uppercase tracking-wider hover:text-shell-text-secondary transition-colors cursor-pointer"
                  >
                    <ChevronIcon size={14} className="shrink-0" />
                    <span className="flex-1 text-left">{domainName}</span>
                    <span className="text-[length:10px] tabular-nums">{totalCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCreatingGroupInDomain(domainId) }}
                    className="w-[16px] h-[16px] items-center justify-center text-shell-text-tertiary hover:text-shell-selected-text transition-colors cursor-pointer hidden group-hover/domain:flex shrink-0 ml-[var(--token-spacing-1)]"
                    title="New Group"
                  >
                    <RiFolderAddLine size={12} />
                  </button>
                </div>
                {!isCollapsed && (
                  <div>
                    {/* Ungrouped flows */}
                    <div
                      className={isUngroupedDropTarget ? 'bg-shell-selected-text/5' : ''}
                      onDragOver={(e) => {
                        handleDragOver(e)
                        setDropTarget({ type: 'ungrouped', id: domainId })
                      }}
                      onDragLeave={() => setDropTarget(null)}
                      onDrop={(e) => handleDropOnUngrouped(e, domainId)}
                    >
                      {ungroupedFlows.map((flow) => renderFlowItem(flow, null, domainId))}
                    </div>

                    {/* Groups */}
                    {groups.map((group) => {
                      const groupFlows = groupFlowMap.get(group.id) ?? []
                      return (
                        <div key={group.id}>
                          {renderGroupHeader(group, groupFlows.length, domainId)}
                          {!group.collapsed && groupFlows.length > 0 && (
                            <div className="ml-[calc(var(--token-spacing-md)+18px)] border-l border-shell-border">
                              {groupFlows.map((flow) => renderFlowItem(flow, group.id, domainId))}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Create group inline */}
                    {creatingGroupInDomain === domainId && (
                      <form
                        className="flex items-center gap-[var(--token-spacing-1)] px-[var(--token-spacing-md)] py-[var(--token-spacing-1)]"
                        onSubmit={(e) => { e.preventDefault(); handleCreateGroup(domainId) }}
                      >
                        <input
                          ref={newGroupInputRef}
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Escape') { setCreatingGroupInDomain(null); setNewGroupName('') } }}
                          placeholder="Group name..."
                          className="flex-1 min-w-0 px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text"
                        />
                        <button type="submit" disabled={!newGroupName.trim()} className="w-[20px] h-[20px] flex items-center justify-center text-shell-selected-text disabled:opacity-40 cursor-pointer">
                          <RiCheckLine size={12} />
                        </button>
                        <button type="button" onClick={() => { setCreatingGroupInDomain(null); setNewGroupName('') }} className="w-[20px] h-[20px] flex items-center justify-center text-shell-text-tertiary cursor-pointer">
                          <RiCloseLine size={12} />
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Archive section */}
        <ArchiveSection
          selectedFlowId={selectedFlowId}
          onSelect={onSelect}
          renderFlowItem={renderFlowItem}
          renderGroupHeader={renderGroupHeader}
        />

        {/* New flow button at bottom */}
        <div className="p-[var(--token-spacing-2)] border-t border-shell-border">
          <button
            type="button"
            onClick={() => setShowNewDialog(true)}
            className="w-full flex items-center justify-center gap-[var(--token-spacing-1)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-text-tertiary hover:text-shell-selected-text hover:bg-shell-hover rounded-[var(--token-radius-sm)] transition-colors cursor-pointer"
          >
            <RiAddLine size={14} />
            New Flow
          </button>
        </div>
      </aside>

      {showNewDialog && (
        <NewFlowDialog
          onClose={() => setShowNewDialog(false)}
          onCreate={handleCreateFlow}
        />
      )}
    </>
  )
}
