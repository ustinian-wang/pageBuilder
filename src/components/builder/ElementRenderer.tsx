'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Element } from '@/lib/types'
import { ResizeHandle } from './ResizeHandle'

interface ElementRendererProps {
  element: Element
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  onDelete: (id: string) => void
}

export function ElementRenderer({
  element,
  selectedElementId,
  onSelect,
  onUpdate,
  onDelete,
}: ElementRendererProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: element.id,
  })

  const isSelected = selectedElementId === element.id
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(element.id)
  }

  // 基础样式（会保存到代码中）
  const baseStyle: React.CSSProperties = {
    ...element.style,
    position: 'relative',
    minWidth: element.type === 'container' ? '100px' : undefined,
    minHeight: element.type === 'container' ? '50px' : undefined,
  }

  // 编辑器辅助样式（不会保存到代码中）
  const editorStyle: React.CSSProperties = {
    outline: isSelected ? '2px solid #3b82f6' : 'none',
    outlineOffset: '2px',
  }

  // 容器特有的编辑器视觉提示样式
  if (element.type === 'container') {
    // 如果没有内容或背景色，显示虚线边框提示
    const hasBackground = element.style?.backgroundColor || element.className?.includes('bg-')
    const hasChildren = element.children && element.children.length > 0
    
    if (!hasBackground && !hasChildren) {
      editorStyle.border = '1px dashed #d1d5db'
      editorStyle.borderRadius = '4px'
    }

    // hover 效果
    if (isHovered && !isSelected) {
      editorStyle.border = '1px dashed #3b82f6'
      editorStyle.backgroundColor = 'rgba(59, 130, 246, 0.05)'
    }
  }

  const style: React.CSSProperties = {
    ...baseStyle,
    ...editorStyle,
  }

  // 处理容器尺寸调整
  const handleResize = (deltaX: number, deltaY: number) => {
    if (element.type !== 'container') return

    const currentWidth = element.style?.width
      ? parseFloat(String(element.style.width).replace(/[^0-9.]/g, ''))
      : null
    const currentHeight = element.style?.height
      ? parseFloat(String(element.style.height).replace(/[^0-9.]/g, ''))
      : null

    const newStyle = { ...(element.style || {}) }
    
    if (deltaX !== 0) {
      const baseWidth = currentWidth !== null && !isNaN(currentWidth) ? currentWidth : 200
      const newWidth = Math.max(100, baseWidth + deltaX)
      newStyle.width = `${newWidth}px`
    }
    
    if (deltaY !== 0) {
      const baseHeight = currentHeight !== null && !isNaN(currentHeight) ? currentHeight : 100
      const newHeight = Math.max(50, baseHeight + deltaY)
      newStyle.height = `${newHeight}px`
    }

    onUpdate(element.id, { style: newStyle })
  }

  let content: React.ReactNode = null

  switch (element.type) {
    case 'container':
      content = (
        <div
          ref={setNodeRef}
          style={style}
          className={element.className}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {element.children?.map(child => (
            <ElementRenderer
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 z-0" />
          )}
          {isSelected && (
            <>
              <ResizeHandle position="right" onResize={handleResize} />
              <ResizeHandle position="bottom" onResize={handleResize} />
              <ResizeHandle position="bottom-right" onResize={handleResize} />
            </>
          )}
          {/* 空容器的提示文字（仅在编辑模式显示） */}
          {(!element.children || element.children.length === 0) && !isSelected && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 pointer-events-none z-0">
              空容器
            </div>
          )}
        </div>
      )
      break

    case 'text':
      content = (
        <span ref={setNodeRef} style={style} className={element.className} onClick={handleClick}>
          {element.props?.text || '文本'}
        </span>
      )
      break

    case 'button':
      content = (
        <button
          ref={setNodeRef}
          style={style}
          className={`px-4 py-2 rounded ${element.className || ''}`}
          onClick={(e) => {
            e.preventDefault()
            handleClick(e)
          }}
        >
          {element.props?.text || '按钮'}
        </button>
      )
      break

    case 'input':
      content = (
        <input
          ref={setNodeRef}
          type="text"
          placeholder={element.props?.placeholder || '请输入'}
          style={style}
          className={element.className}
          onClick={handleClick}
          readOnly
        />
      )
      break

    case 'image':
      content = (
        <img
          ref={setNodeRef}
          src={element.props?.src || '/placeholder-image.png'}
          alt={element.props?.alt || '图片'}
          style={style}
          className={element.className}
          onClick={handleClick}
        />
      )
      break

    case 'card':
      content = (
        <div ref={setNodeRef} style={style} className={`p-4 border rounded ${element.className || ''}`} onClick={handleClick}>
          {element.children?.map(child => (
            <ElementRenderer
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50" />
          )}
        </div>
      )
      break

    case 'heading':
      const HeadingTag = `h${element.props?.level || 1}` as keyof JSX.IntrinsicElements
      content = (
        <HeadingTag ref={setNodeRef} style={style} className={element.className} onClick={handleClick}>
          {element.props?.text || '标题'}
        </HeadingTag>
      )
      break

    case 'paragraph':
      content = (
        <p ref={setNodeRef} style={style} className={element.className} onClick={handleClick}>
          {element.props?.text || '段落文本'}
        </p>
      )
      break

    case 'divider':
      content = (
        <hr ref={setNodeRef} style={style} className={element.className} onClick={handleClick} />
      )
      break

    case 'list':
      const ListTag = element.props?.ordered ? 'ol' : 'ul'
      const items = element.props?.items || []
      content = (
        <ListTag ref={setNodeRef} style={style} className={element.className} onClick={handleClick}>
          {items.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ListTag>
      )
      break

    case 'form':
      content = (
        <form ref={setNodeRef} style={style} className={element.className} onClick={handleClick}>
          {element.children?.map(child => (
            <ElementRenderer
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50" />
          )}
        </form>
      )
      break

    default:
      content = (
        <div ref={setNodeRef} style={style} className={element.className} onClick={handleClick}>
          {element.type}
        </div>
      )
  }

  return (
    <div className="relative group">
      {content}
      {isSelected && (
        <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          {element.type}
          <button
            className="ml-2 text-red-200 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(element.id)
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

