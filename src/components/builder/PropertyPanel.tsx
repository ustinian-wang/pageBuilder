'use client'

import { Element } from '@/lib/types'

interface PropertyPanelProps {
  element: Element | undefined
  onUpdate: (updates: Partial<Element>) => void
}

export function PropertyPanel({ element, onUpdate }: PropertyPanelProps) {
  if (!element) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">属性面板</h2>
        <p className="text-sm text-gray-500">选择一个元素以编辑其属性</p>
      </div>
    )
  }

  const updateProps = (key: string, value: any) => {
    onUpdate({
      props: {
        ...element.props,
        [key]: value,
      },
    })
  }

  const updateStyle = (key: string, value: string) => {
    onUpdate({
      style: {
        ...element.style,
        [key]: value,
      },
    })
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">属性面板</h2>
      <div className="space-y-4">
        {/* 基本信息 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">元素类型</label>
          <div className="text-sm text-gray-600">{element.type}</div>
        </div>

        {/* 通用属性 */}
        {element.type === 'text' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">文本内容</label>
            <input
              type="text"
              value={element.props?.text || ''}
              onChange={(e) => updateProps('text', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        )}

        {element.type === 'button' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">按钮文本</label>
              <input
                type="text"
                value={element.props?.text || ''}
                onChange={(e) => updateProps('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">样式</label>
              <select
                value={element.props?.variant || 'primary'}
                onChange={(e) => updateProps('variant', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="primary">主要</option>
                <option value="secondary">次要</option>
                <option value="danger">危险</option>
              </select>
            </div>
          </>
        )}

        {element.type === 'input' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">占位符</label>
            <input
              type="text"
              value={element.props?.placeholder || ''}
              onChange={(e) => updateProps('placeholder', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        )}

        {element.type === 'image' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">图片地址</label>
              <input
                type="text"
                value={element.props?.src || ''}
                onChange={(e) => updateProps('src', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">替代文本</label>
              <input
                type="text"
                value={element.props?.alt || ''}
                onChange={(e) => updateProps('alt', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </>
        )}

        {element.type === 'heading' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">标题文本</label>
              <input
                type="text"
                value={element.props?.text || ''}
                onChange={(e) => updateProps('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">级别</label>
              <select
                value={element.props?.level || 1}
                onChange={(e) => updateProps('level', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>
            </div>
          </>
        )}

        {element.type === 'paragraph' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">段落文本</label>
            <textarea
              value={element.props?.text || ''}
              onChange={(e) => updateProps('text', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              rows={4}
            />
          </div>
        )}

        {/* 样式属性 */}
        <div className="pt-4 border-t border-gray-200">
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
      </div>
    </div>
  )
}

