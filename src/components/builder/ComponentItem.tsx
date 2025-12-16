'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Tooltip } from 'antd'
import { Element, ElementType, ComponentDefinition } from '@/lib/types'

// 组件项的基础类型
type ComponentItemData = ComponentDefinition | { 
  type: string
  label: string
  icon: string
  description?: string
  elementData?: Element
  moduleId?: string
  category?: 'system' | 'custom' | 'composite'
}

interface ComponentItemProps {
  component: ComponentItemData
  // 模式：'drag' 用于拖拽（ComponentPanel），'click' 用于点击选择（ElementRenderer 弹窗）
  mode?: 'drag' | 'click'
  // 点击模式下的回调
  onClick?: (componentType: ElementType | string, elementData?: Element, moduleId?: string) => void
  // 拖拽模式下的回调（仅自定义组件）
  onPreview?: (component: ComponentDefinition) => void
  onEdit?: (component: ComponentDefinition) => void
  onDelete?: (component: ComponentDefinition) => void
  // 主题颜色：'blue' 用于系统/Ant Design 组件，'green' 用于自定义组件
  theme?: 'blue' | 'green'
  // 布局：'horizontal' 横向（拖拽模式），'vertical' 纵向（点击模式）
  layout?: 'horizontal' | 'vertical'
}

export const ComponentItem = ({ 
  component, 
  mode = 'click',
  onClick,
  onPreview,
  onEdit,
  onDelete,
  theme = 'blue',
  layout = mode === 'drag' ? 'horizontal' : 'vertical'
}: ComponentItemProps) => {
  const isAntdComponent = typeof component.type === 'string' && component.type.startsWith('a-')
  const hasElementData = 'elementData' in component && !!component.elementData
  const isCustomCategory = component.category === 'custom'
  const isModuleLike = hasElementData
  
  // 确定主题颜色
  const finalTheme = theme === 'green' || isCustomCategory ? 'green' : 'blue'
  
  // 拖拽模式：使用 useDraggable
  const dragId = isModuleLike
    ? `custom-module-${component.type}` 
    : `component-${component.type}`
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    enabled: mode === 'drag',
    data: {
      type: isModuleLike ? 'custom-module' : 'component',
      componentType: component.type,
      elementData: 'elementData' in component ? component.elementData : undefined,
      moduleId: 'moduleId' in component ? component.moduleId : undefined,
    },
  })

  // 确定样式类
  const getBorderClass = () => {
    if (mode === 'click') {
      // 点击模式：使用按钮样式
      return finalTheme === 'green' 
        ? 'border-gray-200 hover:border-green-400 hover:bg-green-50'
        : isAntdComponent
        ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 bg-blue-50'
        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
    } else {
      // 拖拽模式：使用 div 样式
      return isAntdComponent 
        ? 'bg-blue-50 border border-blue-200 hover:border-blue-400 hover:bg-blue-100 hover:shadow-md' 
        : 'bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md'
    }
  }

  const handleClick = () => {
    if (mode === 'click' && onClick) {
      if ('elementData' in component && component.elementData) {
        // 模块型组件：传递 elementData，并附带 moduleId（如果存在）
        onClick(component.type, component.elementData, 'moduleId' in component ? component.moduleId : undefined)
      } else {
        // 系统组件或 Ant Design 组件：只传递 type
        onClick(component.type)
      }
    }
  }

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPreview && isModuleLike) {
      onPreview(component as ComponentDefinition)
    }
  }

  const baseClassName = `
    ${mode === 'click' ? 'p-3 border rounded transition-all text-left cursor-pointer' : 'p-3 rounded transition-all'}
    ${mode === 'drag' ? (isDragging ? 'opacity-30' : '') + ' cursor-move' : ''}
    ${getBorderClass()}
  `.trim().replace(/\s+/g, ' ')

  const content = layout === 'horizontal' ? (
    // 横向布局（拖拽模式）
    <div className="flex items-center gap-2">
      <span className="text-xl flex-shrink-0">{component.icon}</span>
      <div className="flex-1 min-w-0">
        <Tooltip title={component.label} placement="top">
          <div className={`text-sm font-medium truncate ${isAntdComponent ? 'text-blue-700' : 'text-gray-900'}`}>
            {component.label}
          </div>
        </Tooltip>
        {component.description && (
          <div className={`text-xs truncate mt-0.5 ${isAntdComponent ? 'text-blue-600' : 'text-gray-500'}`}>
            {component.description}
          </div>
        )}
      </div>
      {isModuleLike && mode === 'drag' && (
        <div 
          className="flex items-center gap-1 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {onPreview && (
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
          )}
          {onEdit && isCustomCategory && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(component as ComponentDefinition)
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
          )}
          {onDelete && isCustomCategory && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(component as ComponentDefinition)
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
          )}
        </div>
      )}
    </div>
  ) : (
    // 纵向布局（点击模式）
    <>
      <div className="text-xl mb-1">{component.icon}</div>
      <div className={`text-xs font-medium truncate ${isAntdComponent ? 'text-blue-700' : 'text-gray-700'}`}>
        {component.label}
      </div>
      {component.description && (
        <div className={`text-xs truncate mt-0.5 ${isAntdComponent ? 'text-blue-600' : 'text-gray-500'}`}>
          {component.description}
        </div>
      )}
    </>
  )

  if (mode === 'drag') {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={baseClassName}
        title={component.description}
      >
        {content}
      </div>
    )
  } else {
    return (
      <button
        onClick={handleClick}
        className={baseClassName}
        title={component.description}
      >
        {content}
      </button>
    )
  }
}
