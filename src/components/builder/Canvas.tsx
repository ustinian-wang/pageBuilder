'use client'

import { useDroppable } from '@dnd-kit/core'
import { Element } from '@/lib/types'
import { ElementRenderer } from './ElementRenderer'

interface CanvasProps {
  elements: Element[]
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  onDelete: (id: string) => void
  onCopy?: (element: Element) => void
}

export function Canvas({ elements, selectedElementId, onSelect, onUpdate, onDelete, onCopy }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
  })

  const handleCanvasClick = (e: React.MouseEvent) => {
    // 检查点击目标是否是元素
    const target = e.target as HTMLElement
    const clickedElement = target.closest('[data-element-id]')
    
    // 如果点击的不是元素（说明是空白区域），取消选中
    // 注意：ElementRenderer 中的 handleClick 会调用 stopPropagation，
    // 所以如果点击的是元素，事件不会到达这里
    if (!clickedElement) {
      onSelect(null)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        h-full bg-white rounded-lg shadow-lg p-2
        ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
      `}
      style={{ minHeight: '100%', boxSizing: 'border-box' }}
      onClick={handleCanvasClick}
    >
      {elements.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">拖拽组件到这里开始构建页面</p>
            <p className="text-sm">从左侧组件库选择组件并拖拽到此处</p>
          </div>
        </div>
      ) : (
        <div className="h-full" style={{ position: 'relative', height: '100%' }}>
          {elements.map(element => (
            <ElementRenderer
              key={element.id}
              element={element}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </div>
  )
}

