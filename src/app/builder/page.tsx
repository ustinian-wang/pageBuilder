'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ComponentPanel } from '@/components/builder/ComponentPanel'
import { Canvas } from '@/components/builder/Canvas'
import { PropertyPanel } from '@/components/builder/PropertyPanel'
import { CodeViewer } from '@/components/builder/CodeViewer'
import { Element, ElementType } from '@/lib/types'
import { generateId } from '@/lib/utils'

export default function BuilderPage() {
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeDragComponent, setActiveDragComponent] = useState<{ type: ElementType; label: string; icon: string } | null>(null)
  const [pageName, setPageName] = useState('未命名页面')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [generatedComponentName, setGeneratedComponentName] = useState<string>('')

  const selectedElement = elements.find(el => el.id === selectedElementId)

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    // 如果是从组件面板拖拽的组件，记录组件信息用于显示预览
    if (event.active.data.current?.type === 'component') {
      const componentType = event.active.data.current.componentType as ElementType
      const componentInfo = getComponentInfo(componentType)
      setActiveDragComponent(componentInfo)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    setActiveDragComponent(null)
    const { active, over } = event

    if (!over) return

    // 如果是从组件面板拖拽新组件
    if (active.data.current?.type === 'component') {
      const componentType = active.data.current.componentType as Element['type']
      const newElement: Element = {
        id: generateId(),
        type: componentType,
        props: getDefaultProps(componentType),
      }

      // 如果拖放到画布根节点
      if (over.id === 'canvas-root') {
        setElements([...elements, newElement])
      } else {
        // 拖放到现有元素内
        const targetElement = findElementById(elements, over.id as string)
        if (targetElement) {
          addElementToParent(elements, targetElement.id, newElement)
        }
      }
    }

    // 如果是重新排序
    if (active.data.current?.type === 'element') {
      // 这里可以实现元素排序逻辑
    }
  }

  const findElementById = (elements: Element[], id: string): Element | null => {
    for (const el of elements) {
      if (el.id === id) return el
      if (el.children) {
        const found = findElementById(el.children, id)
        if (found) return found
      }
    }
    return null
  }

  const addElementToParent = (elements: Element[], parentId: string, newElement: Element) => {
    const updateElement = (el: Element): Element => {
      if (el.id === parentId) {
        return {
          ...el,
          children: [...(el.children || []), newElement],
        }
      }
      if (el.children) {
        return {
          ...el,
          children: el.children.map(updateElement),
        }
      }
      return el
    }

    setElements(elements.map(updateElement))
  }

  const updateElement = (id: string, updates: Partial<Element>) => {
    const updateElementById = (el: Element): Element => {
      if (el.id === id) {
        return { ...el, ...updates }
      }
      if (el.children) {
        return {
          ...el,
          children: el.children.map(updateElementById),
        }
      }
      return el
    }

    setElements(elements.map(updateElementById))
  }

  const deleteElement = (id: string) => {
    const removeElement = (els: Element[]): Element[] => {
      return els
        .filter(el => el.id !== id)
        .map(el => ({
          ...el,
          children: el.children ? removeElement(el.children) : undefined,
        }))
    }

    setElements(removeElement(elements))
    if (selectedElementId === id) {
      setSelectedElementId(null)
    }
  }

  const handleSave = async () => {
    if (elements.length === 0) {
      alert('请先添加一些组件')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: pageName,
          elements,
        }),
      })

      const result = await response.json()
      if (result.success) {
        alert('保存成功！')
      } else {
        alert('保存失败：' + result.error)
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请检查网络连接')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateCode = async () => {
    if (elements.length === 0) {
      alert('请先添加一些组件')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements,
          componentName: pageName.replace(/\s+/g, '') || 'GeneratedPage',
        }),
      })

      const result = await response.json()
      if (result.success) {
        setGeneratedCode(result.data.code)
        setGeneratedComponentName(result.data.componentName)
      } else {
        alert('生成代码失败：' + result.error)
      }
    } catch (error) {
      console.error('生成代码失败:', error)
      alert('生成代码失败，请检查网络连接')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
        <h1 className="text-lg font-semibold">页面构建器</h1>
        <input
          type="text"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
          placeholder="页面名称"
        />
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          onClick={handleGenerateCode}
          disabled={generating}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? '生成中...' : '生成代码'}
        </button>
      </div>

      {/* 主编辑区 */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* 左侧组件面板 */}
          <ComponentPanel
            elements={elements}
            selectedElementId={selectedElementId}
            onSelect={setSelectedElementId}
          />

          {/* 中间画布 */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <Canvas
              elements={elements}
              selectedElementId={selectedElementId}
              onSelect={setSelectedElementId}
              onUpdate={updateElement}
              onDelete={deleteElement}
            />
          </div>

          {/* 右侧属性面板 */}
          <PropertyPanel
            element={selectedElement}
            onUpdate={(updates) => {
              if (selectedElementId) {
                updateElement(selectedElementId, updates)
              }
            }}
          />

          {/* 拖拽预览层 - 使用 DragOverlay 避免被 overflow 隐藏 */}
          <DragOverlay style={{ opacity: 0.9 }}>
            {activeDragComponent ? (
              <div className="p-3 bg-white border-2 border-blue-500 rounded-lg shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeDragComponent.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{activeDragComponent.label}</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 代码查看器弹窗 */}
      {generatedCode && (
        <CodeViewer
          code={generatedCode}
          componentName={generatedComponentName}
          onClose={() => setGeneratedCode(null)}
        />
      )}
    </div>
  )
}

function getDefaultProps(type: Element['type']): Record<string, any> {
  const defaults: Record<Element['type'], Record<string, any>> = {
    container: {},
    text: { text: '文本' },
    button: { text: '按钮', variant: 'primary' },
    input: { placeholder: '请输入' },
    image: { src: '', alt: '图片' },
    card: {},
    divider: {},
    heading: { text: '标题', level: 1 },
    paragraph: { text: '段落文本' },
    list: { items: ['项目1', '项目2'], ordered: false },
    form: {},
  }
  return defaults[type] || {}
}

function getComponentInfo(type: ElementType): { type: ElementType; label: string; icon: string } {
  const componentMap: Record<ElementType, { label: string; icon: string }> = {
    container: { label: '容器', icon: '📦' },
    text: { label: '文本', icon: '📝' },
    button: { label: '按钮', icon: '🔘' },
    input: { label: '输入框', icon: '📥' },
    image: { label: '图片', icon: '🖼️' },
    card: { label: '卡片', icon: '🎴' },
    divider: { label: '分割线', icon: '➖' },
    heading: { label: '标题', icon: '📌' },
    paragraph: { label: '段落', icon: '📄' },
    list: { label: '列表', icon: '📋' },
    form: { label: '表单', icon: '📋' },
  }
  return { type, ...componentMap[type] }
}

