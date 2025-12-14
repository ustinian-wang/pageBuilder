'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ComponentPanel } from '@/components/builder/ComponentPanel'
import { Canvas } from '@/components/builder/Canvas'
import { PropertyPanel } from '@/components/builder/PropertyPanel'
import { Element } from '@/lib/types'
import { generateId } from '@/lib/utils'

export default function BuilderPage() {
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pageName, setPageName] = useState('未命名页面')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const selectedElement = elements.find(el => el.id === selectedElementId)

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
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
        // 在新窗口中显示代码
        const codeWindow = window.open('', '_blank')
        if (codeWindow) {
          codeWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>生成的 Vue 组件代码</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
                pre { background: #252526; padding: 20px; border-radius: 8px; overflow-x: auto; }
                code { font-size: 14px; line-height: 1.6; }
              </style>
            </head>
            <body>
              <h2>生成的 Vue 组件代码</h2>
              <pre><code>${escapeHtml(result.data.code)}</code></pre>
            </body>
            </html>
          `)
        }
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

  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
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
          <ComponentPanel />

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
        </DndContext>
      </div>
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

