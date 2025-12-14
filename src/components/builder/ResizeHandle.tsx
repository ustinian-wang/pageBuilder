'use client'

import { useState, useRef, useEffect } from 'react'

interface ResizeHandleProps {
  position: 'right' | 'bottom' | 'bottom-right'
  onResize: (deltaX: number, deltaY: number) => void
}

export function ResizeHandle({ position, onResize }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - startPosRef.current.x
      const deltaY = e.clientY - startPosRef.current.y

      if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
        if (position === 'right') {
          onResize(deltaX, 0)
        } else if (position === 'bottom') {
          onResize(0, deltaY)
        } else if (position === 'bottom-right') {
          onResize(deltaX, deltaY)
        }

        startPosRef.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = getCursor(position)
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, position, onResize])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
    startPosRef.current = { x: e.clientX, y: e.clientY }
  }

  const getCursor = (pos: string): string => {
    switch (pos) {
      case 'right':
        return 'ew-resize'
      case 'bottom':
        return 'ns-resize'
      case 'bottom-right':
        return 'nwse-resize'
      default:
        return 'default'
    }
  }

  const getPositionClasses = (pos: string): string => {
    switch (pos) {
      case 'right':
        return 'top-0 right-0 h-full w-1 cursor-ew-resize'
      case 'bottom':
        return 'bottom-0 left-0 w-full h-1 cursor-ns-resize'
      case 'bottom-right':
        return 'bottom-0 right-0 w-3 h-3 cursor-nwse-resize'
      default:
        return ''
    }
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute ${getPositionClasses(position)} bg-blue-500 hover:bg-blue-600 transition-colors z-10 ${
        position === 'bottom-right' ? 'rounded-tl-full' : ''
      }`}
      style={{
        opacity: isDragging ? 0.8 : 1,
      }}
    />
  )
}

