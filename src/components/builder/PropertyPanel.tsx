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

        {/* 容器特有属性 */}
        {element.type === 'container' && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">布局设置</h3>
            <div className="space-y-2">
              <div>
                <label className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={element.props?.autoFill === true}
                    onChange={(e) => updateProps('autoFill', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">自动填充（子元素填充整个容器）</span>
                </label>
                <p className="text-xs text-gray-500 ml-6 mt-0.5">
                  启用后，子元素将自动填充容器的宽高（使用 flex 布局）
                </p>
              </div>
              {element.props?.autoFill && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">布局方向</label>
                    <select
                      value={element.props?.flexDirection || 'row'}
                      onChange={(e) => updateProps('flexDirection', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="row">水平（row）</option>
                      <option value="column">垂直（column）</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">水平对齐</label>
                    <select
                      value={element.props?.justifyContent || 'flex-start'}
                      onChange={(e) => updateProps('justifyContent', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="flex-start">左对齐</option>
                      <option value="center">居中</option>
                      <option value="flex-end">右对齐</option>
                      <option value="space-between">两端对齐</option>
                      <option value="space-around">环绕分布</option>
                      <option value="space-evenly">均匀分布</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">垂直对齐</label>
                    <select
                      value={element.props?.alignItems || 'stretch'}
                      onChange={(e) => updateProps('alignItems', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="stretch">拉伸填充</option>
                      <option value="flex-start">顶部对齐</option>
                      <option value="center">居中对齐</option>
                      <option value="flex-end">底部对齐</option>
                      <option value="baseline">基线对齐</option>
                    </select>
                  </div>
                </>
              )}
            </div>
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

            {/* 容器专用样式 */}
            {element.type === 'container' && (
              <>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">背景图片</label>
                  <input
                    type="text"
                    value={element.style?.backgroundImage?.replace(/url\(|\)/g, '') || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      updateStyle('backgroundImage', value ? `url(${value})` : '')
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="图片URL或路径"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">圆角</label>
                  <input
                    type="text"
                    value={element.style?.borderRadius || ''}
                    onChange={(e) => updateStyle('borderRadius', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="例如: 8px 或 50%"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">边框</label>
                  <input
                    type="text"
                    value={element.style?.border || ''}
                    onChange={(e) => updateStyle('border', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="例如: 1px solid #ccc"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">边框颜色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={element.style?.borderColor || '#000000'}
                      onChange={(e) => updateStyle('borderColor', e.target.value)}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={element.style?.borderColor || ''}
                      onChange={(e) => updateStyle('borderColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </>
            )}

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
                placeholder="例如: 16px 或 16px 8px"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">外边距</label>
              <input
                type="text"
                value={element.style?.margin || ''}
                onChange={(e) => updateStyle('margin', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="例如: 16px 或 16px 8px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

