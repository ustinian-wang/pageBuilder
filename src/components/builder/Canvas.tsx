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
}

export function Canvas({ elements, selectedElementId, onSelect, onUpdate, onDelete }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-full bg-white rounded-lg shadow-lg p-8
        ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
      `}
    >
      {elements.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">拖拽组件到这里开始构建页面</p>
            <p className="text-sm">从左侧组件库选择组件并拖拽到此处</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {elements.map(element => (
            <ElementRenderer
              key={element.id}
              element={element}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

