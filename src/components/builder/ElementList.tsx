'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Element } from '@/lib/types'
import { generateId } from '@/lib/utils'

interface ElementListProps {
  elements: Element[]
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onDelete?: (id: string) => void
  onCopy?: (element: Element) => void
}

// 获取元素类型的标签
function getElementTypeLabel(type: Element['type']): string {
  const labels: Partial<Record<Element['type'], string>> = {
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
    'a-button': 'Button',
    'a-input': 'Input',
    'a-card': 'Card',
    'a-form': 'Form',
    'a-table': 'Table',
    'a-select': 'Select',
    'a-datepicker': 'DatePicker',
    'a-radio': 'Radio',
    'a-checkbox': 'Checkbox',
    'a-switch': 'Switch',
    'a-slider': 'Slider',
    'a-rate': 'Rate',
    'a-tag': 'Tag',
    'a-badge': 'Badge',
    'a-avatar': 'Avatar',
    'a-divider': 'Divider',
    'a-space': 'Space',
    'a-row': 'Row',
    'a-col': 'Col',
    'a-layout': 'Layout',
    'a-menu': 'Menu',
    'a-tabs': 'Tabs',
    'a-collapse': 'Collapse',
    'a-timeline': 'Timeline',
    'a-list': 'List',
    'a-empty': 'Empty',
    'a-spin': 'Spin',
    'a-alert': 'Alert',
    'a-message': 'Message',
    'a-notification': 'Notification',
    'a-modal': 'Modal',
    'a-drawer': 'Drawer',
    'a-popconfirm': 'Popconfirm',
    'a-popover': 'Popover',
    'a-tooltip': 'Tooltip',
    'a-dropdown': 'Dropdown',
  }
  return labels[type] || type
}

// 获取元素类型的图标
function getElementTypeIcon(type: Element['type']): string {
  const icons: Partial<Record<Element['type'], string>> = {
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
    'a-button': '🔘',
    'a-input': '📥',
    'a-card': '🎴',
    'a-form': '📋',
    'a-table': '📊',
    'a-select': '📋',
    'a-datepicker': '📅',
    'a-radio': '🔘',
    'a-checkbox': '☑️',
    'a-switch': '🔀',
    'a-slider': '🎚️',
    'a-rate': '⭐',
    'a-tag': '🏷️',
    'a-badge': '🔖',
    'a-avatar': '👤',
    'a-divider': '➖',
    'a-space': '↔️',
    'a-row': '➡️',
    'a-col': '⬇️',
    'a-layout': '📐',
    'a-menu': '📑',
    'a-tabs': '📑',
    'a-collapse': '📂',
    'a-timeline': '⏱️',
    'a-list': '📋',
    'a-empty': '📭',
    'a-spin': '🌀',
    'a-alert': '⚠️',
    'a-message': '💬',
    'a-notification': '🔔',
    'a-modal': '🪟',
    'a-drawer': '📤',
    'a-popconfirm': '❓',
    'a-popover': '💭',
    'a-tooltip': '💡',
    'a-dropdown': '📋',
  }
  return icons[type] || '📦'
}

// 获取元素的所有子元素（包括标准 children 和特殊组件的子元素，如 a-tabs 的 props.items[].children）
function getAllChildren(element: Element): Element[] {
  const children: Element[] = []
  
  // 标准的 children
  if (element.children && Array.isArray(element.children)) {
    children.push(...element.children)
  }
  
  // a-tabs 的 props.items[].children
  if (element.type === 'a-tabs' && element.props?.items && Array.isArray(element.props.items)) {
    for (const item of element.props.items) {
      if (item.children && Array.isArray(item.children)) {
        // 检查是否是 Element 对象数组（有 id 和 type 属性）
        const isElementArray = item.children.every(
          (child: any) => child && typeof child === 'object' && 'id' in child && 'type' in child
        )
        if (isElementArray) {
          children.push(...item.children)
        }
      }
    }
  }
  
  return children
}

function ElementItem({
  element,
  selectedElementId,
  onSelect,
  onDelete,
  onCopy,
  level = 0,
  searchQuery = '',
  shouldShow = true,
}: {
  element: Element
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onDelete?: (id: string) => void
  onCopy?: (element: Element) => void
  level?: number
  searchQuery?: string
  shouldShow?: boolean
}) {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [moduleName, setModuleName] = useState('')
  const [moduleLabel, setModuleLabel] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [includeChildren, setIncludeChildren] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkingName, setCheckingName] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)

  const isSelected = selectedElementId === element.id
  const allChildren = getAllChildren(element)
  const hasChildren = allChildren.length > 0

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
    // 选中当前元素
    onSelect(element.id)
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showContextMenu])

  // 处理设置样式
  const handleStyleMenuClick = () => {
    // 触发自定义事件，通知属性面板切换到样式标签页
    const eventDetail = {
      elementId: element.id,
      tab: 'style'
    }
    const switchTabEvent = new CustomEvent('switchPropertyPanelTab', {
      detail: eventDetail
    })
    window.dispatchEvent(switchTabEvent)
    
    // 滚动到属性面板
    const propertyPanel = document.querySelector('[data-property-panel]')
    if (propertyPanel) {
      propertyPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    setShowContextMenu(false)
  }

  // 处理复制
  const handleCopyMenuClick = () => {
    if (onCopy) {
      onCopy(element)
    }
    setShowContextMenu(false)
  }

  // 处理删除
  const handleDelete = () => {
    if (onDelete && window.confirm(`确定要删除 "${element.props?.label || element.props?.name || getElementTypeLabel(element.type)}" 吗？`)) {
      onDelete(element.id)
      setShowContextMenu(false)
    }
  }

  // 深拷贝元素并生成新ID
  const cloneElement = (el: Element, includeChildren: boolean): Element => {
    const newId = generateId()
    const cloned: Element = {
      ...el,
      id: newId,
      children: includeChildren && el.children ? el.children.map(child => cloneElement(child, true)) : undefined,
    }
    return cloned
  }

  // 处理另存为模块
  const handleSaveAsModuleClick = async () => {
    setShowContextMenu(false)
    
    // 自动生成默认名称
    const defaultLabel = element.props?.label || element.type || 'module'
    setModuleLabel(defaultLabel)
    setModuleDescription('')
    setIncludeChildren(true)
    
    // 生成默认模块名称并检查是否重复
    const baseName = `custom-${defaultLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    let generatedName = baseName
    setCheckingName(true)
    try {
      const response = await fetch('/api/modules')
      const result = await response.json()
      if (result.success) {
        const existingNames = (result.data || []).map((m: any) => m.name)
        let counter = 1
        while (existingNames.includes(generatedName)) {
          generatedName = `${baseName}-${counter}`
          counter++
        }
      }
    } catch (error) {
      console.error('检查模块名称失败:', error)
    } finally {
      setCheckingName(false)
    }
    
    setModuleName(generatedName)
    setShowSaveDialog(true)
  }

  // 保存模块
  const handleSaveModule = async () => {
    if (!moduleName.trim() || !moduleLabel.trim()) {
      alert('请输入模块名称和显示名称')
      return
    }

    // 检查名称是否重复
    setCheckingName(true)
    try {
      const checkResponse = await fetch('/api/modules')
      const checkResult = await checkResponse.json()
      if (checkResult.success) {
        const existingNames = (checkResult.data || []).map((m: any) => m.name)
        if (existingNames.includes(moduleName.trim())) {
          alert(`模块名称 "${moduleName.trim()}" 已存在，请使用其他名称`)
          setCheckingName(false)
          return
        }
      }
    } catch (error) {
      console.error('检查模块名称失败:', error)
    } finally {
      setCheckingName(false)
    }

    setSaving(true)
    try {
      // 根据选择创建元素副本
      const elementCopy = cloneElement(element, includeChildren)

      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: moduleName.trim(),
          label: moduleLabel.trim(),
          icon: '📦',
          description: moduleDescription.trim() || undefined,
          element: elementCopy,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('模块保存成功！')
        setShowSaveDialog(false)
        // 触发自定义模块列表刷新
        window.dispatchEvent(new CustomEvent('customModuleSaved'))
      } else {
        alert(`保存失败：${result.error}`)
      }
    } catch (error: any) {
      console.error('保存模块失败:', error)
      alert(`保存失败：${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // 保存到现有模块（更新操作）
  const handleSaveToModuleClick = async () => {
    if (!element.moduleId) {
      alert('当前元素不是自定义模块，无法保存')
      return
    }

    setShowContextMenu(false)
    
    const confirmed = confirm('确定要将当前设置保存到自定义模块吗？这将更新模块的配置。')
    if (!confirmed) {
      return
    }

    setSaving(true)
    try {
      // 根据选择创建元素副本（不包含moduleId，因为这是要保存到模块的）
      const elementCopy = cloneElement(element, true)
      // 移除moduleId，因为这是要保存到模块的模板
      const removeModuleId = (el: Element): Element => {
        const { moduleId, ...rest } = el
        return {
          ...rest,
          children: el.children ? el.children.map(removeModuleId) : undefined,
        }
      }
      const elementToSave = removeModuleId(elementCopy)

      const response = await fetch(`/api/modules/${element.moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          element: elementToSave,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('模块更新成功！')
        // 触发自定义模块列表刷新
        window.dispatchEvent(new CustomEvent('customModuleSaved'))
      } else {
        alert(`更新失败：${result.error}`)
      }
    } catch (error: any) {
      console.error('更新模块失败:', error)
      alert(`更新失败：${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // 获取元素的显示名称（如果有自定义名称，优先使用）
  const displayName = element.props?.label || element.props?.name || getElementTypeLabel(element.type)
  
  // 检查是否匹配搜索
  const matchesSearch = searchQuery === '' || 
    displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getElementTypeLabel(element.type).toLowerCase().includes(searchQuery.toLowerCase())

  // 检查子元素是否有匹配的
  const hasMatchingChildren = hasChildren && allChildren.some(child => 
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
        ref={itemRef}
        onClick={() => onSelect(element.id)}
        onContextMenu={handleContextMenu}
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
        <span className="text-base">{getElementTypeIcon(element.type)}</span>
        <span className="flex-1 font-medium truncate">
          {highlightText(displayName, searchQuery)}
        </span>
        {hasChildren && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            ({allChildren.length})
          </span>
        )}
      </div>
      {hasChildren && (
        <div>
          {allChildren.map(child => (
            <ElementItem
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onDelete={onDelete}
              onCopy={onCopy}
              level={level + 1}
              searchQuery={searchQuery}
              shouldShow={true}
            />
          ))}
        </div>
      )}
      {/* 右键菜单 */}
      {showContextMenu && (
        <>
          <div
            ref={menuRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[200] min-w-[160px]"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              onClick={handleStyleMenuClick}
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              设置样式
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            {onCopy && (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  onClick={handleCopyMenuClick}
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  复制
                </button>
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}
            {/* 如果元素来自自定义模块，显示保存菜单 */}
            {element.moduleId && (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  onClick={handleSaveToModuleClick}
                  disabled={saving}
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {saving ? '保存中...' : '保存'}
                </button>
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}
            <button
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              onClick={handleSaveAsModuleClick}
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
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              另存为
            </button>
            {onDelete && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={handleDelete}
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
                  删除
                </button>
              </>
            )}
          </div>
          {/* 背景遮罩，点击关闭菜单 */}
          <div
            className="fixed inset-0 z-[199]"
            onClick={() => setShowContextMenu(false)}
          />
        </>
      )}
      {/* 另存为自定义模块对话框 */}
      {showSaveDialog && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[300] flex items-center justify-center"
            onClick={() => setShowSaveDialog(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                另存为自定义模块
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模块名称（英文，唯一标识）*
                  </label>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如: custom-banner"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    显示名称*
                  </label>
                  <input
                    type="text"
                    value={moduleLabel}
                    onChange={(e) => setModuleLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如: 轮播图"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述（可选）
                  </label>
                  <textarea
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="模块描述"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeChildren}
                      onChange={(e) => setIncludeChildren(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">包含子元素</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  disabled={saving || checkingName}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveModule}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving || checkingName}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// 递归检查元素是否匹配搜索
function matchesElement(element: Element, query: string): boolean {
  if (!query) return true
  
  const displayName = element.props?.label || element.props?.name || getElementTypeLabel(element.type)
  const matches = displayName.toLowerCase().includes(query.toLowerCase()) ||
    getElementTypeLabel(element.type).toLowerCase().includes(query.toLowerCase())
  
  if (matches) return true
  
  // 检查子元素（包括标准 children 和特殊组件的子元素）
  const allChildren = getAllChildren(element)
  if (allChildren.length > 0) {
    return allChildren.some(child => matchesElement(child, query))
  }
  
  return false
}

export function ElementList({ elements, selectedElementId, onSelect, onDelete, onCopy }: ElementListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // 计算匹配的元素数量（用于显示提示）
  const matchCount = useMemo(() => {
    if (!searchQuery) return 0
    let count = 0
    const countMatches = (els: Element[]) => {
      els.forEach(el => {
        const displayName = el.props?.label || el.props?.name || getElementTypeLabel(el.type)
        if (displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getElementTypeLabel(el.type).toLowerCase().includes(searchQuery.toLowerCase())) {
          count++
        }
        // 递归检查所有子元素（包括标准 children 和特殊组件的子元素）
        const allChildren = getAllChildren(el)
        if (allChildren.length > 0) {
          countMatches(allChildren)
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
            onDelete={onDelete}
            onCopy={onCopy}
            searchQuery={searchQuery}
            shouldShow={true}
          />
        ))}
      </div>
    </div>
  )
}

