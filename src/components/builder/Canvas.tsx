'use client'

import { useDroppable } from '@dnd-kit/core'
import { Element } from '@/lib/types'
import { ElementRenderer } from './ElementRenderer'
import { useState, useRef, useCallback, useEffect } from 'react'

interface CanvasProps {
  elements: Element[]
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  onDelete: (id: string) => void
  onCopy?: (element: Element) => void
}

interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function Canvas({ elements, selectedElementId, onSelect, onUpdate, onDelete, onCopy }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
  })

  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const isSelectingRef = useRef(false)
  const selectionBoxRef = useRef<SelectionBox | null>(null)

  const handleCanvasClick = (e: React.MouseEvent) => {
    // 如果正在框选，不处理点击事件
    if (isSelecting) {
      return
    }
    
    // 检查点击目标是否是元素
    const target = e.target as HTMLElement
    const clickedElement = target.closest('[data-element-id]')
    
    // 如果点击的不是元素（说明是空白区域），取消选中
    // 注意：ElementRenderer 中的 handleClick 会调用 stopPropagation，
    // 所以如果点击的是元素，事件不会到达这里
    if (!clickedElement) {
      onSelect(null)
    }
  }

  // 使用原生事件监听器，避免被 React 合成事件或 dnd-kit 阻止
  const handleMouseDownNative = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    
    // 如果点击的是元素本身或其子元素，不启动框选
    const clickedElement = target.closest('[data-element-id]')
    if (clickedElement) {
      return
    }

    // 如果点击的是选择框，不启动框选
    if (target.classList.contains('selection-box')) {
      return
    }

    // 如果点击的是拖拽手柄，不启动框选
    if (target.closest('[data-drag-handle]')) {
      return
    }

    // 只在鼠标左键按下时启动框选
    if (e.button !== 0) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    // 检查点击是否在画布内
    const rect = canvas.getBoundingClientRect()
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return
    }

    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    const newSelectionBox = {
      startX,
      startY,
      endX: startX,
      endY: startY,
    }
    isSelectingRef.current = true
    isDraggingRef.current = false
    startPosRef.current = { x: e.clientX, y: e.clientY }
    selectionBoxRef.current = newSelectionBox
    setIsSelecting(true)
    setSelectionBox(newSelectionBox)
  }, [])

  const handleMouseMoveNative = useCallback((e: MouseEvent) => {
    if (!isSelectingRef.current || !selectionBoxRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top

    // 检查是否移动了足够的距离
    if (startPosRef.current) {
      const dx = Math.abs(e.clientX - startPosRef.current.x)
      const dy = Math.abs(e.clientY - startPosRef.current.y)
      if (dx > 2 || dy > 2) {
        isDraggingRef.current = true
      }
    }

    const newSelectionBox = {
      ...selectionBoxRef.current,
      endX,
      endY,
    }
    selectionBoxRef.current = newSelectionBox
    setSelectionBox(newSelectionBox)
  }, [])

  const handleMouseUpNative = useCallback((e: MouseEvent) => {
    if (!isSelectingRef.current || !selectionBoxRef.current) {
      startPosRef.current = null
      return
    }

    const canvas = canvasRef.current
    const currentSelectionBox = selectionBoxRef.current
    
    if (!canvas) {
      isSelectingRef.current = false
      selectionBoxRef.current = null
      setIsSelecting(false)
      setSelectionBox(null)
      startPosRef.current = null
      return
    }

    // 计算选择框的尺寸
    const width = Math.abs(currentSelectionBox.endX - currentSelectionBox.startX)
    const height = Math.abs(currentSelectionBox.endY - currentSelectionBox.startY)

    // 如果选择框太小（小于5px），认为是点击而不是框选
    if (width < 5 && height < 5) {
      isSelectingRef.current = false
      selectionBoxRef.current = null
      setIsSelecting(false)
      setSelectionBox(null)
      isDraggingRef.current = false
      startPosRef.current = null
      return
    }

    // 计算选择框的边界
    const left = Math.min(currentSelectionBox.startX, currentSelectionBox.endX)
    const top = Math.min(currentSelectionBox.startY, currentSelectionBox.endY)
    const right = Math.max(currentSelectionBox.startX, currentSelectionBox.endX)
    const bottom = Math.max(currentSelectionBox.startY, currentSelectionBox.endY)

    // 获取所有元素的位置信息
    const selectedIds: string[] = []
    const allElements = canvas.querySelectorAll('[data-element-id]')

    allElements.forEach((elementNode) => {
      const elementId = elementNode.getAttribute('data-element-id')
      if (!elementId) return

      const elementRect = elementNode.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()

      // 计算元素相对于画布的位置
      const elementLeft = elementRect.left - canvasRect.left
      const elementTop = elementRect.top - canvasRect.top
      const elementRight = elementRect.right - canvasRect.left
      const elementBottom = elementRect.bottom - canvasRect.top

      // 判断元素是否在选择框范围内
      // 元素至少有一部分在选择框内就算选中
      const isOverlapping = !(
        elementRight < left ||
        elementLeft > right ||
        elementBottom < top ||
        elementTop > bottom
      )

      if (isOverlapping) {
        selectedIds.push(elementId)
      }
    })

    // 选中最后一个元素（保持向后兼容，只选中一个）
    if (selectedIds.length > 0) {
      onSelect(selectedIds[selectedIds.length - 1])
    } else {
      onSelect(null)
    }

    isSelectingRef.current = false
    selectionBoxRef.current = null
    setIsSelecting(false)
    setSelectionBox(null)
    isDraggingRef.current = false
    startPosRef.current = null
  }, [onSelect])

  // 同步 ref 和 state
  useEffect(() => {
    isSelectingRef.current = isSelecting
  }, [isSelecting])

  useEffect(() => {
    selectionBoxRef.current = selectionBox
  }, [selectionBox])

  // 使用 useEffect 添加原生事件监听器
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 使用捕获阶段，确保在其他事件处理器之前处理
    canvas.addEventListener('mousedown', handleMouseDownNative, true)
    document.addEventListener('mousemove', handleMouseMoveNative, true)
    document.addEventListener('mouseup', handleMouseUpNative, true)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDownNative, true)
      document.removeEventListener('mousemove', handleMouseMoveNative, true)
      document.removeEventListener('mouseup', handleMouseUpNative, true)
    }
  }, [handleMouseDownNative, handleMouseMoveNative, handleMouseUpNative])


  // 计算选择框的样式
  const getSelectionBoxStyle = (): React.CSSProperties | null => {
    if (!selectionBox) return null

    const left = Math.min(selectionBox.startX, selectionBox.endX)
    const top = Math.min(selectionBox.startY, selectionBox.endY)
    const width = Math.abs(selectionBox.endX - selectionBox.startX)
    const height = Math.abs(selectionBox.endY - selectionBox.startY)

    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: '2px dashed #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointerEvents: 'none',
      zIndex: 1000,
    }
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        canvasRef.current = node
      }}
      className={`
        h-full bg-white rounded-lg shadow-lg p-2
        ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
      `}
      style={{ minHeight: '100%', boxSizing: 'border-box', position: 'relative' }}
      onClick={handleCanvasClick}
    >
      {elements.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">拖拽组件到这里开始构建页面</p>
            <p className="text-sm">从左侧组件库选择组件并拖拽到此处</p>
          </div>
        </div>
      ) : (
        <div className="h-full" style={{ position: 'relative', height: '100%' }}>
          {elements.map(element => (
            <ElementRenderer
              key={element.id}
              element={element}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onCopy={onCopy}
            />
          ))}
          {/* 选择框 */}
          {isSelecting && selectionBox && (
            <div
              className="selection-box"
              style={getSelectionBoxStyle()}
            />
          )}
        </div>
      )}
    </div>
  )
}

