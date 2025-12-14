'use client'

import { useState, useMemo } from 'react'
import { Element } from '@/lib/types'

interface ElementListProps {
  elements: Element[]
  selectedElementId: string | null
  onSelect: (id: string | null) => void
}

const elementTypeLabels: Record<Element['type'], string> = {
  container: '容器',
  text: '文本',
  button: '按钮',
  input: '输入框',
  image: '图片',
  card: '卡片',
  divider: '分割线',
  heading: '标题',
  paragraph: '段落',
  list: '列表',
  form: '表单',
}

const elementTypeIcons: Record<Element['type'], string> = {
  container: '📦',
  text: '📝',
  button: '🔘',
  input: '📥',
  image: '🖼️',
  card: '🎴',
  divider: '➖',
  heading: '📌',
  paragraph: '📄',
  list: '📋',
  form: '📋',
}

function ElementItem({
  element,
  selectedElementId,
  onSelect,
  level = 0,
  searchQuery = '',
  shouldShow = true,
}: {
  element: Element
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  level?: number
  searchQuery?: string
  shouldShow?: boolean
}) {
  const isSelected = selectedElementId === element.id
  const hasChildren = element.children && element.children.length > 0

  // 获取元素的显示名称（如果有自定义名称，优先使用）
  const displayName = element.props?.label || element.props?.name || elementTypeLabels[element.type]
  
  // 检查是否匹配搜索
  const matchesSearch = searchQuery === '' || 
    displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    elementTypeLabels[element.type].toLowerCase().includes(searchQuery.toLowerCase())

  // 检查子元素是否有匹配的
  const hasMatchingChildren = hasChildren && element.children!.some(child => 
    matchesElement(child, searchQuery)
  )

  // 是否应该显示（自身匹配或子元素匹配）
  const shouldDisplay = shouldShow && (matchesSearch || hasMatchingChildren)

  // 高亮匹配的文本
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }

  if (!shouldDisplay) return null

  return (
    <div>
      <div
        onClick={() => onSelect(element.id)}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm
          transition-colors
          ${isSelected ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'}
          ${matchesSearch ? '' : 'opacity-60'}
        `}
        style={{ paddingLeft: `${8 + level * 20}px` }}
      >
        {level > 0 && (
          <span className="text-gray-300 text-xs">└</span>
        )}
        <span className="text-base">{elementTypeIcons[element.type]}</span>
        <span className="flex-1 font-medium truncate">
          {highlightText(displayName, searchQuery)}
        </span>
        {hasChildren && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            ({element.children?.length})
          </span>
        )}
      </div>
      {hasChildren && (
        <div>
          {element.children!.map(child => (
            <ElementItem
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              level={level + 1}
              searchQuery={searchQuery}
              shouldShow={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 递归检查元素是否匹配搜索
function matchesElement(element: Element, query: string): boolean {
  if (!query) return true
  
  const displayName = element.props?.label || element.props?.name || elementTypeLabels[element.type]
  const matches = displayName.toLowerCase().includes(query.toLowerCase()) ||
    elementTypeLabels[element.type].toLowerCase().includes(query.toLowerCase())
  
  if (matches) return true
  
  // 检查子元素
  if (element.children && element.children.length > 0) {
    return element.children.some(child => matchesElement(child, query))
  }
  
  return false
}

export function ElementList({ elements, selectedElementId, onSelect }: ElementListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // 计算匹配的元素数量（用于显示提示）
  const matchCount = useMemo(() => {
    if (!searchQuery) return 0
    let count = 0
    const countMatches = (els: Element[]) => {
      els.forEach(el => {
        const displayName = el.props?.label || el.props?.name || elementTypeLabels[el.type]
        if (displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            elementTypeLabels[el.type].toLowerCase().includes(searchQuery.toLowerCase())) {
          count++
        }
        if (el.children) {
          countMatches(el.children)
        }
      })
    }
    countMatches(elements)
    return count
  }, [elements, searchQuery])

  if (elements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">还没有添加任何模块</p>
        <p className="text-xs mt-1">从组件库拖拽组件到画布开始构建</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索模块..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            aria-label="清除搜索"
          >
            ✕
          </button>
        )}
      </div>

      {/* 搜索结果提示 */}
      {searchQuery && (
        <div className="text-xs text-gray-500 px-2">
          {matchCount > 0 
            ? `找到 ${matchCount} 个匹配项`
            : '未找到匹配的模块'}
        </div>
      )}

      {/* 模块列表 */}
      <div className="space-y-1">
        {elements.map(element => (
          <ElementItem
            key={element.id}
            element={element}
            selectedElementId={selectedElementId}
            onSelect={onSelect}
            searchQuery={searchQuery}
            shouldShow={true}
          />
        ))}
      </div>
    </div>
  )
}

