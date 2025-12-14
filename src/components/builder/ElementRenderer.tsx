'use client'

import { useDroppable } from '@dnd-kit/core'
import { Element } from '@/lib/types'

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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(element.id)
  }

  const style: React.CSSProperties = {
    ...element.style,
    position: 'relative',
    outline: isSelected ? '2px solid #3b82f6' : 'none',
    outlineOffset: '2px',
  }

  if (element.className) {
    style.className = element.className
  }

  let content: React.ReactNode = null

  switch (element.type) {
    case 'container':
      content = (
        <div ref={setNodeRef} style={style} className={element.className} onClick={handleClick}>
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

