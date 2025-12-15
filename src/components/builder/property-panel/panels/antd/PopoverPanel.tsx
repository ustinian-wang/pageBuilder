'use client'

import React, { useState, useEffect, useRef } from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import { PanelProps } from '../types'
import { ElementType, Element } from '@/lib/types'
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined } from '@ant-design/icons'
import { generateId } from '@/lib/utils'

interface PopoverPanelProps extends PanelProps {
  handleTypeChange: (newType: ElementType) => void
}

export function PopoverPanel({ 
  element, 
  updateProps, 
  handleTypeChange 
}: PopoverPanelProps) {
  const [contentMode, setContentMode] = useState<'text' | 'components'>('text')
  const [contentText, setContentText] = useState<string>('')
  const [contentChildren, setContentChildren] = useState<Element[]>([])

  // 初始化数据
  useEffect(() => {
    // 检查是否有contentChildren，如果有则使用组件模式
    const hasContentChildren = element.props?.contentChildren && Array.isArray(element.props.contentChildren) && element.props.contentChildren.length > 0
    if (hasContentChildren) {
      setContentMode('components')
      setContentChildren(element.props.contentChildren)
    } else {
      setContentMode('text')
      setContentText(element.props?.content || 'Popover内容')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id])

  // 同步外部 props 变化
  useEffect(() => {
    const hasContentChildren = element.props?.contentChildren && Array.isArray(element.props.contentChildren) && element.props.contentChildren.length > 0
    if (hasContentChildren && contentMode === 'components') {
      setContentChildren(element.props.contentChildren)
    } else if (!hasContentChildren && contentMode === 'text') {
      setContentText(element.props?.content || 'Popover内容')
    }
  }, [element.props, contentMode])

  // 切换内容模式
  const handleModeChange = (mode: 'text' | 'components') => {
    setContentMode(mode)
    if (mode === 'text') {
      // 切换到文本模式，清空contentChildren，保留content文本
      updateProps('contentChildren', undefined)
      updateProps('content', contentText || 'Popover内容')
    } else {
      // 切换到组件模式，清空content文本，保留contentChildren
      updateProps('content', undefined)
      if (contentChildren.length === 0) {
        // 如果没有组件，初始化为空数组
        updateProps('contentChildren', [])
      }
    }
  }

  // 更新文本内容
  const handleTextChange = (text: string) => {
    setContentText(text)
    updateProps('content', text || undefined)
  }

  // 更新组件列表
  const handleChildrenChange = (children: Element[]) => {
    setContentChildren(children)
    updateProps('contentChildren', children.length > 0 ? children : undefined)
  }

  // 添加组件到内容区域
  const handleAddComponent = () => {
    const newElement: Element = {
      id: generateId(),
      type: 'text',
      props: { text: '新组件' },
    }
    const newChildren = [...contentChildren, newElement]
    handleChildrenChange(newChildren)
  }

  // 删除组件
  const handleDeleteComponent = (index: number) => {
    const newChildren = contentChildren.filter((_, i) => i !== index)
    handleChildrenChange(newChildren)
  }

  // 复制组件
  const cloneElement = (el: Element): Element => {
    const newId = generateId()
    return {
      ...el,
      id: newId,
      children: el.children ? el.children.map(cloneElement) : undefined,
    }
  }

  const handleCopyComponent = (index: number) => {
    const copiedElement = cloneElement(contentChildren[index])
    const newChildren = [...contentChildren]
    newChildren.splice(index + 1, 0, copiedElement)
    handleChildrenChange(newChildren)
  }

  // 移动组件
  const handleMoveComponent = (index: number, direction: 'up' | 'down') => {
    const newChildren = [...contentChildren]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newChildren.length) return
    
    ;[newChildren[index], newChildren[targetIndex]] = [newChildren[targetIndex], newChildren[index]]
    handleChildrenChange(newChildren)
  }

  // 更新组件
  const handleUpdateComponent = (index: number, updates: Partial<Element>) => {
    const newChildren = [...contentChildren]
    newChildren[index] = { ...newChildren[index], ...updates }
    handleChildrenChange(newChildren)
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
          <option value="a-popover">💭 Popover</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">切换类型将重置组件属性，但保留样式设置</p>
      </div>

      {/* 标题 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">标题 (title)</label>
        <input
          type="text"
          value={element.props?.title || ''}
          onChange={(e) => updateProps('title', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          placeholder="请输入Popover标题"
        />
        <p className="text-xs text-gray-500 mt-1">Popover气泡卡片的标题</p>
      </div>

      {/* 内容模式选择 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">内容模式</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('text')}
            className={`flex-1 px-3 py-2 text-xs border rounded ${
              contentMode === 'text'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            文本模式
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('components')}
            className={`flex-1 px-3 py-2 text-xs border rounded ${
              contentMode === 'components'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            组件模式
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {contentMode === 'text' 
            ? '使用文本作为Popover内容' 
            : '使用组件作为Popover内容，可以在内容区域嵌套其他组件'}
        </p>
      </div>

      {/* 文本模式 */}
      {contentMode === 'text' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">内容 (content)</label>
          <textarea
            value={contentText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="请输入Popover内容"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">Popover气泡卡片的内容，支持多行文本</p>
        </div>
      )}

      {/* 组件模式 */}
      {contentMode === 'components' && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-700">内容区域组件</h3>
            <button
              type="button"
              onClick={handleAddComponent}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
            >
              <PlusOutlined className="text-xs" />
              添加组件
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {contentChildren.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-300 rounded">
                <p>暂无组件，请点击"添加组件"按钮添加</p>
                <p className="mt-1 text-xs">提示：在画布中右键点击Popover，选择"添加组件"来添加触发元素</p>
              </div>
            ) : (
              contentChildren.map((child, index) => (
                <div key={child.id} className="p-2 border border-gray-200 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      组件 {index + 1}: {child.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveComponent(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="上移"
                      >
                        <ArrowUpOutlined className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveComponent(index, 'down')}
                        disabled={index === contentChildren.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="下移"
                      >
                        <ArrowDownOutlined className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyComponent(index)}
                        className="p-1 text-blue-400 hover:text-blue-600"
                        title="复制"
                      >
                        <CopyOutlined className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComponent(index)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="删除"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </div>
                  </div>
                  {/* 显示组件的基本信息 */}
                  <div className="text-xs text-gray-500">
                    {child.props?.text && <div>文本: {child.props.text}</div>}
                    {child.props?.label && <div>标签: {child.props.label}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            提示：在画布中选中Popover内容区域的组件，可以在属性面板中编辑其详细属性
          </p>
        </div>
      )}

      {/* 位置 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">位置 (placement)</label>
        <select
          value={element.props?.placement || 'top'}
          onChange={(e) => updateProps('placement', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="top">上方 (top)</option>
          <option value="topLeft">上方左侧 (topLeft)</option>
          <option value="topRight">上方右侧 (topRight)</option>
          <option value="left">左侧 (left)</option>
          <option value="leftTop">左侧上方 (leftTop)</option>
          <option value="leftBottom">左侧下方 (leftBottom)</option>
          <option value="right">右侧 (right)</option>
          <option value="rightTop">右侧上方 (rightTop)</option>
          <option value="rightBottom">右侧下方 (rightBottom)</option>
          <option value="bottom">下方 (bottom)</option>
          <option value="bottomLeft">下方左侧 (bottomLeft)</option>
          <option value="bottomRight">下方右侧 (bottomRight)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Popover相对于触发元素的位置</p>
      </div>

      {/* 触发方式 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">触发方式 (trigger)</label>
        <select
          value={element.props?.trigger || 'hover'}
          onChange={(e) => updateProps('trigger', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="hover">悬停 (hover)</option>
          <option value="focus">聚焦 (focus)</option>
          <option value="click">点击 (click)</option>
          <option value="contextMenu">右键 (contextMenu)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">触发Popover显示的方式</p>
      </div>

      {/* 其他属性 */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">气泡卡片类名</label>
          <input
            type="text"
            value={element.props?.overlayClassName || ''}
            onChange={(e) => updateProps('overlayClassName', e.target.value || undefined)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="例如: custom-popover"
          />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.props?.arrow !== false}
              onChange={(e) => updateProps('arrow', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-medium text-gray-700">显示箭头</span>
          </label>
        </div>
      </div>
    </TabsContent>
  )
}

