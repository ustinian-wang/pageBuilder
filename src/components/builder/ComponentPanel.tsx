'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { ElementType, Element, ComponentDefinition, CustomModule } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { ElementList } from './ElementList'
import { ElementRenderer } from './ElementRenderer'

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

// 自定义组件（从数据库加载）

function DraggableComponent({ component, onPreview }: { component: ComponentDefinition; onPreview?: (component: ComponentDefinition) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `component-${component.type}`,
    data: {
      type: component.category === 'custom' ? 'custom-module' : 'component',
      componentType: component.type,
      elementData: component.elementData, // 自定义模块的元素数据
      moduleId: component.moduleId, // 自定义模块的ID
    },
  })

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPreview && component.category === 'custom') {
      onPreview(component)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        p-3 bg-white border border-gray-200 rounded
        hover:border-blue-400 hover:shadow-md transition-all
        ${isDragging ? 'opacity-30' : ''}
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
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handlePreview}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="预览"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
            <div
              {...listeners}
              {...attributes}
              className="p-1 cursor-move"
              title="拖拽"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
              自定义
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function ComponentGroup({
  title,
  components,
  searchQuery,
  onPreview,
}: {
  title: string
  components: ComponentDefinition[]
  searchQuery: string
  onPreview?: (component: ComponentDefinition) => void
}) {
  // 过滤匹配的组件
  const filteredComponents = useMemo(() => {
    if (!searchQuery) return components
    const query = searchQuery.toLowerCase()
    return components.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toString().toLowerCase().includes(query)
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
          <DraggableComponent key={component.type} component={component} onPreview={onPreview} />
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
  const [customComponents, setCustomComponents] = useState<ComponentDefinition[]>([])
  const [previewComponent, setPreviewComponent] = useState<ComponentDefinition | null>(null)

  // 加载自定义模块
  useEffect(() => {
    const loadCustomModules = async () => {
      try {
        const response = await fetch('/api/modules')
        const result = await response.json()
        if (result.success) {
          const modules = result.data as CustomModule[]
          const componentDefs: ComponentDefinition[] = modules.map(module => ({
            type: module.name, // 使用模块名称作为类型
            label: module.label,
            icon: module.icon,
            category: 'custom',
            description: module.description,
            elementData: module.element, // 保存完整的元素数据
            moduleId: module.id, // 保存模块ID
          }))
          setCustomComponents(componentDefs)
        }
      } catch (error) {
        console.error('加载自定义模块失败:', error)
      }
    }

    loadCustomModules()

    // 监听自定义模块保存事件
    const handleModuleSaved = () => {
      loadCustomModules()
    }
    window.addEventListener('customModuleSaved', handleModuleSaved)
    return () => {
      window.removeEventListener('customModuleSaved', handleModuleSaved)
    }
  }, [])

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
      (comp: ComponentDefinition) =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toString().toLowerCase().includes(query)
    ).length
  }, [searchQuery, customComponents])

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
                  onPreview={setPreviewComponent}
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
      
      {/* 预览对话框 */}
      {previewComponent && previewComponent.elementData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[300] flex items-center justify-center p-4"
          onClick={() => setPreviewComponent(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {previewComponent.icon} {previewComponent.label}
                </h2>
                {previewComponent.description && (
                  <p className="text-sm text-gray-500 mt-1">{previewComponent.description}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewComponent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <ElementRenderer
                  element={previewComponent.elementData}
                  selectedElementId={null}
                  onSelect={() => {}}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

