'use client'

import React from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import { PanelProps } from './types'
import type { Element as PageElement } from '@/lib/types'
import { LayoutExample } from './LayoutExample'

interface ContainerPanelProps extends PanelProps {
  handleTypeChange?: (newType: any) => void
}

export function ContainerPanel({ 
  element, 
  updateStyle,
  onUpdate
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

  // 判断是否为 layout 组件
  const isLayout = element.type === 'layout'

  // 布局快捷选项处理
  const handleLayoutPreset = (preset: string) => {
    if (!isLayout || !element.children || element.children.length < 2) return

    const updates: Partial<PageElement> = {
      style: {
        ...element.style,
        display: 'flex',
        padding: (element.style?.padding as string) || '8px',
      },
      children: [...element.children],
    }

    switch (preset) {
      case 'top-fixed':
        // 纵向布局：上方固定，下方自动填充
        updates.style = {
          ...updates.style,
          flexDirection: 'column',
        } as Record<string, string | number>
        if (updates.children) {
          updates.children = updates.children.map((child: PageElement, index: number) => {
            if (index === 0) {
              // 第一个子元素固定高度
              return {
                ...child,
                style: {
                  ...(child.style || {}),
                  flex: '0 0 auto',
                  width: '100%',
                  height: '122px',
                } as Record<string, string | number>,
              }
            } else {
              // 第二个子元素自动填充
              const newStyle = { ...(child.style || {}) } as Record<string, string | number>
              newStyle.flex = '1 1 auto'
              delete newStyle.height
              return {
                ...child,
                width: '100%',
                style: Object.keys(newStyle).length > 0 ? newStyle : undefined,
              }
            }
          })
        }
        break

      case 'bottom-fixed':
        // 纵向布局：上方自动填充，下方固定
        updates.style = {
          ...updates.style,
          flexDirection: 'column',
        } as Record<string, string | number>
        if (updates.children) {
          updates.children = updates.children.map((child: PageElement, index: number) => {
            if (index === 0) {
              // 第一个子元素自动填充
              const newStyle = { ...(child.style || {}) } as Record<string, string | number>
              newStyle.flex = '1 1 auto'
              delete newStyle.height
              return {
                ...child,
                width: '100%',
                style: Object.keys(newStyle).length > 0 ? newStyle : undefined,
              }
            } else {
              // 第二个子元素固定高度
              return {
                ...child,
                style: {
                  ...(child.style || {}),
                  flex: '0 0 auto',
                  width: '100%',
                  height: '122px',
                } as Record<string, string | number>,
              }
            }
          })
        }
        break

      case 'left-fixed':
        // 横向布局：左边固定，右边自动填充
        updates.style = {
          ...updates.style,
          flexDirection: 'row',
        } as Record<string, string | number>
        if (updates.children) {
          updates.children = updates.children.map((child: PageElement, index: number) => {
            if (index === 0) {
              // 第一个子元素固定宽度
              return {
                ...child,
                style: {
                  ...(child.style || {}),
                  flex: '0 0 auto',
                  height: '100%',
                  width: '122px',
                } as Record<string, string | number>,
              }
            } else {
              // 第二个子元素自动填充
              const newStyle = { ...(child.style || {}) } as Record<string, string | number>
              newStyle.flex = '1 1 auto'
              delete newStyle.width
              return {
                ...child,
                height: '100%',
                width: 'auto',
                style: Object.keys(newStyle).length > 0 ? newStyle : undefined,
              }
            }
          })
        }
        break

      case 'right-fixed':
        // 横向布局：左边自动填充，右边固定
        updates.style = {
          ...updates.style,
          flexDirection: 'row',
        } as Record<string, string | number>
        if (updates.children) {
          updates.children = updates.children.map((child: PageElement, index: number) => {
            if (index === 0) {
              // 第一个子元素自动填充
              const newStyle = { ...(child.style || {}) } as Record<string, string | number>
              newStyle.flex = '1 1 auto'
              delete newStyle.width
              return {
                ...child,
                height: '100%',
                style: Object.keys(newStyle).length > 0 ? newStyle : undefined,
                width: 'auto',
              }
            } else {
              // 第二个子元素固定宽度
              return {
                ...child,
                style: {
                  ...(child.style || {}),
                  flex: '0 0 auto',
                  height: '100%',
                  width: '122px',
                } as Record<string, string | number>,
              }
            }
          })
        }
        break
    }

    onUpdate(updates)
  }

  // 检测当前布局类型
  const getCurrentLayoutPreset = (): string => {
    if (!isLayout) return ''
    const dir = element.style?.flexDirection || 'row'
    
    if (element.children && element.children.length >= 2) {
      const firstChild = element.children[0]
      const secondChild = element.children[1]
      const firstFlex = firstChild.style?.flex
      const secondFlex = secondChild.style?.flex
      
      const firstFlexStr = String(firstFlex || '')
      const secondFlexStr = String(secondFlex || '')
      
      if (dir === 'column') {
        // 纵向布局：检测上方固定或下方固定
        if (firstFlexStr === '0 0 auto' || (firstChild.style?.height && !firstFlexStr.includes('1'))) {
          return 'top-fixed'
        }
        if (secondFlexStr === '0 0 auto' || (secondChild.style?.height && !secondFlexStr.includes('1'))) {
          return 'bottom-fixed'
        }
        return 'column'
      } else {
        // 横向布局：检测左侧固定或右侧固定
        if (firstFlexStr === '0 0 auto' || (firstChild.style?.width && !firstFlexStr.includes('1'))) {
          return 'left-fixed'
        }
        if (secondFlexStr === '0 0 auto' || (secondChild.style?.width && !secondFlexStr.includes('1'))) {
          return 'right-fixed'
        }
      }
    }
    
    return dir === 'column' ? 'column' : 'row'
  }

  const currentLayoutPreset = getCurrentLayoutPreset()

  // 获取当前固定元素的宽度/高度值
  const getFixedSize = (): string => {
    if (!isLayout || !element.children || element.children.length < 2) return ''
    
    if (currentLayoutPreset === 'top-fixed') {
      // 纵向布局：上方固定
      const firstChild = element.children[0]
      return String(firstChild.style?.height || '122px')
    } else if (currentLayoutPreset === 'bottom-fixed') {
      // 纵向布局：下方固定
      const secondChild = element.children[1]
      return String(secondChild.style?.height || '122px')
    } else if (currentLayoutPreset === 'left-fixed') {
      // 横向布局：左边固定
      const firstChild = element.children[0]
      return String(firstChild.style?.width || '122px')
    } else if (currentLayoutPreset === 'right-fixed') {
      // 横向布局：右边固定
      const secondChild = element.children[1]
      return String(secondChild.style?.width || '122px')
    }
    
    return ''
  }

  // 更新固定元素的宽度/高度
  const handleFixedSizeChange = (value: string) => {
    if (!isLayout || !element.children || element.children.length < 2) return
    
    const updates: Partial<PageElement> = {
      children: [...element.children],
    }
    
    if (currentLayoutPreset === 'top-fixed') {
      // 更新第一个子元素（上方固定高度）
      const firstChild = element.children[0]
      updates.children![0] = {
        ...firstChild,
        style: {
          ...(firstChild.style || {}),
          height: value || '122px',
        } as Record<string, string | number>,
      }
    } else if (currentLayoutPreset === 'bottom-fixed') {
      // 更新第二个子元素（下方固定高度）
      const secondChild = element.children[1]
      updates.children![1] = {
        ...secondChild,
        style: {
          ...(secondChild.style || {}),
          height: value || '122px',
        } as Record<string, string | number>,
      }
    } else if (currentLayoutPreset === 'left-fixed') {
      // 更新第一个子元素（左边固定宽度）
      const firstChild = element.children[0]
      updates.children![0] = {
        ...firstChild,
        style: {
          ...(firstChild.style || {}),
          width: value || '122px',
        } as Record<string, string | number>,
      }
    } else if (currentLayoutPreset === 'right-fixed') {
      // 更新第二个子元素（右边固定宽度）
      const secondChild = element.children[1]
      updates.children![1] = {
        ...secondChild,
        style: {
          ...(secondChild.style || {}),
          width: value || '122px',
        } as Record<string, string | number>,
      }
    }
    
    onUpdate(updates)
  }

  const fixedSize = getFixedSize()
  const showFixedSizeInput = isLayout && (
    currentLayoutPreset === 'left-fixed' || 
    currentLayoutPreset === 'right-fixed' ||
    currentLayoutPreset === 'top-fixed' ||
    currentLayoutPreset === 'bottom-fixed'
  )
  
  // 根据布局类型确定尺寸标签和占位符
  const getSizeLabel = (): string => {
    if (currentLayoutPreset === 'top-fixed' || currentLayoutPreset === 'bottom-fixed') {
      return '固定高度'
    } else {
      return '固定宽度'
    }
  }
  
  const sizeLabel = getSizeLabel()
  const sizePlaceholder = (currentLayoutPreset === 'top-fixed' || currentLayoutPreset === 'bottom-fixed')
    ? '例如: 122px 或 30%'
    : '例如: 122px 或 30%'

  return (
    <TabsContent value="basic" className="mt-0 p-4 space-y-4">
      {/* 容器类型 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">元素类型</label>
        <div className="text-sm text-gray-600">
          {isLayout ? '布局 (Layout)' : '容器 (Container)'}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isLayout ? '布局容器，包含两个子容器，允许添加模块' : '用于包裹其他组件的容器'}
        </p>
      </div>

      {/* Layout 布局快捷选项 */}
      {isLayout && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-3">布局快捷选项</h3>
          <div className="w-full flex flex-row justify-between gap-2">
            <LayoutExample active={currentLayoutPreset === 'top-fixed'} type="top-fixed" onClick={() => handleLayoutPreset('top-fixed')} />
            <LayoutExample active={currentLayoutPreset === 'bottom-fixed'} type="bottom-fixed" onClick={() => handleLayoutPreset('bottom-fixed')} />
            <LayoutExample active={currentLayoutPreset === 'left-fixed'} type="left-fixed" onClick={() => handleLayoutPreset('left-fixed')} />
            <LayoutExample active={currentLayoutPreset === 'right-fixed'} type="right-fixed" onClick={() => handleLayoutPreset('right-fixed')} />
          </div>
          
          {/* 固定宽度/高度设置 */}
          {showFixedSizeInput && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {currentLayoutPreset === 'top-fixed'
                  ? '上方容器固定高度'
                  : currentLayoutPreset === 'bottom-fixed'
                  ? '下方容器固定高度'
                  : currentLayoutPreset === 'left-fixed'
                  ? '左侧容器固定宽度'
                  : '右侧容器固定宽度'
                }
              </label>
              <input
                type="text"
                value={fixedSize}
                onChange={(e) => handleFixedSizeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={sizePlaceholder}
              />
              <p className="text-xs text-gray-500 mt-1">
                设置固定{sizeLabel}，支持 px、%、vh、vw 等单位
              </p>
            </div>
          )}
        </div>
      )}

      {/* Flex 布局设置 */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">Flex 布局设置</h3>
        <div className="space-y-3">
          {/* Display */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Display</label>
            <select
              value={display}
              onChange={(e) => {
                const value = e.target.value
                updateStyle('display', value || '')
              }}
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
              onChange={(e) => {
                const value = e.target.value
                updateStyle('flexDirection', value || '')
              }}
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
              onChange={(e) => {
                const value = e.target.value
                updateStyle('flexWrap', value || '')
              }}
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
              onChange={(e) => {
                const value = e.target.value
                updateStyle('justifyContent', value || '')
              }}
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
              onChange={(e) => {
                const value = e.target.value
                updateStyle('alignItems', value || '')
              }}
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
                const newValue = e.target.value || ''
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
                const newValue = e.target.value || ''
                updateStyle('flex', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 1 或 1 1 auto 或 0 0 122px"
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
                const newValue = e.target.value || ''
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
                const newValue = e.target.value || ''
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
                const newValue = e.target.value || ''
                updateStyle('flexBasis', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: auto 或 122px 或 30%"
            />
            <p className="text-xs text-gray-500 mt-1">定义 flex 项目在分配多余空间之前的主轴空间，默认为 auto</p>
          </div>
        </div>
      </div>

      {/* 容器样式设置 */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">容器样式设置</h3>
        <div className="space-y-3">
          {/* 背景颜色 */}
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
                onChange={(e) => {
                  const value = e.target.value.trim()
                  // 如果输入为空，设置为 undefined，这样会使用默认的白色背景
                  updateStyle('backgroundColor', value || '')
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="#ffffff (默认白色)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">设置容器的背景颜色，默认为白色。留空则使用默认值</p>
          </div>

          {/* 圆角 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">圆角 (border-radius)</label>
            <input
              type="text"
              value={element.style?.borderRadius || ''}
              onChange={(e) => {
                const value = e.target.value
                updateStyle('borderRadius', value || '')
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 4px 或 8px 或 50%"
            />
            <p className="text-xs text-gray-500 mt-1">设置容器的圆角大小</p>
          </div>

          {/* 边框 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">边框</label>
            <input
              type="text"
              value={element.style?.border || ''}
              onChange={(e) => {
                const value = e.target.value
                updateStyle('border', value || '')
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 1px solid #e8e8e8"
            />
            <p className="text-xs text-gray-500 mt-1">设置容器的边框样式</p>
          </div>

          {/* 阴影 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">阴影 (box-shadow)</label>
            <input
              type="text"
              value={element.style?.boxShadow || ''}
              onChange={(e) => {
                const value = e.target.value
                updateStyle('boxShadow', value || '')
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 0 2px 8px rgba(0,0,0,0.15)"
            />
            <p className="text-xs text-gray-500 mt-1">设置容器的阴影效果</p>
          </div>

          {/* 内边距 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">内边距 (padding)</label>
            <input
              type="text"
              value={element.style?.padding || ''}
              onChange={(e) => {
                const value = e.target.value
                updateStyle('padding', value || '')
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 16px 或 16px 8px"
            />
            <p className="text-xs text-gray-500 mt-1">设置容器的内边距</p>
          </div>

          {/* 外边距 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">外边距 (margin)</label>
            <input
              type="text"
              value={element.style?.margin || ''}
              onChange={(e) => {
                const value = e.target.value
                updateStyle('margin', value || '')
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 16px 或 16px 8px"
            />
            <p className="text-xs text-gray-500 mt-1">设置容器的外边距</p>
          </div>

          {/* 最小宽度 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">最小宽度 (min-width)</label>
            <input
              type="text"
              value={element.style?.minWidth || ''}
              onChange={(e) => {
                const value = e.target.value
                updateStyle('minWidth', value || '')
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 100px 或 50%"
            />
            <p className="text-xs text-gray-500 mt-1">设置容器的最小宽度</p>
          </div>

          {/* 最小高度 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">最小高度 (min-height)</label>
            <input
              type="text"
              value={element.style?.minHeight || ''}
              onChange={(e) => {
                const value = e.target.value
                updateStyle('minHeight', value || '')
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="例如: 100px 或 50vh"
            />
            <p className="text-xs text-gray-500 mt-1">设置容器的最小高度</p>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

