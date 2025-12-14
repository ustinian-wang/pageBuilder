'use client'

import { useState, useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { ElementType, Element, ComponentDefinition } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { ElementList } from './ElementList'

// 系统组件
const systemComponents: ComponentDefinition[] = [
  { type: 'container', label: '容器', icon: '📦', category: 'system', description: '用于包裹其他组件的容器' },
  { type: 'text', label: '文本', icon: '📝', category: 'system', description: '普通文本元素' },
  { type: 'button', label: '按钮', icon: '🔘', category: 'system', description: '可点击的按钮' },
  { type: 'input', label: '输入框', icon: '📥', category: 'system', description: '文本输入框' },
  { type: 'image', label: '图片', icon: '🖼️', category: 'system', description: '图片元素' },
  { type: 'card', label: '卡片', icon: '🎴', category: 'system', description: '卡片容器' },
  { type: 'heading', label: '标题', icon: '📌', category: 'system', description: '标题文本（H1-H6）' },
  { type: 'paragraph', label: '段落', icon: '📄', category: 'system', description: '段落文本' },
  { type: 'divider', label: '分割线', icon: '➖', category: 'system', description: '水平分割线' },
  { type: 'list', label: '列表', icon: '📋', category: 'system', description: '有序或无序列表' },
  { type: 'form', label: '表单', icon: '📋', category: 'system', description: '表单容器' },
]

// 自定义组件（可以从数据库或配置文件加载）
const customComponents: ComponentDefinition[] = [
  // 这里可以添加自定义组件
  // 例如：{ type: 'custom-banner', label: '轮播图', icon: '🎠', category: 'custom', description: '图片轮播组件' },
]

function DraggableComponent({ component }: { component: ComponentDefinition }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${component.type}`,
    data: {
      type: 'component',
      componentType: component.type,
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
      title={component.description}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl flex-shrink-0">{component.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{component.label}</div>
          {component.description && (
            <div className="text-xs text-gray-500 truncate mt-0.5">{component.description}</div>
          )}
        </div>
        {component.category === 'custom' && (
          <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded flex-shrink-0">
            自定义
          </span>
        )}
      </div>
    </div>
  )
}

function ComponentGroup({
  title,
  components,
  searchQuery,
}: {
  title: string
  components: ComponentDefinition[]
  searchQuery: string
}) {
  // 过滤匹配的组件
  const filteredComponents = useMemo(() => {
    if (!searchQuery) return components
    const query = searchQuery.toLowerCase()
    return components.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [components, searchQuery])

  if (filteredComponents.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
        {title} ({filteredComponents.length})
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {filteredComponents.map(component => (
          <DraggableComponent key={component.type} component={component} />
        ))}
      </div>
    </div>
  )
}

interface ComponentPanelProps {
  elements: Element[]
  selectedElementId: string | null
  onSelect: (id: string | null) => void
}

export function ComponentPanel({ elements, selectedElementId, onSelect }: ComponentPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('components')

  // 计算匹配的组件数量
  const systemMatchCount = useMemo(() => {
    if (!searchQuery) return systemComponents.length
    const query = searchQuery.toLowerCase()
    return systemComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    ).length
  }, [searchQuery])

  const customMatchCount = useMemo(() => {
    if (!searchQuery) return customComponents.length
    const query = searchQuery.toLowerCase()
    return customComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    ).length
  }, [searchQuery])

  const totalMatchCount = systemMatchCount + customMatchCount

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 space-y-2">
          <TabsList className="w-full">
            <TabsTrigger value="components" className="flex-1">
              组件库
            </TabsTrigger>
            <TabsTrigger value="elements" className="flex-1">
              模块列表
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'components' && (
            <TabsContent value="components" className="mt-0 flex-1 flex flex-col overflow-hidden">
              {/* 搜索框 */}
              <div className="px-4 pt-4 pb-2 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索组件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    aria-label="清除搜索"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="text-xs text-gray-500 mt-1">
                  {totalMatchCount > 0 ? `找到 ${totalMatchCount} 个组件` : '未找到匹配的组件'}
                </div>
              )}
            </div>

            {/* 组件列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              {customComponents.length > 0 && (
                <ComponentGroup
                  title="自定义组件"
                  components={customComponents}
                  searchQuery={searchQuery}
                />
              )}
              <ComponentGroup
                title="系统组件"
                components={systemComponents}
                searchQuery={searchQuery}
              />
              {searchQuery && totalMatchCount === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">未找到匹配的组件</p>
                  <p className="text-xs mt-1">尝试使用其他关键词搜索</p>
                </div>
              )}
            </div>
            </TabsContent>
          )}

          {activeTab === 'elements' && (
            <TabsContent value="elements" className="mt-0 flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <ElementList
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelect={onSelect}
                />
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}

