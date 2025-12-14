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

    // 其他组件类型的处理可以继续添加...
    // 为了简化，这里只展示几个示例
    default:
      break
  }

  return <TabsContent value="basic" className="mt-0 p-4 space-y-4">{basicContent}</TabsContent>
}

