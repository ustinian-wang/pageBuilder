'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ComponentPanel } from '@/components/builder/ComponentPanel'
import { Canvas } from '@/components/builder/Canvas'
import { PropertyPanel } from '@/components/builder/PropertyPanel'
import { CodeViewer } from '@/components/builder/CodeViewer'
import { ActionMenu } from '@/components/builder/ActionMenu'
import { Element, ElementType } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { useHistory } from '@/hooks/useHistory'

const STORAGE_KEY = 'pageBuilder_currentPage'

export default function BuilderPage() {
  const searchParams = useSearchParams()
  const [elements, setElements] = useState<Element[]>([])
  const [selectedElementId, setSelectedElementIdState] = useState<string | null>(null)
  const prevSelectedElementIdRef = useRef<string | null>(null)
  
  // 包装 setSelectedElementId 以添加日志
  const setSelectedElementId = useCallback((id: string | null) => {
    const oldValue = prevSelectedElementIdRef.current
    console.log('[页面状态] setSelectedElementId 被调用, 新值:', id, '旧值:', oldValue)
    prevSelectedElementIdRef.current = id
    setSelectedElementIdState(id)
  }, [])
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
  
  // 历史记录管理
  const history = useHistory<Element[]>([])
  const isRestoringFromHistory = useRef(false) // 标记是否正在从历史记录恢复
  
  // 同步 elements 到历史记录（只在需要记录历史时调用）
  const updateElementsWithHistory = useCallback((newElements: Element[]) => {
    if (!isRestoringFromHistory.current) {
      setElements(newElements)
      history.push(newElements)
    }
  }, [history])

  // 递归查找元素的辅助函数
  const findElementById = (elements: Element[], id: string): Element | null => {
    console.log('[页面状态] findElementById 开始查找, id:', id, 'elements count:', elements.length)
    for (const el of elements) {
      if (el.id === id) {
        console.log('[页面状态] findElementById 找到元素:', { id: el.id, type: el.type })
        return el
      }
      if (el.children) {
        const found = findElementById(el.children, id)
        if (found) {
          console.log('[页面状态] findElementById 在子元素中找到:', { id: found.id, type: found.type })
          return found
        }
      }
    }
    console.warn('[页面状态] findElementById 未找到元素, id:', id)
    return null
  }

  // 递归查找选中的元素（支持嵌套元素）
  const selectedElement = useMemo(() => {
    console.log('[页面状态] 计算 selectedElement, selectedElementId:', selectedElementId, 'elements count:', elements.length)
    const result = selectedElementId 
      ? findElementById(elements, selectedElementId)
      : null
    console.log('[页面状态] selectedElement 计算结果:', result ? { id: result.id, type: result.type } : null)
    return result
  }, [selectedElementId, elements])

  // 日志：追踪 selectedElementId 和 selectedElement 的变化
  useEffect(() => {
    console.log('[页面状态] selectedElementId 变化:', selectedElementId)
    console.log('[页面状态] selectedElement:', selectedElement ? { id: selectedElement.id, type: selectedElement.type } : null)
  }, [selectedElementId, selectedElement])

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
        const loadedElements = result.data.elements || []
        setPageId(result.data.id)
        setPageName(result.data.name || '未命名页面')
        setElements(loadedElements)
        setSelectedElementId(null)
        // 重置历史记录
        history.reset(loadedElements)
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
        const emptyElements: Element[] = []
        setPageId(result.data.id)
        setPageName(newPageName)
        setElements(emptyElements)
        setSelectedElementId(null)
        // 重置历史记录
        history.reset(emptyElements)
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
        const emptyElements: Element[] = []
        setPageId(null)
        setPageName('未命名页面')
        setElements(emptyElements)
        // 重置历史记录
        history.reset(emptyElements)
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
    } else if (event.active.data.current?.type === 'element') {
      // 画布上元素的拖拽预览
      const element = event.active.data.current.element as Element
      setActiveDragComponent({
        type: element.type,
        label: element.props?.label || element.type,
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
        updateElementsWithHistory([...elements, newElement])
      } else {
        // 检查是否是拖拽到 tab 内容区域
        const tabContentMatch = String(over.id).match(/^tab-content-(.+)-(.+)$/)
        if (tabContentMatch) {
          const [, tabsElementId, tabKey] = tabContentMatch
          console.log('[拖拽] 拖拽到 tab content:', { tabsElementId, tabKey, newElement, overId: over.id })
          
          const updateTabsItemsRecursive = (els: Element[], targetId: string, targetTabKey: string, newEl: Element): Element[] => {
            return els.map(el => {
              if (el.id === targetId && el.props?.items) {
                console.log('[拖拽] 找到目标 tabs element:', el.id, 'items count:', el.props.items.length)
                // 创建新的 items 数组，确保引用变化
                const updatedItems = el.props.items.map((item: any) => {
                  if (item.key === targetTabKey) {
                    const oldChildrenCount = Array.isArray(item.children) ? item.children.length : 0
                    const newChildren = Array.isArray(item.children) 
                      ? [...item.children, newEl]
                      : [newEl]
                    console.log('[拖拽] 更新 tab item:', { 
                      tabKey, 
                      oldChildrenCount, 
                      newChildrenCount: newChildren.length,
                      newElementId: newEl.id 
                    })
                    // 创建新的 item 对象，确保引用变化
                    return {
                      ...item,
                      children: newChildren,
                    }
                  }
                  // 即使不匹配，也返回新对象以确保引用变化
                  return { ...item }
                })
                // 创建新的 element 对象，确保引用变化
                const updatedElement: Element = {
                  ...el,
                  props: {
                    ...el.props,
                    items: updatedItems,
                  },
                }
                console.log('[拖拽] 更新后的 tabs element:', {
                  id: updatedElement.id,
                  itemsCount: updatedElement.props.items?.length,
                  firstItemChildrenCount: updatedElement.props.items?.[0]?.children?.length
                })
                return updatedElement
              }
              if (el.children) {
                return {
                  ...el,
                  children: updateTabsItemsRecursive(el.children, targetId, targetTabKey, newEl),
                }
              }
              return el
            })
          }
          
          // 确保创建新的数组引用
          const updatedElements = [...updateTabsItemsRecursive(elements, tabsElementId, tabKey, newElement)]
          console.log('[拖拽] 调用 updateElementsWithHistory，更新 elements，数量:', updatedElements.length)
          console.log('[拖拽] 更新后的完整 elements:', JSON.stringify(updatedElements, null, 2))
          updateElementsWithHistory(updatedElements)
        } else {
          // 拖放到现有元素内
          const targetElement = findElementById(elements, over.id as string)
          if (targetElement) {
            const newElements = addElementToParentInternal(elements, targetElement.id, newElement)
            updateElementsWithHistory(newElements)
          }
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
        updateElementsWithHistory([...elements, newElement])
      } else {
        // 检查是否是拖拽到 tab 内容区域
        const tabContentMatch = String(over.id).match(/^tab-content-(.+)-(.+)$/)
        if (tabContentMatch) {
          const [, tabsElementId, tabKey] = tabContentMatch
          
          const updateTabsItemsRecursive = (els: Element[], targetId: string, targetTabKey: string, newEl: Element): Element[] => {
            return els.map(el => {
              if (el.id === targetId && el.props?.items) {
                const updatedItems = el.props.items.map((item: any) => {
                  if (item.key === targetTabKey) {
                    return {
                      ...item,
                      children: Array.isArray(item.children) 
                        ? [...item.children, newEl]
                        : [newEl],
                    }
                  }
                  return item
                })
                return {
                  ...el,
                  props: {
                    ...el.props,
                    items: updatedItems,
                  },
                }
              }
              if (el.children) {
                return {
                  ...el,
                  children: updateTabsItemsRecursive(el.children, targetId, targetTabKey, newEl),
                }
              }
              return el
            })
          }
          
          const updatedElements = updateTabsItemsRecursive(elements, tabsElementId, tabKey, newElement)
          updateElementsWithHistory(updatedElements)
        } else {
          // 拖放到现有元素内
          const targetElement = findElementById(elements, over.id as string)
          if (targetElement) {
            const newElements = addElementToParentInternal(elements, targetElement.id, newElement)
            updateElementsWithHistory(newElements)
          }
        }
      }
    }

    // 如果是拖拽画布上的元素
    if (active.data.current?.type === 'element') {
      const draggedElement = active.data.current.element as Element
      const draggedElementId = draggedElement.id

      // 防止将元素拖到自己或子元素中
      const isDescendant = (parentId: string, childId: string): boolean => {
        const parent = findElementById(elements, parentId)
        if (!parent) return false
        
        const checkChildren = (el: Element): boolean => {
          if (el.id === childId) return true
          if (el.children) {
            return el.children.some(checkChildren)
          }
          return false
        }
        
        return checkChildren(parent)
      }

      if (over.id === draggedElementId || isDescendant(draggedElementId, over.id as string)) {
        // 不能拖到自己或子元素中
        return
      }

      // 从原位置移除元素
      const removeElement = (els: Element[]): Element[] => {
        return els
          .filter(el => el.id !== draggedElementId)
          .map(el => ({
            ...el,
            children: el.children ? removeElement(el.children) : undefined,
          }))
      }

      // 如果拖放到画布根节点
      if (over.id === 'canvas-root') {
        const updatedElements = removeElement(elements)
        updateElementsWithHistory([...updatedElements, draggedElement])
        setSelectedElementId(draggedElement.id)
        return
      }

      // 检查是否是拖拽到 tab 内容区域
      const tabContentMatch = String(over.id).match(/^tab-content-(.+)-(.+)$/)
      if (tabContentMatch) {
        // 拖放到 tab 内容区域
        const [, tabsElementId, tabKey] = tabContentMatch
        const tabsElement = findElementById(elements, tabsElementId)
        
        if (tabsElement && tabsElement.props?.items) {
          // 先移除元素
          const elementsWithoutDragged = removeElement(elements)
          
          // 更新 tabs 的 items，添加元素到对应的 tab
          const updateTabs = (els: Element[]): Element[] => {
            return els.map(el => {
              if (el.id === tabsElementId && el.props?.items) {
                const updatedItems = el.props.items.map((item: any) => {
                  if (item.key === tabKey) {
                    return {
                      ...item,
                      children: Array.isArray(item.children) 
                        ? [...item.children, draggedElement]
                        : [draggedElement],
                    }
                  }
                  return item
                })
                return {
                  ...el,
                  props: {
                    ...el.props,
                    items: updatedItems,
                  },
                }
              }
              if (el.children) {
                return {
                  ...el,
                  children: updateTabs(el.children),
                }
              }
              return el
            })
          }
          
          const updatedElements = updateTabs(elementsWithoutDragged)
          updateElementsWithHistory(updatedElements)
          setSelectedElementId(draggedElement.id)
          return
        }
      }
      
      // 拖放到其他元素内
      const targetElement = findElementById(elements, over.id as string)
      if (targetElement) {
        // 先移除元素
        const elementsWithoutDragged = removeElement(elements)
        
        // 然后添加到目标元素
        const addToTarget = (els: Element[]): Element[] => {
          return els.map(el => {
            if (el.id === targetElement.id) {
              return {
                ...el,
                children: [...(el.children || []), draggedElement],
              }
            }
            if (el.children) {
              return {
                ...el,
                children: addToTarget(el.children),
              }
            }
            return el
          })
        }

        const updatedElements = addToTarget(elementsWithoutDragged)
        updateElementsWithHistory(updatedElements)
        setSelectedElementId(draggedElement.id)
      }
    }
  }

  // 内部辅助函数：添加元素到父元素（不更新历史记录）
  const addElementToParentInternal = (elements: Element[], parentId: string, newElement: Element): Element[] => {
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

    return elements.map(updateElement)
  }

  const updateElement = (id: string, updates: Partial<Element>) => {
    const updateElementById = (el: Element): Element => {
      if (el.id === id) {
        // 如果 updates 包含 props，需要合并 props 而不是替换
        if (updates.props && el.props) {
          return { 
            ...el, 
            ...updates,
            props: {
              ...el.props,
              ...updates.props,
            }
          }
        }
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

    const newElements = elements.map(updateElementById)
    updateElementsWithHistory(newElements)
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

    const newElements = removeElement(elements)
    updateElementsWithHistory(newElements)
    if (selectedElementId === id) {
      setSelectedElementId(null)
    }
  }

  const copyElement = (element: Element) => {
    // 深拷贝元素并生成新ID
    const cloneElement = (el: Element): Element => {
      const newId = generateId()
      return {
        ...el,
        id: newId,
        children: el.children ? el.children.map(cloneElement) : undefined,
      }
    }
    const clonedElement = cloneElement(element)
    
    // 查找元素在树中的位置并插入副本
    const insertCopy = (els: Element[]): Element[] => {
      const result: Element[] = []
      let found = false
      
      for (let i = 0; i < els.length; i++) {
        result.push(els[i])
        
        if (els[i].id === element.id) {
          // 找到元素，在同一父级下插入副本
          result.push(clonedElement)
          found = true
        } else if (els[i].children) {
          // 递归处理子元素
          const updatedChildren = insertCopy(els[i].children!)
          if (updatedChildren !== els[i].children) {
            result[result.length - 1] = {
              ...els[i],
              children: updatedChildren,
            }
            found = true
          }
        }
      }
      
      return found ? result : els
    }
    
    const newElements = insertCopy(elements)
    updateElementsWithHistory(newElements)
    // 选中新复制的元素
    setSelectedElementId(clonedElement.id)
  }

  // 撤销操作
  const handleUndo = useCallback(() => {
    if (history.canUndo) {
      isRestoringFromHistory.current = true
      const previousElements = history.undo()
      if (previousElements) {
        setElements(previousElements)
      }
      // 使用 setTimeout 确保状态更新完成后再重置标志
      setTimeout(() => {
        isRestoringFromHistory.current = false
      }, 0)
    }
  }, [history])

  // 重做操作
  const handleRedo = useCallback(() => {
    if (history.canRedo) {
      isRestoringFromHistory.current = true
      const nextElements = history.redo()
      if (nextElements) {
        setElements(nextElements)
      }
      // 使用 setTimeout 确保状态更新完成后再重置标志
      setTimeout(() => {
        isRestoringFromHistory.current = false
      }, 0)
    }
  }, [history])

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在输入框中，不处理快捷键
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      
      // Ctrl+Z 或 Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      // Ctrl+Y 或 Ctrl+Shift+Z 或 Cmd+Shift+Z (Mac) 重做
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleUndo, handleRedo])

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
          onClick={() => {
            if (pageId) {
              window.open(`/builder/preview?id=${pageId}`, '_blank')
            } else {
              // 如果没有保存的页面，先提示保存
              alert('请先保存页面后再预览')
            }
          }}
          disabled={!pageId}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          预览
        </button>
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
          <div className="flex-1 overflow-auto bg-gray-100 p-8 relative">
            <ActionMenu
              canUndo={history.canUndo}
              canRedo={history.canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
            <Canvas
              elements={elements}
              selectedElementId={selectedElementId}
              onSelect={setSelectedElementId}
              onUpdate={updateElement}
              onDelete={deleteElement}
              onCopy={copyElement}
            />
          </div>

          {/* 右侧属性面板 */}
          <PropertyPanel
            element={selectedElement}
            onUpdate={(updates) => {
              console.log('[属性面板] onUpdate 回调触发, selectedElementId:', selectedElementId, 'selectedElement:', selectedElement ? { id: selectedElement.id } : null, 'updates:', updates)
              if (selectedElementId) {
                updateElement(selectedElementId, updates)
              } else {
                console.warn('[属性面板] onUpdate 被调用但 selectedElementId 为 null')
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
  const defaults: Record<string, Record<string, any>> = {
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
    // Ant Design 组件默认属性
    'a-button': { text: 'Button', type: 'default' },
    'a-input': { placeholder: '请输入' },
    'a-card': { title: 'Card Title' },
    'a-form': {},
    'a-select': { placeholder: '请选择' },
    'a-datepicker': {},
    'a-radio': { label: 'Radio' },
    'a-checkbox': { label: 'Checkbox' },
    'a-switch': {},
    'a-slider': {},
    'a-rate': {},
    'a-tag': { text: 'Tag' },
    'a-badge': { count: 0 },
    'a-avatar': {},
    'a-divider': {},
    'a-space': {},
    'a-row': {},
    'a-col': { span: 12 },
    'a-layout': {},
    'a-menu': {},
    'a-tabs': { items: [] },
    'a-collapse': {},
    'a-timeline': {},
    'a-list': {},
    'a-empty': {},
    'a-spin': {},
    'a-alert': { message: 'Alert', type: 'info' },
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

