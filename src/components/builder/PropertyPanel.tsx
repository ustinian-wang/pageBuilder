'use client'

import React, { useState } from 'react'
import { Element, ElementType } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  UserAddOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileOutlined,
  FolderOutlined,
  FileAddOutlined,
  FileTextOutlined,
  PictureOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  NotificationOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  ShareAltOutlined,
  ReloadOutlined,
  SyncOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'

// 图标映射表
const iconMap: Record<string, React.ComponentType<any>> = {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  UserAddOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileOutlined,
  FolderOutlined,
  FileAddOutlined,
  FileTextOutlined,
  PictureOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  NotificationOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  ShareAltOutlined,
  ReloadOutlined,
  SyncOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
}

// 图标选项配置
const iconOptions = [
  { value: '', label: '无图标', group: '' },
  { value: 'SearchOutlined', label: '搜索', group: '常用操作', icon: SearchOutlined },
  { value: 'EditOutlined', label: '编辑', group: '常用操作', icon: EditOutlined },
  { value: 'DeleteOutlined', label: '删除', group: '常用操作', icon: DeleteOutlined },
  { value: 'SaveOutlined', label: '保存', group: '常用操作', icon: SaveOutlined },
  { value: 'DownloadOutlined', label: '下载', group: '常用操作', icon: DownloadOutlined },
  { value: 'UploadOutlined', label: '上传', group: '常用操作', icon: UploadOutlined },
  { value: 'PlusOutlined', label: '添加', group: '常用操作', icon: PlusOutlined },
  { value: 'MinusOutlined', label: '减少', group: '常用操作', icon: MinusOutlined },
  { value: 'CheckOutlined', label: '确认', group: '常用操作', icon: CheckOutlined },
  { value: 'CloseOutlined', label: '关闭', group: '常用操作', icon: CloseOutlined },
  { value: 'UserOutlined', label: '用户', group: '用户相关', icon: UserOutlined },
  { value: 'UserAddOutlined', label: '添加用户', group: '用户相关', icon: UserAddOutlined },
  { value: 'TeamOutlined', label: '团队', group: '用户相关', icon: TeamOutlined },
  { value: 'SettingOutlined', label: '设置', group: '用户相关', icon: SettingOutlined },
  { value: 'LogoutOutlined', label: '退出', group: '用户相关', icon: LogoutOutlined },
  { value: 'HomeOutlined', label: '首页', group: '导航', icon: HomeOutlined },
  { value: 'MenuOutlined', label: '菜单', group: '导航', icon: MenuOutlined },
  { value: 'ArrowLeftOutlined', label: '左箭头', group: '导航', icon: ArrowLeftOutlined },
  { value: 'ArrowRightOutlined', label: '右箭头', group: '导航', icon: ArrowRightOutlined },
  { value: 'ArrowUpOutlined', label: '上箭头', group: '导航', icon: ArrowUpOutlined },
  { value: 'ArrowDownOutlined', label: '下箭头', group: '导航', icon: ArrowDownOutlined },
  { value: 'FileOutlined', label: '文件', group: '文件', icon: FileOutlined },
  { value: 'FolderOutlined', label: '文件夹', group: '文件', icon: FolderOutlined },
  { value: 'FileAddOutlined', label: '添加文件', group: '文件', icon: FileAddOutlined },
  { value: 'FileTextOutlined', label: '文本文件', group: '文件', icon: FileTextOutlined },
  { value: 'PictureOutlined', label: '图片', group: '文件', icon: PictureOutlined },
  { value: 'MailOutlined', label: '邮件', group: '通信', icon: MailOutlined },
  { value: 'MessageOutlined', label: '消息', group: '通信', icon: MessageOutlined },
  { value: 'PhoneOutlined', label: '电话', group: '通信', icon: PhoneOutlined },
  { value: 'NotificationOutlined', label: '通知', group: '通信', icon: NotificationOutlined },
  { value: 'HeartOutlined', label: '收藏', group: '其他', icon: HeartOutlined },
  { value: 'StarOutlined', label: '星标', group: '其他', icon: StarOutlined },
  { value: 'LikeOutlined', label: '点赞', group: '其他', icon: LikeOutlined },
  { value: 'ShareAltOutlined', label: '分享', group: '其他', icon: ShareAltOutlined },
  { value: 'ReloadOutlined', label: '刷新', group: '其他', icon: ReloadOutlined },
  { value: 'SyncOutlined', label: '同步', group: '其他', icon: SyncOutlined },
  { value: 'LoadingOutlined', label: '加载中', group: '其他', icon: LoadingOutlined },
  { value: 'InfoCircleOutlined', label: '信息', group: '其他', icon: InfoCircleOutlined },
  { value: 'QuestionCircleOutlined', label: '帮助', group: '其他', icon: QuestionCircleOutlined },
  { value: 'WarningOutlined', label: '警告', group: '其他', icon: WarningOutlined },
]

// Ant Design 组件列表（用于类型切换）
const antdComponentTypes: Array<{ type: ElementType; label: string; icon: string }> = [
  { type: 'a-button', label: 'Button', icon: '🔘' },
  { type: 'a-input', label: 'Input', icon: '📥' },
  { type: 'a-card', label: 'Card', icon: '🎴' },
  { type: 'a-form', label: 'Form', icon: '📋' },
  { type: 'a-table', label: 'Table', icon: '📊' },
  { type: 'a-select', label: 'Select', icon: '📋' },
  { type: 'a-datepicker', label: 'DatePicker', icon: '📅' },
  { type: 'a-radio', label: 'Radio', icon: '🔘' },
  { type: 'a-checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'a-switch', label: 'Switch', icon: '🔀' },
  { type: 'a-slider', label: 'Slider', icon: '🎚️' },
  { type: 'a-rate', label: 'Rate', icon: '⭐' },
  { type: 'a-tag', label: 'Tag', icon: '🏷️' },
  { type: 'a-badge', label: 'Badge', icon: '🔖' },
  { type: 'a-avatar', label: 'Avatar', icon: '👤' },
  { type: 'a-divider', label: 'Divider', icon: '➖' },
  { type: 'a-space', label: 'Space', icon: '↔️' },
  { type: 'a-row', label: 'Row', icon: '➡️' },
  { type: 'a-col', label: 'Col', icon: '⬇️' },
  { type: 'a-layout', label: 'Layout', icon: '📐' },
  { type: 'a-menu', label: 'Menu', icon: '📑' },
  { type: 'a-tabs', label: 'Tabs', icon: '📑' },
  { type: 'a-collapse', label: 'Collapse', icon: '📂' },
  { type: 'a-timeline', label: 'Timeline', icon: '⏱️' },
  { type: 'a-list', label: 'List', icon: '📋' },
  { type: 'a-empty', label: 'Empty', icon: '📭' },
  { type: 'a-spin', label: 'Spin', icon: '🌀' },
  { type: 'a-alert', label: 'Alert', icon: '⚠️' },
]

// 获取 Ant Design 组件的默认属性
function getAntdDefaultProps(type: ElementType): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    'a-button': { text: 'Button', type: 'default' },
    'a-input': { placeholder: '请输入' },
    'a-card': { title: 'Card Title' },
    'a-form': {},
    'a-select': { placeholder: '请选择' },
    'a-datepicker': {},
    'a-radio': { label: 'Radio' },
    'a-checkbox': { label: 'Checkbox' },
    'a-switch': {},
    'a-slider': {},
    'a-rate': {},
    'a-tag': { text: 'Tag' },
    'a-badge': { count: 0 },
    'a-avatar': {},
    'a-divider': {},
    'a-space': {},
    'a-row': {},
    'a-col': { span: 12 },
    'a-layout': {},
    'a-menu': {},
    'a-tabs': {},
    'a-collapse': {},
    'a-timeline': {},
    'a-list': {},
    'a-empty': {},
    'a-spin': {},
    'a-alert': { message: 'Alert', type: 'info' },
  }
  return defaults[type] || {}
}

// 判断是否为 Ant Design 组件
function isAntdComponent(type: ElementType): boolean {
  return type.startsWith('a-')
}

// 图标选择器组件
function IconSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = iconOptions.find(opt => opt.value === value)

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1">图标（可选）</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-left flex items-center justify-between hover:border-gray-400"
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon ? (
            <>
              {React.createElement(selectedOption.icon, { className: 'text-base' })}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-gray-400">无图标</span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-80 overflow-y-auto">
            {/* 无图标选项 */}
            <button
              type="button"
              onClick={() => {
                onChange('')
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 ${
                value === '' ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span className="text-gray-400">无图标</span>
              {value === '' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-auto text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            
            {/* 分组显示图标 */}
            {['常用操作', '用户相关', '导航', '文件', '通信', '其他'].map((group) => {
              const groupOptions = iconOptions.filter(opt => opt.group === group)
              if (groupOptions.length === 0) return null
              
              return (
                <React.Fragment key={group}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t border-b border-gray-200">
                    {group}
                  </div>
                  {groupOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value)
                        setIsOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 ${
                        value === option.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {option.icon && React.createElement(option.icon, { className: 'text-base' })}
                      <span>{option.label}</span>
                      {value === option.value && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-auto text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </React.Fragment>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

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

  // Ant Design 组件类型切换处理器
  const handleTypeChange = (newType: ElementType) => {
    if (newType === element.type) return
    
    // 保留 style 和 className，重置 props 为新类型的默认值
    const defaultProps = getAntdDefaultProps(newType)
    onUpdate({
      type: newType,
      props: defaultProps,
      // 保留 style 和 className
      style: element.style,
      className: element.className,
    })
  }

  // Ant Design Button 组件的特殊处理
  if (element.type === 'a-button') {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full" data-property-panel>
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-700">属性面板</h2>
        </div>
        <Tabs defaultValue="basic" className="flex flex-col flex-1 min-h-0">
          <div className="px-4 pt-4 border-b border-gray-200 flex-shrink-0">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">
                基础设置
              </TabsTrigger>
              <TabsTrigger value="style" className="flex-1">
                样式设置
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="basic" className="mt-0 p-4 space-y-4">
              {/* 组件类型切换 */}
              <div>
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

              {/* 按钮文本 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">按钮文本</label>
                <input
                  type="text"
                  value={element.props?.text || element.props?.children || ''}
                  onChange={(e) => updateProps('text', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="请输入按钮文本"
                />
              </div>

              {/* 按钮类型 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">按钮类型</label>
                <select
                  value={element.props?.type || 'default'}
                  onChange={(e) => updateProps('type', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="default">默认 (default)</option>
                  <option value="primary">主要 (primary)</option>
                  <option value="dashed">虚线 (dashed)</option>
                  <option value="text">文本 (text)</option>
                  <option value="link">链接 (link)</option>
                </select>
              </div>

              {/* 按钮大小 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">按钮大小</label>
                <select
                  value={element.props?.size || 'middle'}
                  onChange={(e) => updateProps('size', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="large">大 (large)</option>
                  <option value="middle">中 (middle)</option>
                  <option value="small">小 (small)</option>
                </select>
              </div>

              {/* 按钮形状 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">按钮形状</label>
                <select
                  value={element.props?.shape || 'default'}
                  onChange={(e) => updateProps('shape', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="default">默认</option>
                  <option value="circle">圆形</option>
                  <option value="round">圆角</option>
                </select>
              </div>

              {/* 危险按钮 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props?.danger === true}
                    onChange={(e) => updateProps('danger', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">危险按钮</span>
                </label>
              </div>

              {/* 禁用 */}
              <div>
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

              {/* 加载中 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props?.loading === true}
                    onChange={(e) => updateProps('loading', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">加载中</span>
                </label>
              </div>

              {/* 块级按钮 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props?.block === true}
                    onChange={(e) => updateProps('block', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">块级按钮（占满整行）</span>
                </label>
              </div>

              {/* 图标 */}
              <IconSelector
                value={element.props?.icon || ''}
                onChange={(value) => updateProps('icon', value || undefined)}
              />
            </TabsContent>

            <TabsContent value="style" className="mt-0 p-4 space-y-4">
              {/* 样式属性 */}
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">文字颜色</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={element.style?.color || '#000000'}
                        onChange={(e) => updateStyle('color', e.target.value)}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={element.style?.color || ''}
                        onChange={(e) => updateStyle('color', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="#000000"
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
                      placeholder="例如: 1px solid #ccc"
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
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    )
  }

  // 如果是 Ant Design 组件，添加类型切换器
  const showAntdTypeSelector = isAntdComponent(element.type)

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-4" data-property-panel>
      <h2 className="text-sm font-semibold text-gray-700 mb-4">属性面板</h2>
      <div className="space-y-4">
        {/* 基本信息 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">元素类型</label>
          {showAntdTypeSelector ? (
            <>
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
            </>
          ) : (
            <div className="text-sm text-gray-600">{element.type}</div>
          )}
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

        {/* 容器特有属性（支持嵌套容器） */}
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
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">间距 (gap)</label>
                    <input
                      type="text"
                      value={element.props?.gap || ''}
                      onChange={(e) => {
                        const value = e.target.value.trim()
                        // 允许空值、纯数字或带单位的CSS值（如 "10", "10px", "1.5rem", "0.5em", "2%" 等）
                        if (value === '' || /^(\d+(\.\d+)?)(px|rem|em|%|vh|vw)?$/.test(value) || /^\d+$/.test(value)) {
                          updateProps('gap', value)
                        }
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="例如: 10, 10px, 1rem, 0.5em"
                    />
                    <p className="text-xs text-gray-500 mt-0.5">
                      子元素之间的间距，支持 px、rem、em、% 等单位，或纯数字（默认px）
                    </p>
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

            {/* 容器专用样式（支持嵌套容器，容器的容器也可以设置这些样式） */}
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

