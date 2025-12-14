'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import { PanelProps } from './types'

interface StylePanelProps extends PanelProps {
  isTable?: boolean
}

export function StylePanel({ element, updateStyle, onUpdate, isTable = false }: StylePanelProps) {
  if (isTable) {
    return (
      <TabsContent value="style" className="mt-0 p-4 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2">表格容器样式</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">类名</label>
              <input
                type="text"
                value={element.className || ''}
                onChange={(e) => onUpdate({ className: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: p-4 bg-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">宽度</label>
              <input
                type="text"
                value={element.style?.width || ''}
                onChange={(e) => updateStyle('width', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: 100% 或 800px"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">高度</label>
              <input
                type="text"
                value={element.style?.height || ''}
                onChange={(e) => updateStyle('height', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: auto 或 400px"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">内边距</label>
              <input
                type="text"
                value={element.style?.padding || ''}
                onChange={(e) => updateStyle('padding', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: 16px"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">外边距</label>
              <input
                type="text"
                value={element.style?.margin || ''}
                onChange={(e) => updateStyle('margin', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: 16px"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">背景颜色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={element.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={element.style?.backgroundColor || ''}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="#ffffff 或 transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">边框</label>
              <input
                type="text"
                value={element.style?.border || ''}
                onChange={(e) => updateStyle('border', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: 1px solid #e8e8e8"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">圆角</label>
              <input
                type="text"
                value={element.style?.borderRadius || ''}
                onChange={(e) => updateStyle('borderRadius', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: 4px"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">阴影</label>
              <input
                type="text"
                value={element.style?.boxShadow || ''}
                onChange={(e) => updateStyle('boxShadow', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: 0 2px 8px rgba(0,0,0,0.15)"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">表格样式提示</h3>
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800 mb-2">
              <strong>提示：</strong>表格的样式可以通过以下方式设置：
            </p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>使用 <code className="bg-blue-100 px-1 rounded">className</code> 添加 Tailwind CSS 类名</li>
              <li>使用内联样式设置容器样式（上方设置）</li>
              <li>表格内部样式（表头、行等）需要在属性面板中配置</li>
            </ul>
          </div>
        </div>
      </TabsContent>
    )
  }

  return (
    <TabsContent value="style" className="mt-0 p-4 space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2">样式</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">类名</label>
            <input
              type="text"
              value={element.className || ''}
              onChange={(e) => onUpdate({ className: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: p-4 bg-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">宽度</label>
            <input
              type="text"
              value={element.style?.width || ''}
              onChange={(e) => updateStyle('width', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 100px 或 100%"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">高度</label>
            <input
              type="text"
              value={element.style?.height || ''}
              onChange={(e) => updateStyle('height', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 100px 或 auto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">内边距</label>
            <input
              type="text"
              value={element.style?.padding || ''}
              onChange={(e) => updateStyle('padding', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 16px"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">外边距</label>
            <input
              type="text"
              value={element.style?.margin || ''}
              onChange={(e) => updateStyle('margin', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 16px"
            />
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

