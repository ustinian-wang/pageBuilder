'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Element, ElementType, ComponentDefinition } from '@/lib/types'
import { compositeModules } from '@/lib/composite-modules'
import { ComponentItem } from '../ComponentItem'
import { systemComponents, antdComponents, getDefaultProps } from './componentRegistry'
import { generateId } from '@/lib/utils'
import type { ChildRenderer } from './types'
import { PlusOutlined } from '@ant-design/icons'

interface TabContentRendererProps {
  elementId: string
  tabKey: string
  tabItem: any
  parentElement?: Element
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  onDelete: (id: string) => void
  onCopy?: (element: Element) => void
  contentPadding?: string
  childRenderer: ChildRenderer
}

export function TabContentRenderer({
  elementId,
  tabKey,
  tabItem,
  parentElement,
  selectedElementId,
  onSelect,
  onUpdate,
  onDelete,
  onCopy,
  contentPadding,
  childRenderer,
}: TabContentRendererProps) {
  const tabDroppableId = `tab-content-${elementId}-${tabKey}`
  const { setNodeRef: setTabDroppableRef, isOver: isTabOver } = useDroppable({
    id: tabDroppableId,
  })

  const [showComponentModal, setShowComponentModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customComponents, setCustomComponents] = useState<ComponentDefinition[]>([])
  const compositeComponents = useMemo(() => compositeModules, [])

  useEffect(() => {
    const loadCustomModules = async () => {
      try {
        const response = await fetch('/api/modules')
        const result = await response.json()
        if (result.success && result.data) {
          const modules = result.data.map((m: any) => ({
            type: m.name,
            label: m.label,
            icon: m.icon || '📦',
            description: m.description,
            elementData: m.element,
            moduleId: m.id,
            category: 'custom' as const,
          }))
          setCustomComponents(modules)
        }
      } catch (error) {
        console.error('加载自定义模块失败:', error)
      }
    }

    loadCustomModules()
    const handleModuleSaved = () => loadCustomModules()
    window.addEventListener('customModuleSaved', handleModuleSaved)
    return () => window.removeEventListener('customModuleSaved', handleModuleSaved)
  }, [])

  const filteredSystemComponents = useMemo(() => {
    if (!searchQuery) return systemComponents
    const query = searchQuery.toLowerCase()
    return systemComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const filteredAntdComponents = useMemo(() => {
    if (!searchQuery) return antdComponents
    const query = searchQuery.toLowerCase()
    return antdComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const filteredCompositeComponents = useMemo(() => {
    if (!searchQuery) return compositeComponents
    const query = searchQuery.toLowerCase()
    return compositeComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery, compositeComponents])

  const filteredCustomComponents = useMemo(() => {
    if (!searchQuery) return customComponents
    const query = searchQuery.toLowerCase()
    return customComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery, customComponents])

  const totalMatchCount =
    filteredSystemComponents.length +
    filteredAntdComponents.length +
    filteredCompositeComponents.length +
    filteredCustomComponents.length

  const handleAddComponent = (componentType: ElementType | string, elementData?: Element, moduleId?: string) => {
    let newElement: Element

    if (elementData) {
      const cloneElement = (el: Element): Element => {
        const newId = generateId()
        return {
          ...el,
          id: newId,
          moduleId: el.moduleId || moduleId,
          children: el.children ? el.children.map(cloneElement) : undefined,
        }
      }
      newElement = cloneElement(elementData)
    } else {
      newElement = {
        id: generateId(),
        type: componentType as ElementType,
        props: getDefaultProps(componentType as ElementType),
      }

      if (componentType === 'layout') {
        newElement.style = {
          display: 'flex',
          flexDirection: 'row',
          padding: '8px',
        }
        newElement.children = [
          { id: generateId(), type: 'container', props: {} },
          { id: generateId(), type: 'container', props: {} },
        ]
      }
    }

    const currentItems = (tabItem as any).__parentItems || []
    const updatedItems = currentItems.map((item: any) => {
      if (item.key === tabKey) {
        return {
          ...item,
          children: Array.isArray(item.children)
            ? [...item.children, newElement]
            : [newElement],
        }
      }
      return item
    })

    onUpdate(elementId, {
      props: {
        items: updatedItems,
      },
    })

    setShowComponentModal(false)
    setSearchQuery('')
  }

  const renderChild = (
    child: Element,
    overrides?: Partial<{ onUpdate: typeof onUpdate; onDelete: typeof onDelete; onCopy: typeof onCopy }>
  ) =>
    childRenderer(child, {
      onUpdate: overrides?.onUpdate,
      onDelete: overrides?.onDelete,
      onCopy: overrides?.onCopy,
      parentAutoFill: false,
    })

  const handleUpdateChild = (childId: string, updates: Partial<Element>) => {
    const currentItems = (tabItem as any).__parentItems || []
    const updatedItems = currentItems.map((item: any) => {
      if (item.key === tabKey && Array.isArray(item.children)) {
        return {
          ...item,
          children: item.children.map((c: Element) => (c.id === childId ? { ...c, ...updates } : c)),
        }
      }
      return item
    })
    onUpdate(elementId, {
      props: {
        items: updatedItems,
      },
    })
  }

  const handleDeleteChild = (childId: string) => {
    const removeElementFromArray = (els: Element[]): Element[] =>
      els
        .filter(el => el.id !== childId)
        .map(el => ({
          ...el,
          children: el.children ? removeElementFromArray(el.children) : undefined,
        }))

    const currentItems = parentElement?.props?.items || (tabItem as any).__parentItems || []
    const updatedItems = currentItems.map((item: any) => {
      if (item.key === tabKey && Array.isArray(item.children)) {
        const isElementArray = item.children.every(
          (child: any) => child && typeof child === 'object' && 'id' in child && 'type' in child
        )
        if (isElementArray) {
          return {
            ...item,
            children: removeElementFromArray(item.children),
          }
        }
        return {
          ...item,
          children: item.children.filter((c: any) => c?.id !== childId),
        }
      }
      return item
    })

    onUpdate(elementId, {
      props: {
        items: updatedItems,
      },
    })
  }

  const handleCopyChild = (copiedElement: Element) => {
    if (!onCopy) return

    const clone = (el: Element): Element => {
      const newId = generateId()
      return {
        ...el,
        id: newId,
        children: el.children ? el.children.map(child => clone(child)) : undefined,
      }
    }
    const clonedElement = clone(copiedElement)

    const currentItems = (tabItem as any).__parentItems || []
    const updatedItems = currentItems.map((item: any) => {
      if (item.key === tabKey && Array.isArray(item.children)) {
        return {
          ...item,
          children: [...item.children, clonedElement],
        }
      }
      return item
    })

    onUpdate(elementId, {
      props: {
        items: updatedItems,
      },
    })
  }

  const isElementChildrenArray = (children: any) =>
    Array.isArray(children) &&
    children.every((child: any) => child && typeof child === 'object' && 'id' in child && 'type' in child)

  const renderChildren = (children: Element[]) =>
    children.map(child =>
      renderChild(child, {
        onUpdate: handleUpdateChild,
        onDelete: handleDeleteChild,
        onCopy: handleCopyChild,
      })
    )

  const paddingStyle = contentPadding ? { padding: contentPadding } : { padding: '8px' }
  const hasElementArray = Array.isArray(tabItem.children) && isElementChildrenArray(tabItem.children)
  const textContent =
    typeof tabItem.children === 'string' || typeof tabItem.children === 'number'
      ? String(tabItem.children)
      : ''

  return (
    <div
      ref={setTabDroppableRef}
      className="relative min-h-[60px]"
      style={{
        minHeight: '60px',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        pointerEvents: 'auto',
        ...paddingStyle,
      }}
      onClick={e => {
        const target = e.target as HTMLElement
        const clickedElement = target.closest('[data-element-id]')
        if (!clickedElement || target === e.currentTarget) {
          e.stopPropagation()
        }
      }}
      onMouseDown={e => {
        const target = e.target as HTMLElement
        const clickedElement = target.closest('[data-element-id]')
        if (!clickedElement || target === e.currentTarget) {
          e.stopPropagation()
        }
      }}
      onContextMenu={e => {
        const target = e.target as HTMLElement
        const clickedElement = target.closest('[data-element-id]')
        if (!clickedElement || target === e.currentTarget) {
          e.stopPropagation()
        }
      }}
    >
      {hasElementArray && tabItem.children.length > 0 && renderChildren(tabItem.children)}

      {textContent && !hasElementArray && <div>{textContent}</div>}

      {isTabOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 z-10 pointer-events-none" />
      )}

      {!textContent && (!hasElementArray || tabItem.children.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <button
            onClick={e => {
              e.stopPropagation()
              setShowComponentModal(true)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 pointer-events-auto text-sm flex items-center gap-2"
          >
            {React.createElement(PlusOutlined, { className: 'text-sm' })}
            点击添加组件
          </button>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <button
          onClick={e => {
            e.stopPropagation()
            setShowComponentModal(true)
          }}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200 bg-white"
        >
          添加组件
        </button>
      </div>

      {showComponentModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setShowComponentModal(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-[720px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">选择组件</h3>
              <button
                onClick={() => setShowComponentModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索组件"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="space-y-4">
              <ComponentSection
                title="系统组件"
                components={filteredSystemComponents}
                onSelect={handleAddComponent}
                emptyText="没有找到匹配的系统组件"
              />
              <ComponentSection
                title="Ant Design 组件"
                components={filteredAntdComponents}
                onSelect={handleAddComponent}
                emptyText="没有找到匹配的 Ant Design 组件"
              />
              <ComponentSection
                title="组合模块"
                components={filteredCompositeComponents}
                onSelect={(type, elementData) => handleAddComponent(type, elementData)}
                emptyText="没有找到匹配的组合模块"
              />
              <ComponentSection
                title="自定义模块"
                components={filteredCustomComponents}
                onSelect={(type, elementData, moduleId) => handleAddComponent(type, elementData, moduleId)}
                emptyText="没有找到匹配的自定义模块"
              />
            </div>
            {totalMatchCount === 0 && (
              <div className="text-center text-gray-500 py-8">没有找到匹配的组件</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

TabContentRenderer.displayName = 'TabContentRenderer'

interface ComponentSectionProps {
  title: string
  components: Array<{ type: ElementType | string; label: string; icon: string; description?: string; elementData?: Element; moduleId?: string }>
  onSelect: (type: ElementType | string, elementData?: Element, moduleId?: string) => void
  emptyText: string
}

const ComponentSection: React.FC<ComponentSectionProps> = ({ title, components, onSelect, emptyText }) => (
  <div>
    <div className="text-sm font-semibold text-gray-600 mb-2">{title}</div>
    {components.length === 0 ? (
      <div className="text-xs text-gray-400 mb-2">{emptyText}</div>
    ) : (
      <div className="grid grid-cols-3 gap-3">
        {components.map(comp => (
          <ComponentItem key={`${title}-${comp.type}`} component={comp} mode="click" onAddComponent={onSelect} />
        ))}
      </div>
    )}
  </div>
)
