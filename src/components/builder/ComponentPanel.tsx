'use client'

import { useDraggable } from '@dnd-kit/core'
import { ElementType } from '@/lib/types'

const componentTypes: Array<{ type: ElementType; label: string; icon: string }> = [
  { type: 'container', label: '容器', icon: '📦' },
  { type: 'text', label: '文本', icon: '📝' },
  { type: 'button', label: '按钮', icon: '🔘' },
  { type: 'input', label: '输入框', icon: '📥' },
  { type: 'image', label: '图片', icon: '🖼️' },
  { type: 'card', label: '卡片', icon: '🎴' },
  { type: 'heading', label: '标题', icon: '📌' },
  { type: 'paragraph', label: '段落', icon: '📄' },
  { type: 'divider', label: '分割线', icon: '➖' },
  { type: 'list', label: '列表', icon: '📋' },
  { type: 'form', label: '表单', icon: '📋' },
]

function DraggableComponent({ type, label, icon }: { type: ElementType; label: string; icon: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${type}`,
    data: {
      type: 'component',
      componentType: type,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-3 bg-white border border-gray-200 rounded cursor-move
        hover:border-blue-400 hover:shadow-md transition-all
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}

export function ComponentPanel() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">组件库</h2>
      <div className="grid grid-cols-1 gap-2">
        {componentTypes.map(({ type, label, icon }) => (
          <DraggableComponent key={type} type={type} label={label} icon={icon} />
        ))}
      </div>
    </div>
  )
}

