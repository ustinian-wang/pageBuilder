'use client'

import React, { useState, useEffect, useRef } from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import { PanelProps } from '../types'
import { ElementType, Element } from '@/lib/types'
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined } from '@ant-design/icons'
import { generateId } from '@/lib/utils'

interface TabItem {
  key: string
  label: string
  children?: any[]
  disabled?: boolean
  closable?: boolean
}

interface TabsPanelProps extends PanelProps {
  handleTypeChange: (newType: ElementType) => void
}

export function TabsPanel({ 
  element, 
  updateProps, 
  handleTypeChange 
}: TabsPanelProps) {
  const [items, setItems] = useState<TabItem[]>([])
  const [activeKey, setActiveKey] = useState<string>('')
  const [type, setType] = useState<'line' | 'card' | 'editable-card'>('line')
  const [size, setSize] = useState<'large' | 'middle' | 'small' | undefined>(undefined)
  const [centered, setCentered] = useState(false)
  const [tabPosition, setTabPosition] = useState<'top' | 'right' | 'bottom' | 'left'>('top')

  // 初始化数据 - 只在元素ID变化时重新初始化
  useEffect(() => {
    const currentItems = element.props?.items || []
    // 如果选项为空，设置默认选项（至少一个）
    if (currentItems.length === 0) {
      const defaultItems = [
        { key: 'tab-1', label: '标签页 1', children: [] },
        { key: 'tab-2', label: '标签页 2', children: [] },
      ]
      setItems(defaultItems)
      updateProps('items', defaultItems)
    } else {
      setItems(currentItems)
    }
    setActiveKey(element.props?.activeKey || element.props?.defaultActiveKey || '')
    setType(element.props?.type || 'line')
    setSize(element.props?.size)
    setCentered(element.props?.centered === true)
    setTabPosition(element.props?.tabPosition || 'top')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]) // 只在元素ID变化时重新初始化

  // 同步外部 props 变化到内部状态（当props从外部更新时）
  const prevPropsRef = useRef<{
    items?: any[]
    activeKey?: any
    type?: any
    size?: any
    centered?: any
    tabPosition?: any
  }>({})

  useEffect(() => {
    const currentItems = element.props?.items
    if (Array.isArray(currentItems)) {
      // 使用更可靠的比较方式：比较 items 的长度和每个 item 的 key
      const prevItems = prevPropsRef.current.items || []
      const prevKeys = prevItems.map((item: any) => item?.key).join(',')
      const currentKeys = currentItems.map((item: any) => item?.key).join(',')
      const prevLength = prevItems.length
      const currentLength = currentItems.length
      
      // 如果长度或 keys 发生变化，或者 items 为空，则更新
      if (prevLength !== currentLength || prevKeys !== currentKeys || currentLength === 0) {
        if (currentLength === 0) {
          // 如果 items 为空，设置默认值
          const defaultItems = [
            { key: 'tab-1', label: '标签页 1', children: [] },
            { key: 'tab-2', label: '标签页 2', children: [] },
          ]
          setItems(defaultItems)
          prevPropsRef.current.items = defaultItems
        } else {
          // 确保每个 item 都有 children 属性（即使是空数组）
          // 如果 item 没有 children，设置为空数组，避免丢失已有的 children
          const normalizedItems = currentItems.map((item: any) => ({
            ...item,
            children: item.children !== undefined ? item.children : [],
          }))
          setItems(normalizedItems)
          prevPropsRef.current.items = normalizedItems
        }
      } else {
        // 即使 keys 和长度相同，也要检查是否有 item 的 children 丢失
        // 如果发现某个 item 的 children 从有值变为 undefined，需要更新
        // 但是要注意：新添加的标签页（key 不在 prevItems 中）应该保持空数组
        let needsUpdate = false
        const prevItemsMap = new Map(prevItems.map((item: any) => [item?.key, item]))
        const normalizedItems = currentItems.map((item: any) => {
          const prevItem = prevItemsMap.get(item?.key)
          // 如果这个 item 在之前存在，且当前没有 children 但之前有，保留之前的 children
          if (prevItem && item.children === undefined && prevItem.children !== undefined) {
            needsUpdate = true
            return { ...item, children: prevItem.children }
          }
          // 如果是新添加的标签页（prevItem 不存在），确保 children 是空数组
          // 如果 item 没有 children，设置为空数组
          return {
            ...item,
            children: item.children !== undefined ? item.children : [],
          }
        })
        if (needsUpdate) {
          setItems(normalizedItems)
          prevPropsRef.current.items = normalizedItems
        }
      }
    }
    if (element.props?.activeKey !== prevPropsRef.current.activeKey) {
      setActiveKey(element.props.activeKey || element.props?.defaultActiveKey || '')
      prevPropsRef.current.activeKey = element.props.activeKey
    }
    if (element.props?.type !== prevPropsRef.current.type) {
      setType(element.props.type || 'line')
      prevPropsRef.current.type = element.props.type
    }
    if (element.props?.size !== prevPropsRef.current.size) {
      setSize(element.props.size)
      prevPropsRef.current.size = element.props.size
    }
    if (element.props?.centered !== prevPropsRef.current.centered) {
      setCentered(element.props.centered === true)
      prevPropsRef.current.centered = element.props.centered
    }
    if (element.props?.tabPosition !== prevPropsRef.current.tabPosition) {
      setTabPosition(element.props.tabPosition || 'top')
      prevPropsRef.current.tabPosition = element.props.tabPosition
    }
  }, [element.props])

  // 更新标签页项
  const handleItemChange = (index: number, field: keyof TabItem, newValue: any) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: newValue,
    }
    setItems(newItems)
    updateProps('items', newItems)
  }

  // 添加标签页
  const handleAddItem = () => {
    const newKey = `tab-${Date.now()}`
    const newItem: TabItem = {
      key: newKey,
      label: `标签页 ${items.length + 1}`,
      children: [],
      disabled: false,
      closable: false,
    }
    const newItems = [...items, newItem]
    setItems(newItems)
    updateProps('items', newItems)
    // 自动切换到新添加的标签页
    setActiveKey(newKey)
    updateProps('activeKey', newKey)
  }

  // 深拷贝 Element 对象，为每个 Element 生成新的 ID
  const cloneElement = (el: Element): Element => {
    const newId = generateId()
    return {
      ...el,
      id: newId,
      children: el.children ? el.children.map(cloneElement) : undefined,
    }
  }

  // 复制标签页
  const handleCopyItem = (index: number) => {
    const itemToCopy = items[index]
    // 深拷贝标签页，包括 children
    // 如果 children 是 Element 数组，需要为每个 Element 生成新的 ID
    let copiedChildren: any[] = []
    if (itemToCopy.children && Array.isArray(itemToCopy.children)) {
      // 检查是否是 Element 对象数组（有 id 和 type 属性）
      const isElementArray = itemToCopy.children.every(
        (child: any) => child && typeof child === 'object' && 'id' in child && 'type' in child
      )
      if (isElementArray) {
        // 是 Element 数组，需要为每个 Element 生成新 ID
        copiedChildren = itemToCopy.children.map((child: Element) => cloneElement(child))
      } else {
        // 不是 Element 数组，使用 JSON 深拷贝
        copiedChildren = JSON.parse(JSON.stringify(itemToCopy.children))
      }
    }
    
    const copiedItem: TabItem = {
      ...itemToCopy,
      key: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `${itemToCopy.label} (副本)`,
      children: copiedChildren,
    }
    // 将复制的标签页插入到原标签页的后面
    const newItems = [...items]
    newItems.splice(index + 1, 0, copiedItem)
    setItems(newItems)
    updateProps('items', newItems)
    // 自动切换到新复制的标签页
    setActiveKey(copiedItem.key)
    updateProps('activeKey', copiedItem.key)
  }

  // 删除标签页
  const handleDeleteItem = (index: number) => {
    // 确保至少保留一个标签页
    if (items.length <= 1) {
      return
    }
    const deletedItem = items[index]
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    updateProps('items', newItems)
    
    // 如果删除的是当前激活的标签页，切换到第一个标签页
    if (String(activeKey) === String(deletedItem.key)) {
      const newActiveKey = newItems.length > 0 ? newItems[0].key : ''
      setActiveKey(newActiveKey)
      updateProps('activeKey', newActiveKey)
    }
  }

  // 移动标签页
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return
    
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
    setItems(newItems)
    updateProps('items', newItems)
  }

  return (
    <TabsContent value="basic" className="mt-0 p-4 space-y-4">
      {/* 组件类型切换 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">组件类型</label>
        <select
          value={element.type}
          onChange={(e) => handleTypeChange(e.target.value as ElementType)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="a-tabs">📑 Tabs</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">切换类型将重置组件属性，但保留样式设置</p>
      </div>

      {/* 标签页列表 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-700">标签页列表</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <PlusOutlined className="text-xs" />
            添加标签页
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-400">
              <p>暂无标签页，请点击"添加标签页"按钮添加</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.key} className="p-2 border border-gray-200 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">标签页 {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="上移"
                    >
                      <ArrowUpOutlined className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="下移"
                    >
                      <ArrowDownOutlined className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyItem(index)}
                      className="p-1 text-blue-400 hover:text-blue-600"
                      title="复制"
                    >
                      <CopyOutlined className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(index)}
                      disabled={items.length <= 1}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={items.length <= 1 ? '至少保留一个标签页' : '删除'}
                    >
                      <DeleteOutlined className="text-xs" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-0.5">标签 (label)</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="标签文本"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-0.5">键值 (key)</label>
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => handleItemChange(index, 'key', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="唯一标识"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.disabled === true}
                        onChange={(e) => handleItemChange(index, 'disabled', e.target.checked)}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-gray-600">禁用此标签页</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.closable === true}
                        onChange={(e) => handleItemChange(index, 'closable', e.target.checked)}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-gray-600">可关闭</span>
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 默认激活的标签页 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">默认激活的标签页</label>
        <select
          value={String(activeKey)}
          onChange={(e) => {
            setActiveKey(e.target.value)
            updateProps('activeKey', e.target.value || undefined)
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        >
          <option value="">无（不设置默认激活）</option>
          {items.map((item) => (
            <option key={item.key} value={String(item.key)}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* 标签页类型 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">标签页类型</label>
        <select
          value={type}
          onChange={(e) => {
            const newValue = e.target.value as 'line' | 'card' | 'editable-card'
            setType(newValue)
            updateProps('type', newValue)
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        >
          <option value="line">线条 (line)</option>
          <option value="card">卡片 (card)</option>
          <option value="editable-card">可编辑卡片 (editable-card)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">选择标签页的显示样式</p>
      </div>

      {/* 尺寸 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">尺寸</label>
        <select
          value={size || ''}
          onChange={(e) => {
            const newValue = e.target.value || undefined
            setSize(newValue as 'large' | 'middle' | 'small' | undefined)
            updateProps('size', newValue)
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        >
          <option value="">默认</option>
          <option value="large">大 (large)</option>
          <option value="middle">中 (middle)</option>
          <option value="small">小 (small)</option>
        </select>
      </div>

      {/* 标签位置 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">标签位置</label>
        <select
          value={tabPosition}
          onChange={(e) => {
            const newValue = e.target.value as 'top' | 'right' | 'bottom' | 'left'
            setTabPosition(newValue)
            updateProps('tabPosition', newValue)
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
        >
          <option value="top">顶部 (top)</option>
          <option value="right">右侧 (right)</option>
          <option value="bottom">底部 (bottom)</option>
          <option value="left">左侧 (left)</option>
        </select>
      </div>

      {/* 居中显示 */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={centered}
            onChange={(e) => {
              setCentered(e.target.checked)
              updateProps('centered', e.target.checked)
            }}
            className="w-4 h-4"
          />
          <span className="text-xs font-medium text-gray-700">居中显示</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">标签页标题居中显示</p>
      </div>
    </TabsContent>
  )
}

