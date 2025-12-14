'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import { PanelProps } from './types'

interface ContainerPanelProps extends PanelProps {
  handleTypeChange?: (newType: any) => void
}

export function ContainerPanel({ 
  element, 
  updateStyle
}: ContainerPanelProps) {
  // 直接从 style 中读取 flex 相关属性
  const display = element.style?.display || ''
  const flexDirection = element.style?.flexDirection || ''
  const justifyContent = element.style?.justifyContent || ''
  const alignItems = element.style?.alignItems || ''
  const flexWrap = element.style?.flexWrap || ''
  const gap = element.style?.gap || ''
  
  // Flex 数值属性（当容器作为 flex 子元素时使用）
  const flex = element.style?.flex || ''
  const flexGrow = element.style?.flexGrow || ''
  const flexShrink = element.style?.flexShrink || ''
  const flexBasis = element.style?.flexBasis || ''

  return (
    <TabsContent value="basic" className="mt-0 p-4 space-y-4">
      {/* 容器类型 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">元素类型</label>
        <div className="text-sm text-gray-600">容器 (Container)</div>
        <p className="text-xs text-gray-500 mt-1">用于包裹其他组件的容器</p>
      </div>

      {/* Flex 布局设置 */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">Flex 布局设置</h3>
        <div className="space-y-3">
          {/* Display */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Display</label>
            <select
              value={display}
              onChange={(e) => updateStyle('display', e.target.value || undefined)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
            >
              <option value="">默认</option>
              <option value="flex">flex</option>
              <option value="inline-flex">inline-flex</option>
            </select>
          </div>

          {/* Flex 方向 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">方向 (flex-direction)</label>
            <select
              value={flexDirection}
              onChange={(e) => updateStyle('flexDirection', e.target.value || undefined)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
            >
              <option value="">默认</option>
              <option value="row">row (横向)</option>
              <option value="column">column (纵向)</option>
              <option value="row-reverse">row-reverse (横向反向)</option>
              <option value="column-reverse">column-reverse (纵向反向)</option>
            </select>
          </div>

          {/* 换行 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">换行 (flex-wrap)</label>
            <select
              value={flexWrap}
              onChange={(e) => updateStyle('flexWrap', e.target.value || undefined)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
            >
              <option value="">默认</option>
              <option value="nowrap">nowrap (不换行)</option>
              <option value="wrap">wrap (换行)</option>
              <option value="wrap-reverse">wrap-reverse (反向换行)</option>
            </select>
          </div>

          {/* 主轴对齐 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">主轴对齐 (justify-content)</label>
            <select
              value={justifyContent}
              onChange={(e) => updateStyle('justifyContent', e.target.value || undefined)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
            >
              <option value="">默认</option>
              <option value="flex-start">flex-start (起始)</option>
              <option value="flex-end">flex-end (末尾)</option>
              <option value="center">center (居中)</option>
              <option value="space-between">space-between (两端对齐)</option>
              <option value="space-around">space-around (环绕)</option>
              <option value="space-evenly">space-evenly (均匀分布)</option>
            </select>
          </div>

          {/* 交叉轴对齐 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">交叉轴对齐 (align-items)</label>
            <select
              value={alignItems}
              onChange={(e) => updateStyle('alignItems', e.target.value || undefined)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
            >
              <option value="">默认</option>
              <option value="flex-start">flex-start (起始)</option>
              <option value="flex-end">flex-end (末尾)</option>
              <option value="center">center (居中)</option>
              <option value="baseline">baseline (基线)</option>
              <option value="stretch">stretch (拉伸)</option>
            </select>
          </div>

          {/* 间距 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">间距 (gap)</label>
            <input
              type="text"
              value={gap}
              onChange={(e) => {
                const newValue = e.target.value || undefined
                updateStyle('gap', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 8px 或 16px 8px"
            />
            <p className="text-xs text-gray-500 mt-1">设置 flex 子元素之间的间距</p>
          </div>
        </div>
      </div>

      {/* Flex 数值设置（当容器作为 flex 子元素时使用） */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">Flex 数值设置</h3>
        <p className="text-xs text-gray-500 mb-3">当容器作为另一个 flex 容器的子元素时，可以设置这些属性</p>
        <div className="space-y-3">
          {/* Flex 简写 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Flex (简写)</label>
            <input
              type="text"
              value={flex}
              onChange={(e) => {
                const newValue = e.target.value || undefined
                updateStyle('flex', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 1 或 1 1 auto 或 0 0 200px"
            />
            <p className="text-xs text-gray-500 mt-1">格式: flex-grow flex-shrink flex-basis</p>
          </div>

          {/* Flex Grow */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Flex Grow</label>
            <input
              type="number"
              value={flexGrow}
              onChange={(e) => {
                const newValue = e.target.value || undefined
                updateStyle('flexGrow', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 1"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">定义 flex 项目的放大比例，默认为 0</p>
          </div>

          {/* Flex Shrink */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Flex Shrink</label>
            <input
              type="number"
              value={flexShrink}
              onChange={(e) => {
                const newValue = e.target.value || undefined
                updateStyle('flexShrink', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 1"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">定义 flex 项目的缩小比例，默认为 1</p>
          </div>

          {/* Flex Basis */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Flex Basis</label>
            <input
              type="text"
              value={flexBasis}
              onChange={(e) => {
                const newValue = e.target.value || undefined
                updateStyle('flexBasis', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: auto 或 200px 或 30%"
            />
            <p className="text-xs text-gray-500 mt-1">定义 flex 项目在分配多余空间之前的主轴空间，默认为 auto</p>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

