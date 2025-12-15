'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import { ElementType } from '@/lib/types'
import { antdComponentTypes, getAntdDefaultProps } from '../../config/antd-config'
import { PanelProps } from '../types'

interface CommonAntdPanelProps extends PanelProps {
  handleTypeChange: (newType: ElementType) => void
}

// 通用 Ant Design 组件基础面板渲染器
export function renderCommonAntdBasicPanel({ 
  element, 
  updateProps, 
  handleTypeChange 
}: CommonAntdPanelProps) {
  const basicContent: React.ReactNode[] = []

  // 组件类型切换器（所有 Ant Design 组件都有）
  basicContent.push(
    <div key="type-selector">
      <label className="block text-xs font-medium text-gray-700 mb-1">组件类型</label>
      <select
        value={element.type}
        onChange={(e) => handleTypeChange(e.target.value as ElementType)}
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
      >
        {antdComponentTypes.map((comp) => (
          <option key={comp.type} value={comp.type}>
            {comp.icon} {comp.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">
        切换类型将重置组件属性，但保留样式设置
      </p>
    </div>
  )

  // 根据组件类型添加特定属性
  switch (element.type) {
    case 'a-button':
      // Button 组件有专门的面板处理
      break

    case 'a-input':
      basicContent.push(
        <div key="placeholder">
          <label className="block text-xs font-medium text-gray-700 mb-1">占位符</label>
          <input
            type="text"
            value={element.props?.placeholder || ''}
            onChange={(e) => updateProps('placeholder', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="请输入占位符文本"
          />
        </div>
      )
      basicContent.push(
        <div key="defaultValue">
          <label className="block text-xs font-medium text-gray-700 mb-1">默认值</label>
          <input
            type="text"
            value={element.props?.defaultValue || ''}
            onChange={(e) => updateProps('defaultValue', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="请输入默认值"
          />
        </div>
      )
      basicContent.push(
        <div key="disabled">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.props?.disabled === true}
              onChange={(e) => updateProps('disabled', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-medium text-gray-700">禁用</span>
          </label>
        </div>
      )
      break

    case 'a-card':
      basicContent.push(
        <div key="title">
          <label className="block text-xs font-medium text-gray-700 mb-1">标题</label>
          <input
            type="text"
            value={element.props?.title || ''}
            onChange={(e) => updateProps('title', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="请输入卡片标题"
          />
        </div>
      )
      basicContent.push(
        <div key="hoverable">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.props?.hoverable === true}
              onChange={(e) => updateProps('hoverable', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-medium text-gray-700">可悬浮</span>
          </label>
        </div>
      )
      basicContent.push(
        <div key="bordered">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.props?.bordered !== false}
              onChange={(e) => updateProps('bordered', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-medium text-gray-700">显示边框</span>
          </label>
        </div>
      )
      break

    case 'a-popover':
      basicContent.push(
        <div key="title">
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
      )
      basicContent.push(
        <div key="content">
          <label className="block text-xs font-medium text-gray-700 mb-1">内容 (content)</label>
          <textarea
            value={element.props?.content || ''}
            onChange={(e) => updateProps('content', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="请输入Popover内容"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">Popover气泡卡片的内容，支持多行文本</p>
        </div>
      )
      basicContent.push(
        <div key="placement">
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
      )
      basicContent.push(
        <div key="trigger">
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
      )
      basicContent.push(
        <div key="overlayClassName">
          <label className="block text-xs font-medium text-gray-700 mb-1">气泡卡片类名</label>
          <input
            type="text"
            value={element.props?.overlayClassName || ''}
            onChange={(e) => updateProps('overlayClassName', e.target.value || undefined)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="例如: custom-popover"
          />
          <p className="text-xs text-gray-500 mt-1">为Popover气泡卡片添加自定义CSS类名</p>
        </div>
      )
      basicContent.push(
        <div key="overlayStyle">
          <label className="block text-xs font-medium text-gray-700 mb-1">气泡卡片样式</label>
          <input
            type="text"
            value={element.props?.overlayStyle || ''}
            onChange={(e) => updateProps('overlayStyle', e.target.value || undefined)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            placeholder="例如: { maxWidth: '300px' }"
          />
          <p className="text-xs text-gray-500 mt-1">为Popover气泡卡片添加内联样式（JSON格式）</p>
        </div>
      )
      basicContent.push(
        <div key="open">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.props?.open === true}
              onChange={(e) => updateProps('open', e.target.checked || undefined)}
              className="w-4 h-4"
            />
            <span className="text-xs font-medium text-gray-700">受控显示状态</span>
          </label>
          <p className="text-xs text-gray-500 ml-6 mt-0.5">是否受控显示Popover（需要配合onOpenChange使用）</p>
        </div>
      )
      basicContent.push(
        <div key="arrow">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={element.props?.arrow !== false}
              onChange={(e) => updateProps('arrow', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-medium text-gray-700">显示箭头</span>
          </label>
          <p className="text-xs text-gray-500 ml-6 mt-0.5">是否显示Popover的箭头指示器</p>
        </div>
      )
      break

    // 其他组件类型的处理可以继续添加...
    // 为了简化，这里只展示几个示例
    default:
      break
  }

  return <TabsContent value="basic" className="mt-0 p-4 space-y-4">{basicContent}</TabsContent>
}

