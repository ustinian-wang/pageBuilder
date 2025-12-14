'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ComponentPanel } from '@/components/builder/ComponentPanel'
import { Canvas } from '@/components/builder/Canvas'
import { PropertyPanel } from '@/components/builder/PropertyPanel'
import { CodeViewer } from '@/components/builder/CodeViewer'
import { Element, ElementType } from '@/lib/types'
import { generateId } from '@/lib/utils'

const STORAGE_KEY = 'pageBuilder_currentPage'

export default function BuilderPage() {
  const searchParams = useSearchParams()
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeDragComponent, setActiveDragComponent] = useState<{ type: ElementType; label: string; icon: string } | null>(null)
  const [pageName, setPageName] = useState('未命名页面')
  const [pageId, setPageId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [generatedComponentName, setGeneratedComponentName] = useState<string>('')
  const [pages, setPages] = useState<Array<{ id: string; name: string; updatedAt: number }>>([])
  const [showPageList, setShowPageList] = useState(false)
  const [creatingNewPage, setCreatingNewPage] = useState(false)

  // 递归查找元素的辅助函数
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

  // 递归查找选中的元素（支持嵌套元素）
  const selectedElement = selectedElementId 
    ? findElementById(elements, selectedElementId)
    : null

  // 加载页面列表
  const loadPages = async () => {
    try {
      const response = await fetch('/api/pages')
      const result = await response.json()
      if (result.success && result.data) {
        setPages(result.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          updatedAt: p.updatedAt,
        })).sort((a: any, b: any) => b.updatedAt - a.updatedAt))
      }
    } catch (error) {
      console.error('加载页面列表失败:', error)
    }
  }

  // 加载指定页面
  const loadPage = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pages/${id}`)
      const result = await response.json()
      if (result.success && result.data) {
        setPageId(result.data.id)
        setPageName(result.data.name || '未命名页面')
        setElements(result.data.elements || [])
        setSelectedElementId(null)
        // 更新URL（不刷新页面）
        window.history.pushState({}, '', `/builder/page?id=${id}`)
      }
    } catch (error) {
      console.error('加载页面失败:', error)
      alert('加载页面失败')
    } finally {
      setLoading(false)
    }
  }

  // 创建新页面
  const handleCreateNewPage = async () => {
    setCreatingNewPage(true)
    try {
      const newPageName = `新页面 ${new Date().toLocaleString()}`
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPageName,
          elements: [],
        }),
      })

      const result = await response.json()
      if (result.success && result.data) {
        setPageId(result.data.id)
        setPageName(newPageName)
        setElements([])
        setSelectedElementId(null)
        await loadPages()
        // 更新URL
        window.history.pushState({}, '', `/builder/page?id=${result.data.id}`)
      } else {
        alert('创建页面失败：' + result.error)
      }
    } catch (error) {
      console.error('创建页面失败:', error)
      alert('创建页面失败，请检查网络连接')
    } finally {
      setCreatingNewPage(false)
      setShowPageList(false)
    }
  }

  // 页面加载时，尝试从URL参数或localStorage恢复页面
  useEffect(() => {
    const initPage = async () => {
      setLoading(true)
      // 先加载页面列表
      await loadPages()
      
      try {
        // 优先从URL参数加载
        const urlPageId = searchParams.get('id')
        if (urlPageId) {
          await loadPage(urlPageId)
          return
        }

        // 如果没有URL参数，尝试从localStorage恢复
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData)
            if (parsed.pageId && parsed.elements && Array.isArray(parsed.elements)) {
              // 尝试从后端加载
              await loadPage(parsed.pageId)
              return
            }
          } catch (e) {
            console.error('解析localStorage数据失败:', e)
          }
        }

        // 如果都没有，创建一个新页面
        setPageId(null)
        setPageName('未命名页面')
        setElements([])
      } catch (error) {
        console.error('初始化页面失败:', error)
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [searchParams])

  // 自动保存到localStorage（作为备份）
  useEffect(() => {
    if (!loading) {
      const dataToSave = {
        pageId,
        pageName,
        elements,
        savedAt: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    }
  }, [elements, pageName, pageId, loading])

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    // 如果是从组件面板拖拽的组件，记录组件信息用于显示预览
    if (event.active.data.current?.type === 'component') {
      const componentType = event.active.data.current.componentType as ElementType
      const componentInfo = getComponentInfo(componentType)
      setActiveDragComponent(componentInfo)
    } else if (event.active.data.current?.type === 'custom-module') {
      // 自定义模块的预览
      const elementData = event.active.data.current.elementData as Element
      setActiveDragComponent({
        type: elementData.type,
        label: elementData.props?.label || elementData.type,
        icon: '📦',
      })
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

    // 如果是从组件面板拖拽自定义模块
    if (active.data.current?.type === 'custom-module') {
      const elementData = active.data.current.elementData as Element
      const moduleId = active.data.current.moduleId as string | undefined
      // 深拷贝元素并生成新ID，但保留moduleId
      const cloneElement = (el: Element): Element => {
        const newId = generateId()
        return {
          ...el,
          id: newId,
          moduleId: el.moduleId || moduleId, // 保留原有的moduleId或使用传入的moduleId
          children: el.children ? el.children.map(cloneElement) : undefined,
        }
      }
      const newElement = cloneElement(elementData)

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

    if (!pageName.trim()) {
      alert('请输入页面名称')
      return
    }

    setSaving(true)
    try {
      let response
      let result

      // 如果已有pageId，则更新；否则创建新页面
      if (pageId) {
        response = await fetch(`/api/pages/${pageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: pageName,
            elements,
          }),
        })
        result = await response.json()
        if (result.success) {
          alert('更新成功！')
          // 更新localStorage
          const dataToSave = {
            pageId,
            pageName,
            elements,
            savedAt: Date.now(),
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
          // 刷新页面列表
          await loadPages()
        }
      } else {
        response = await fetch('/api/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: pageName,
            elements,
          }),
        })
        result = await response.json()
      if (result.success && result.data) {
        setPageId(result.data.id)
        alert('保存成功！')
        // 更新localStorage
        const dataToSave = {
          pageId: result.data.id,
          pageName,
          elements,
          savedAt: Date.now(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
        // 刷新页面列表
        await loadPages()
        // 更新URL
        window.history.pushState({}, '', `/builder/page?id=${result.data.id}`)
      }
      }

      if (!result.success) {
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">加载中...</div>
          <div className="text-sm text-gray-400">正在恢复您的页面</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
        <h1 className="text-lg font-semibold">页面构建器</h1>
        
        {/* 页面选择下拉菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowPageList(!showPageList)}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-2 min-w-[200px] justify-between"
          >
            <span className="truncate">{pageName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showPageList && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPageList(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-gray-200">
                  <button
                    onClick={handleCreateNewPage}
                    disabled={creatingNewPage}
                    className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {creatingNewPage ? '创建中...' : '创建新页面'}
                  </button>
                </div>
                <div className="py-1">
                  {pages.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      暂无页面，点击上方创建新页面
                    </div>
                  ) : (
                    pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          loadPage(page.id)
                          setShowPageList(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                          page.id === pageId ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{page.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(page.updatedAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                        {page.id === pageId && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <input
          type="text"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-sm flex-1 max-w-xs"
          placeholder="页面名称"
        />
        
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : pageId ? '更新' : '保存'}
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

