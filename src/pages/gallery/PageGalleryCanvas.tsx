import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  useNodesState,
  BackgroundVariant,
  ReactFlowProvider,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { Page } from './pageRegistry'
import type { PageNodeData } from './pageGallery.types'
import { autoLayoutPageNodes } from './pageAutoLayout'
import { pageNodeTypes } from './nodes'
import PageDetailPanel from './PageDetailPanel'

interface PageGalleryCanvasProps {
  pages: Page[]
  onPageChanged?: () => void
}

function PageGalleryCanvasInner({ pages, onPageChanged }: PageGalleryCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    const layoutNodes = autoLayoutPageNodes(pages)
    setNodes(layoutNodes as Node[])

    if (selectedNode) {
      const updated = layoutNodes.find((n) => n.id === selectedNode.id)
      setSelectedNode(updated ? (updated as Node) : null)
    }

    initializedRef.current = true
  }, [pages, setNodes]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node)
    },
    [],
  )

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const selectedPageData = selectedNode?.data as PageNodeData | undefined

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={[]}
            onNodesChange={onNodesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={pageNodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            className="bg-shell-bg"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#3E3E3E"
            />
          </ReactFlow>
        </div>
      </div>
      <PageDetailPanel
        page={selectedPageData ? pages.find((p) => p.id === selectedPageData.pageId) : undefined}
        selectedNode={selectedNode}
        onPageChanged={onPageChanged}
      />
    </div>
  )
}

export default function PageGalleryCanvas(props: PageGalleryCanvasProps) {
  return (
    <ReactFlowProvider>
      <PageGalleryCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
