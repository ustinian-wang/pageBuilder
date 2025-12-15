'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { ElementType, Element, ComponentDefinition, CustomModule } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { ElementList } from './ElementList'
import { ElementRenderer } from './ElementRenderer'
import { Tooltip } from 'antd'

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

// Ant Design 组件
const antdComponents: ComponentDefinition[] = [
  { type: 'a-button', label: 'Button', icon: '🔘', category: 'system', description: 'Ant Design 按钮' },
  { type: 'a-input', label: 'Input', icon: '📥', category: 'system', description: 'Ant Design 输入框' },
  { type: 'a-card', label: 'Card', icon: '🎴', category: 'system', description: 'Ant Design 卡片' },
  { type: 'a-form', label: 'Form', icon: '📋', category: 'system', description: 'Ant Design 表单' },
  { type: 'a-table', label: 'Table', icon: '📊', category: 'system', description: 'Ant Design 表格' },
  { type: 'a-select', label: 'Select', icon: '📋', category: 'system', description: 'Ant Design 选择器' },
  { type: 'a-datepicker', label: 'DatePicker', icon: '📅', category: 'system', description: 'Ant Design 日期选择器' },
  { type: 'a-radio', label: 'Radio', icon: '🔘', category: 'system', description: 'Ant Design 单选框' },
  { type: 'a-checkbox', label: 'Checkbox', icon: '☑️', category: 'system', description: 'Ant Design 复选框' },
  { type: 'a-switch', label: 'Switch', icon: '🔀', category: 'system', description: 'Ant Design 开关' },
  { type: 'a-slider', label: 'Slider', icon: '🎚️', category: 'system', description: 'Ant Design 滑动输入条' },
  { type: 'a-rate', label: 'Rate', icon: '⭐', category: 'system', description: 'Ant Design 评分' },
  { type: 'a-tag', label: 'Tag', icon: '🏷️', category: 'system', description: 'Ant Design 标签' },
  { type: 'a-badge', label: 'Badge', icon: '🔖', category: 'system', description: 'Ant Design 徽标数' },
  { type: 'a-avatar', label: 'Avatar', icon: '👤', category: 'system', description: 'Ant Design 头像' },
  { type: 'a-divider', label: 'Divider', icon: '➖', category: 'system', description: 'Ant Design 分割线' },
  { type: 'a-space', label: 'Space', icon: '↔️', category: 'system', description: 'Ant Design 间距' },
  { type: 'a-row', label: 'Row', icon: '➡️', category: 'system', description: 'Ant Design 行' },
  { type: 'a-col', label: 'Col', icon: '⬇️', category: 'system', description: 'Ant Design 列' },
  { type: 'a-layout', label: 'Layout', icon: '📐', category: 'system', description: 'Ant Design 布局' },
  { type: 'a-menu', label: 'Menu', icon: '📑', category: 'system', description: 'Ant Design 导航菜单' },
  { type: 'a-tabs', label: 'Tabs', icon: '📑', category: 'system', description: 'Ant Design 标签页' },
  { type: 'a-collapse', label: 'Collapse', icon: '📂', category: 'system', description: 'Ant Design 折叠面板' },
  { type: 'a-timeline', label: 'Timeline', icon: '⏱️', category: 'system', description: 'Ant Design 时间轴' },
  { type: 'a-list', label: 'List', icon: '📋', category: 'system', description: 'Ant Design 列表' },
  { type: 'a-empty', label: 'Empty', icon: '📭', category: 'system', description: 'Ant Design 空状态' },
  { type: 'a-spin', label: 'Spin', icon: '🌀', category: 'system', description: 'Ant Design 加载中' },
  { type: 'a-alert', label: 'Alert', icon: '⚠️', category: 'system', description: 'Ant Design 警告提示' },
]

// 自定义组件（从数据库加载）

function DraggableComponent({ 
  component, 
  onPreview,
  onEdit,
  onDelete
}: { 
  component: ComponentDefinition
  onPreview?: (component: ComponentDefinition) => void
  onEdit?: (component: ComponentDefinition) => void
  onDelete?: (component: ComponentDefinition) => void
}) {
  // 为自定义模块和系统组件生成不同的ID前缀，避免冲突
  const dragId = component.category === 'custom' 
    ? `custom-module-${component.type}` 
    : `component-${component.type}`
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
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
      {...(component.category === 'custom' ? { ...listeners, ...attributes } : { ...listeners, ...attributes })}
      className={`
        p-3 bg-white border border-gray-200 rounded
        hover:border-blue-400 hover:shadow-md transition-all
        ${isDragging ? 'opacity-30' : ''}
        cursor-move
      `}
      title={component.description}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl flex-shrink-0">{component.icon}</span>
        <div className="flex-1 min-w-0">
          <Tooltip title={component.label} placement="top">
            <div className="text-sm font-medium truncate">{component.label}</div>
          </Tooltip>
          {component.description && (
            <div className="text-xs text-gray-500 truncate mt-0.5">{component.description}</div>
          )}
        </div>
        {component.category === 'custom' && (
          <div 
            className="flex items-center gap-1 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={handlePreview}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="预览"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onEdit) {
                  onEdit(component)
                }
              }}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="编辑"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onDelete) {
                  onDelete(component)
                }
              }}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="删除"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
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
  onEdit,
  onDelete,
}: {
  title: string
  components: ComponentDefinition[]
  searchQuery: string
  onPreview?: (component: ComponentDefinition) => void
  onEdit?: (component: ComponentDefinition) => void
  onDelete?: (component: ComponentDefinition) => void
}) {
  // localStorage key 用于保存折叠状态
  const storageKey = `component-group-collapsed-${title}`
  
  // 从 localStorage 读取折叠状态，默认为展开（false）
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : false
  })

  // 保存折叠状态到 localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newState))
    }
  }

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

  // 如果有搜索结果，自动展开（不改变保存的状态，只是临时展开）
  const shouldShow = !isCollapsed || (searchQuery && filteredComponents.length > 0)

  if (filteredComponents.length === 0) return null

  return (
    <div className="mb-6">
      <button
        onClick={toggleCollapse}
        className="w-full flex items-center justify-between px-1 py-2 text-xs font-semibold text-gray-500 uppercase hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
      >
        <span>
          {title} ({filteredComponents.length})
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {shouldShow && (
        <div className="grid grid-cols-1 gap-2 mt-2">
          {filteredComponents.map(component => (
            <DraggableComponent 
              key={component.type} 
              component={component} 
              onPreview={onPreview}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ComponentPanelProps {
  elements: Element[]
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onDelete?: (id: string) => void
  onCopy?: (element: Element) => void
}

export function ComponentPanel({ elements, selectedElementId, onSelect, onDelete, onCopy }: ComponentPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('components')
  const [customComponents, setCustomComponents] = useState<ComponentDefinition[]>([])
  const [previewComponent, setPreviewComponent] = useState<ComponentDefinition | null>(null)
  const [editComponent, setEditComponent] = useState<ComponentDefinition | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteComponent, setDeleteComponent] = useState<ComponentDefinition | null>(null)
  const [deleting, setDeleting] = useState(false)

  // 加载自定义模块
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

  useEffect(() => {
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

  // 处理编辑
  const handleEdit = (component: ComponentDefinition) => {
    setEditComponent(component)
    setEditLabel(component.label)
    setEditIcon(component.icon)
    setEditDescription(component.description || '')
  }

  // 处理删除
  const handleDelete = (component: ComponentDefinition) => {
    setDeleteComponent(component)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deleteComponent || !deleteComponent.moduleId) {
      alert('无法删除：缺少模块ID')
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/modules/${deleteComponent.moduleId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('删除成功！')
        setDeleteComponent(null)
        // 重新加载自定义模块列表
        await loadCustomModules()
        // 触发自定义模块列表刷新
        window.dispatchEvent(new CustomEvent('customModuleSaved'))
      } else {
        alert(`删除失败：${result.error}`)
      }
    } catch (error: any) {
      console.error('删除失败:', error)
      alert(`删除失败：${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editComponent || !editComponent.moduleId) {
      alert('无法保存：缺少模块ID')
      return
    }

    if (!editLabel.trim()) {
      alert('请输入显示名称')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/modules/${editComponent.moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: editLabel.trim(),
          icon: editIcon.trim() || '📦',
          description: editDescription.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('保存成功！')
        setEditComponent(null)
        // 重新加载自定义模块列表
        await loadCustomModules()
        // 触发自定义模块列表刷新
        window.dispatchEvent(new CustomEvent('customModuleSaved'))
      } else {
        alert(`保存失败：${result.error}`)
      }
    } catch (error: any) {
      console.error('保存失败:', error)
      alert(`保存失败：${error.message}`)
    } finally {
      setSaving(false)
    }
  }

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

  const antdMatchCount = useMemo(() => {
    if (!searchQuery) return antdComponents.length
    const query = searchQuery.toLowerCase()
    return antdComponents.filter(
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

  const totalMatchCount = systemMatchCount + antdMatchCount + customMatchCount

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-gray-200 space-y-2 flex-shrink-0">
          <TabsList className="w-full">
            <TabsTrigger value="components" className="flex-1">
              组件库
            </TabsTrigger>
            <TabsTrigger value="elements" className="flex-1">
              模块列表
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {activeTab === 'components' && (
            <TabsContent value="components" className="mt-0 flex-1 flex flex-col overflow-hidden min-h-0">
              {/* 搜索框 */}
              <div className="px-4 pt-4 pb-2 border-b border-gray-200 flex-shrink-0">
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
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              <ComponentGroup
                title="系统组件"
                components={systemComponents}
                searchQuery={searchQuery}
              />
              <ComponentGroup
                title="Ant Design 组件"
                components={antdComponents}
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
            <TabsContent value="elements" className="mt-0 flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto min-h-0">
                <ElementList
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onCopy={onCopy}
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

      {/* 编辑对话框 */}
      {editComponent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[300] flex items-center justify-center p-4"
          onClick={() => setEditComponent(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                编辑自定义组件
              </h2>
              <button
                onClick={() => setEditComponent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                disabled={saving}
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
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  显示名称 *
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 轮播图"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  图标
                </label>
                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 📦"
                />
                <p className="text-xs text-gray-500 mt-1">
                  可以使用 emoji 或文本
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述（可选）
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="组件描述"
                  rows={3}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>提示：</strong>要编辑组件的结构和样式，请在画布中选中该组件，然后使用属性面板进行编辑，最后使用右键菜单的&ldquo;保存&rdquo;功能更新模块。
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => setEditComponent(null)}
                disabled={saving}
              >
                取消
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                onClick={handleSaveEdit}
                disabled={saving || !editLabel.trim()}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteComponent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[300] flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteComponent(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                确认删除
              </h2>
              {!deleting && (
                <button
                  onClick={() => setDeleteComponent(null)}
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
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    确定要删除自定义组件 <strong className="text-gray-900">{deleteComponent.icon} {deleteComponent.label}</strong> 吗？
                  </p>
                  <p className="text-xs text-gray-500">
                    此操作无法撤销，删除后将无法在组件库中使用该组件。
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                onClick={() => setDeleteComponent(null)}
                disabled={deleting}
              >
                取消
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

