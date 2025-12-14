'use client'

import React, { useState, useCallback, useEffect } from 'react'
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
  CopyOutlined,
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
    'a-table': {
      columns: [
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '年龄', dataIndex: 'age', key: 'age' },
        { title: '地址', dataIndex: 'address', key: 'address' },
      ],
      dataSource: [
        { key: '1', name: '张三', age: 32, address: '北京市' },
        { key: '2', name: '李四', age: 42, address: '上海市' },
        { key: '3', name: '王五', age: 28, address: '广州市' },
      ],
    },
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
    'a-tabs': { items: [] },
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
  activeTab?: string // 当前激活的标签页
  onTabChange?: (tab: string) => void // 标签页切换回调
}

export function PropertyPanel({ element, onUpdate, activeTab: externalActiveTab, onTabChange }: PropertyPanelProps) {
  // 内部状态管理当前选中的标签页
  const [internalActiveTab, setInternalActiveTab] = useState<string>('basic')
  
  // 使用外部传入的 activeTab，如果没有则使用内部状态
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab
  
  // 处理标签页切换
  const handleTabChange = useCallback((value: string) => {
    if (externalActiveTab === undefined) {
      // 如果没有外部控制，使用内部状态
      setInternalActiveTab(value)
    }
    // 通知外部标签页变化
    if (onTabChange) {
      onTabChange(value)
    }
  }, [externalActiveTab, onTabChange])
  
  // 监听自定义事件，用于从外部切换标签页
  useEffect(() => {
    const handleSwitchTab = (e: CustomEvent) => {
      const { tab, elementId } = e.detail
      // 只有当事件是针对当前元素时才切换
      if (!element || element.id !== elementId) return
      handleTabChange(tab)
    }
    
    window.addEventListener('switchPropertyPanelTab', handleSwitchTab as EventListener)
    return () => {
      window.removeEventListener('switchPropertyPanelTab', handleSwitchTab as EventListener)
    }
  }, [element, handleTabChange])
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

  // Ant Design 组件的通用属性面板
  const renderAntdComponentPanel = () => {
    // Table 专用样式面板（提前定义，确保作用域正确）
    const isTable = element.type === 'a-table'
    const tableStylePanel = isTable ? (
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
        
        {/* 表格样式配置（通过 className 或自定义样式） */}
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
    ) : null

    // 通用样式面板
    const commonStylePanel = (
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

    // 基础设置面板 - 根据组件类型渲染不同内容
    const renderBasicPanel = () => {
      const basicContent = []

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
          // Button 组件已有完整实现，这里不需要重复
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

        case 'a-select':
          basicContent.push(
            <div key="placeholder">
              <label className="block text-xs font-medium text-gray-700 mb-1">占位符</label>
              <input
                type="text"
                value={element.props?.placeholder || ''}
                onChange={(e) => updateProps('placeholder', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="请选择"
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
          basicContent.push(
            <div key="allowClear">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={element.props?.allowClear === true}
                  onChange={(e) => updateProps('allowClear', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">支持清除</span>
              </label>
            </div>
          )
          break

        case 'a-datepicker':
          basicContent.push(
            <div key="placeholder">
              <label className="block text-xs font-medium text-gray-700 mb-1">占位符</label>
              <input
                type="text"
                value={element.props?.placeholder || ''}
                onChange={(e) => updateProps('placeholder', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="请选择日期"
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

        case 'a-radio':
          basicContent.push(
            <div key="label">
              <label className="block text-xs font-medium text-gray-700 mb-1">标签</label>
              <input
                type="text"
                value={element.props?.label || element.props?.children || ''}
                onChange={(e) => updateProps('label', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="请输入标签"
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

        case 'a-checkbox':
          basicContent.push(
            <div key="label">
              <label className="block text-xs font-medium text-gray-700 mb-1">标签</label>
              <input
                type="text"
                value={element.props?.label || element.props?.children || ''}
                onChange={(e) => updateProps('label', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="请输入标签"
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
          basicContent.push(
            <div key="checked">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={element.props?.checked === true}
                  onChange={(e) => updateProps('checked', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">默认选中</span>
              </label>
            </div>
          )
          break

        case 'a-switch':
          basicContent.push(
            <div key="checked">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={element.props?.checked === true}
                  onChange={(e) => updateProps('checked', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">默认开启</span>
              </label>
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

        case 'a-slider':
          basicContent.push(
            <div key="min">
              <label className="block text-xs font-medium text-gray-700 mb-1">最小值</label>
              <input
                type="number"
                value={element.props?.min || 0}
                onChange={(e) => updateProps('min', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          )
          basicContent.push(
            <div key="max">
              <label className="block text-xs font-medium text-gray-700 mb-1">最大值</label>
              <input
                type="number"
                value={element.props?.max || 100}
                onChange={(e) => updateProps('max', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          )
          basicContent.push(
            <div key="defaultValue">
              <label className="block text-xs font-medium text-gray-700 mb-1">默认值</label>
              <input
                type="number"
                value={element.props?.defaultValue || 0}
                onChange={(e) => updateProps('defaultValue', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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

        case 'a-rate':
          basicContent.push(
            <div key="defaultValue">
              <label className="block text-xs font-medium text-gray-700 mb-1">默认值</label>
              <input
                type="number"
                min={0}
                max={5}
                value={element.props?.defaultValue || 0}
                onChange={(e) => updateProps('defaultValue', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          )
          basicContent.push(
            <div key="count">
              <label className="block text-xs font-medium text-gray-700 mb-1">总数</label>
              <input
                type="number"
                min={1}
                value={element.props?.count || 5}
                onChange={(e) => updateProps('count', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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

        case 'a-tag':
          basicContent.push(
            <div key="text">
              <label className="block text-xs font-medium text-gray-700 mb-1">标签文本</label>
              <input
                type="text"
                value={element.props?.text || element.props?.children || ''}
                onChange={(e) => updateProps('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="请输入标签文本"
              />
            </div>
          )
          basicContent.push(
            <div key="color">
              <label className="block text-xs font-medium text-gray-700 mb-1">颜色</label>
              <select
                value={element.props?.color || 'default'}
                onChange={(e) => updateProps('color', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="default">默认</option>
                <option value="success">成功</option>
                <option value="processing">处理中</option>
                <option value="error">错误</option>
                <option value="warning">警告</option>
              </select>
            </div>
          )
          basicContent.push(
            <div key="closable">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={element.props?.closable === true}
                  onChange={(e) => updateProps('closable', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">可关闭</span>
              </label>
            </div>
          )
          break

        case 'a-badge':
          basicContent.push(
            <div key="count">
              <label className="block text-xs font-medium text-gray-700 mb-1">徽标数</label>
              <input
                type="number"
                min={0}
                value={element.props?.count || 0}
                onChange={(e) => updateProps('count', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          )
          basicContent.push(
            <div key="showZero">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={element.props?.showZero === true}
                  onChange={(e) => updateProps('showZero', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">显示零值</span>
              </label>
            </div>
          )
          break

        case 'a-avatar':
          basicContent.push(
            <div key="size">
              <label className="block text-xs font-medium text-gray-700 mb-1">大小</label>
              <select
                value={element.props?.size || 'default'}
                onChange={(e) => updateProps('size', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="small">小</option>
                <option value="default">默认</option>
                <option value="large">大</option>
              </select>
            </div>
          )
          basicContent.push(
            <div key="shape">
              <label className="block text-xs font-medium text-gray-700 mb-1">形状</label>
              <select
                value={element.props?.shape || 'circle'}
                onChange={(e) => updateProps('shape', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="circle">圆形</option>
                <option value="square">方形</option>
              </select>
            </div>
          )
          basicContent.push(
            <div key="src">
              <label className="block text-xs font-medium text-gray-700 mb-1">图片地址</label>
              <input
                type="text"
                value={element.props?.src || ''}
                onChange={(e) => updateProps('src', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="头像图片URL"
              />
            </div>
          )
          basicContent.push(
            <div key="text">
              <label className="block text-xs font-medium text-gray-700 mb-1">文本</label>
              <input
                type="text"
                value={element.props?.text || element.props?.children || ''}
                onChange={(e) => updateProps('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="头像文本"
              />
            </div>
          )
          break

        case 'a-alert':
          basicContent.push(
            <div key="message">
              <label className="block text-xs font-medium text-gray-700 mb-1">提示信息</label>
              <input
                type="text"
                value={element.props?.message || ''}
                onChange={(e) => updateProps('message', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="请输入提示信息"
              />
            </div>
          )
          basicContent.push(
            <div key="description">
              <label className="block text-xs font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={element.props?.description || ''}
                onChange={(e) => updateProps('description', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                rows={3}
                placeholder="请输入描述"
              />
            </div>
          )
          basicContent.push(
            <div key="type">
              <label className="block text-xs font-medium text-gray-700 mb-1">类型</label>
              <select
                value={element.props?.type || 'info'}
                onChange={(e) => updateProps('type', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="success">成功</option>
                <option value="info">信息</option>
                <option value="warning">警告</option>
                <option value="error">错误</option>
              </select>
            </div>
          )
          basicContent.push(
            <div key="closable">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={element.props?.closable === true}
                  onChange={(e) => updateProps('closable', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">可关闭</span>
              </label>
            </div>
          )
          break

        case 'a-row':
          basicContent.push(
            <div key="gutter">
              <label className="block text-xs font-medium text-gray-700 mb-1">间距</label>
              <input
                type="number"
                min={0}
                value={element.props?.gutter || 0}
                onChange={(e) => updateProps('gutter', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="栅格间距"
              />
            </div>
          )
          break

        case 'a-col':
          basicContent.push(
            <div key="span">
              <label className="block text-xs font-medium text-gray-700 mb-1">栅格占位格数</label>
              <input
                type="number"
                min={1}
                max={24}
                value={element.props?.span || 12}
                onChange={(e) => updateProps('span', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          )
          break

        case 'a-tabs':
          // Tabs 配置：支持多个 tab 的配置
          const tabsItems = element.props?.items || []
          basicContent.push(
            <div key="tabs-config">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">Tab 列表</label>
                <button
                  type="button"
                  onClick={() => {
                    const newItems = [
                      ...tabsItems,
                      {
                        key: `tab-${Date.now()}`,
                        label: `Tab ${tabsItems.length + 1}`,
                        children: null, // 初始为空，可以后续添加内容
                      },
                    ]
                    updateProps('items', newItems)
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                >
                  {React.createElement(PlusOutlined, { className: 'text-xs' })}
                  添加 Tab
                </button>
              </div>
              {tabsItems.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">暂无 Tab，点击"添加 Tab"按钮添加</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tabsItems.map((tab: any, index: number) => (
                    <div key={tab.key || index} className="p-2 border border-gray-200 rounded bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Tab {index + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              // 复制当前tab并插入到当前tab之后
                              const copiedTab = {
                                ...tab,
                                key: `tab-${Date.now()}`,
                                label: `${tab.label || 'Tab'} (副本)`,
                                // 如果children是数组，需要深拷贝
                                children: Array.isArray(tab.children)
                                  ? JSON.parse(JSON.stringify(tab.children))
                                  : tab.children,
                              }
                              const newItems = [...tabsItems]
                              newItems.splice(index + 1, 0, copiedTab)
                              updateProps('items', newItems)
                            }}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                            title="复制此Tab"
                          >
                            {React.createElement(CopyOutlined, { className: 'text-xs' })}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = tabsItems.filter((_: any, i: number) => i !== index)
                              updateProps('items', newItems)
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="删除"
                          >
                            {React.createElement(DeleteOutlined, { className: 'text-xs' })}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tab 标题</label>
                          <input
                            type="text"
                            value={tab.label || ''}
                            onChange={(e) => {
                              const newItems = [...tabsItems]
                              newItems[index] = { ...tab, label: e.target.value }
                              updateProps('items', newItems)
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="Tab 标题"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tab Key</label>
                          <input
                            type="text"
                            value={tab.key || ''}
                            onChange={(e) => {
                              const newItems = [...tabsItems]
                              newItems[index] = { ...tab, key: e.target.value }
                              updateProps('items', newItems)
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="Tab Key（唯一标识）"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tab 内容</label>
                          {Array.isArray(tab.children) && tab.children.length > 0 ? (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                              <p className="text-blue-800 font-medium mb-1">
                                此 Tab 包含 {tab.children.length} 个子元素
                              </p>
                              <p className="text-blue-600 text-xs">
                                请在画布中直接拖拽组件到 Tab 内容区域进行编辑
                              </p>
                            </div>
                          ) : (
                            <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                              <p className="text-gray-600">
                                在画布中拖拽组件到此 Tab 内容区域即可添加内容
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Tab 排序按钮 */}
                      <div className="flex gap-1 mt-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = [...tabsItems]
                              ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
                              updateProps('items', newItems)
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                            title="上移"
                          >
                            {React.createElement(ArrowUpOutlined, { className: 'text-xs' })}
                          </button>
                        )}
                        {index < tabsItems.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = [...tabsItems]
                              ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
                              updateProps('items', newItems)
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                            title="下移"
                          >
                            {React.createElement(ArrowDownOutlined, { className: 'text-xs' })}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* 其他 Tabs 属性 */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">默认激活的 Tab Key</label>
                  <select
                    value={element.props?.defaultActiveKey || ''}
                    onChange={(e) => updateProps('defaultActiveKey', e.target.value || undefined)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="">无</option>
                    {tabsItems.map((tab: any) => (
                      <option key={tab.key} value={tab.key}>
                        {tab.label || tab.key}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={element.props?.centered === true}
                      onChange={(e) => updateProps('centered', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-medium text-gray-700">标签居中</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">标签位置</label>
                  <select
                    value={element.props?.tabPosition || 'top'}
                    onChange={(e) => updateProps('tabPosition', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="top">顶部</option>
                    <option value="bottom">底部</option>
                    <option value="left">左侧</option>
                    <option value="right">右侧</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={element.props?.type === 'card'}
                      onChange={(e) => updateProps('type', e.target.checked ? 'card' : undefined)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-medium text-gray-700">卡片式标签</span>
                  </label>
                </div>
              </div>
            </div>
          )
          break

        case 'a-table':
          // Table 列配置
          const tableColumns = element.props?.columns || []
          basicContent.push(
            <div key="table-columns">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">列配置</label>
                <button
                  type="button"
                  onClick={() => {
                    const newColumns = [
                      ...tableColumns,
                      {
                        title: `列${tableColumns.length + 1}`,
                        dataIndex: `column${tableColumns.length + 1}`,
                        key: `column${tableColumns.length + 1}`,
                      },
                    ]
                    updateProps('columns', newColumns)
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                >
                  {React.createElement(PlusOutlined, { className: 'text-xs' })}
                  添加列
                </button>
              </div>
              {tableColumns.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">暂无列，点击"添加列"按钮添加</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tableColumns.map((column: any, index: number) => (
                    <div key={column.key || index} className="p-2 border border-gray-200 rounded bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">列 {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newColumns = tableColumns.filter((_: any, i: number) => i !== index)
                            updateProps('columns', newColumns)
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          {React.createElement(DeleteOutlined, { className: 'text-xs' })}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">列标题</label>
                          <input
                            type="text"
                            value={column.title || ''}
                            onChange={(e) => {
                              const newColumns = [...tableColumns]
                              newColumns[index] = { ...column, title: e.target.value }
                              updateProps('columns', newColumns)
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="列标题"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">数据字段</label>
                          <input
                            type="text"
                            value={column.dataIndex || ''}
                            onChange={(e) => {
                              const newColumns = [...tableColumns]
                              newColumns[index] = { ...column, dataIndex: e.target.value }
                              updateProps('columns', newColumns)
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="dataIndex"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Key</label>
                          <input
                            type="text"
                            value={column.key || ''}
                            onChange={(e) => {
                              const newColumns = [...tableColumns]
                              newColumns[index] = { ...column, key: e.target.value }
                              updateProps('columns', newColumns)
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            placeholder="唯一标识"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={column.width !== undefined}
                              onChange={(e) => {
                                const newColumns = [...tableColumns]
                                newColumns[index] = {
                                  ...column,
                                  width: e.target.checked ? 100 : undefined,
                                }
                                updateProps('columns', newColumns)
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-600">固定宽度</span>
                          </label>
                        </div>
                        {column.width !== undefined && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">宽度</label>
                            <input
                              type="number"
                              value={column.width || 100}
                              onChange={(e) => {
                                const newColumns = [...tableColumns]
                                newColumns[index] = { ...column, width: Number(e.target.value) }
                                updateProps('columns', newColumns)
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                              placeholder="列宽度"
                            />
                          </div>
                        )}
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={column.fixed === 'left' || column.fixed === 'right'}
                              onChange={(e) => {
                                const newColumns = [...tableColumns]
                                newColumns[index] = {
                                  ...column,
                                  fixed: e.target.checked ? 'left' : undefined,
                                }
                                updateProps('columns', newColumns)
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-600">固定列（左侧）</span>
                          </label>
                        </div>
                        {column.fixed === 'left' && (
                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={column.fixed === 'right'}
                                onChange={(e) => {
                                  const newColumns = [...tableColumns]
                                  newColumns[index] = {
                                    ...column,
                                    fixed: e.target.checked ? 'right' : 'left',
                                  }
                                  updateProps('columns', newColumns)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-xs text-gray-600">改为右侧固定</span>
                            </label>
                          </div>
                        )}
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={column.sorter !== undefined}
                              onChange={(e) => {
                                const newColumns = [...tableColumns]
                                newColumns[index] = {
                                  ...column,
                                  sorter: e.target.checked ? true : undefined,
                                }
                                updateProps('columns', newColumns)
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-600">启用排序</span>
                          </label>
                        </div>
                        {column.sorter && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">排序方式</label>
                            <select
                              value={column.defaultSortOrder || 'ascend'}
                              onChange={(e) => {
                                const newColumns = [...tableColumns]
                                newColumns[index] = {
                                  ...column,
                                  defaultSortOrder: e.target.value === 'none' ? undefined : e.target.value as any,
                                }
                                updateProps('columns', newColumns)
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="none">无默认排序</option>
                              <option value="ascend">升序</option>
                              <option value="descend">降序</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={column.filters !== undefined}
                              onChange={(e) => {
                                const newColumns = [...tableColumns]
                                newColumns[index] = {
                                  ...column,
                                  filters: e.target.checked ? [
                                    { text: '选项1', value: 'option1' },
                                    { text: '选项2', value: 'option2' },
                                  ] : undefined,
                                }
                                updateProps('columns', newColumns)
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-600">启用筛选</span>
                          </label>
                        </div>
                        {column.filters && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">筛选选项（JSON格式）</label>
                            <textarea
                              value={JSON.stringify(column.filters || [], null, 2)}
                              onChange={(e) => {
                                try {
                                  const filters = JSON.parse(e.target.value)
                                  const newColumns = [...tableColumns]
                                  newColumns[index] = {
                                    ...column,
                                    filters,
                                  }
                                  updateProps('columns', newColumns)
                                } catch (error) {
                                  // JSON格式错误，暂时不更新
                                }
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                              rows={3}
                              placeholder='[{"text": "选项1", "value": "option1"}]'
                            />
                            <p className="text-xs text-gray-500 mt-0.5">
                              格式：{`[{"text": "显示文本", "value": "值"}]`}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={column.align === 'center' || column.align === 'right'}
                              onChange={(e) => {
                                const newColumns = [...tableColumns]
                                newColumns[index] = {
                                  ...column,
                                  align: e.target.checked ? 'center' : undefined,
                                }
                                updateProps('columns', newColumns)
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-600">居中对齐</span>
                          </label>
                        </div>
                        {column.align === 'center' && (
                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={column.align === 'right'}
                                onChange={(e) => {
                                  const newColumns = [...tableColumns]
                                  newColumns[index] = {
                                    ...column,
                                    align: e.target.checked ? 'right' : 'center',
                                  }
                                  updateProps('columns', newColumns)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-xs text-gray-600">改为右对齐</span>
                            </label>
                          </div>
                        )}
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={column.ellipsis === true}
                              onChange={(e) => {
                                const newColumns = [...tableColumns]
                                newColumns[index] = {
                                  ...column,
                                  ellipsis: e.target.checked ? true : undefined,
                                }
                                updateProps('columns', newColumns)
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-600">文本省略（超出显示...）</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
          
          // Table 数据源配置
          basicContent.push(
            <div key="table-dataSource" className="pt-4 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">数据源（JSON格式）</label>
              <textarea
                value={JSON.stringify(element.props?.dataSource || [], null, 2)}
                onChange={(e) => {
                  try {
                    const dataSource = JSON.parse(e.target.value)
                    updateProps('dataSource', dataSource)
                  } catch (error) {
                    // 如果JSON格式错误，暂时不更新
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                rows={6}
                placeholder='[{"key": "1", "name": "张三", "age": 32}]'
              />
              <p className="text-xs text-gray-500 mt-1">
                请输入有效的JSON数组格式数据
              </p>
            </div>
          )
          
          // Table 其他属性
          basicContent.push(
            <div key="table-other" className="pt-4 border-t border-gray-200 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">表格大小</label>
                <select
                  value={element.props?.size || 'middle'}
                  onChange={(e) => updateProps('size', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="small">小 (small)</option>
                  <option value="middle">中 (middle)</option>
                  <option value="large">大 (large)</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props?.bordered === true}
                    onChange={(e) => updateProps('bordered', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">显示边框</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props?.loading === true}
                    onChange={(e) => updateProps('loading', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">加载状态</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={element.props?.pagination !== false}
                    onChange={(e) => updateProps('pagination', e.target.checked ? {} : false)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">显示分页</span>
                </label>
              </div>
              {element.props?.pagination !== false && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">每页条数</label>
                    <input
                      type="number"
                      min={1}
                      value={element.props?.pagination?.pageSize || 10}
                      onChange={(e) => {
                        const pageSize = Number(e.target.value)
                        updateProps('pagination', {
                          ...(element.props?.pagination || {}),
                          pageSize,
                        })
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">每页条数选项</label>
                    <input
                      type="text"
                      value={Array.isArray(element.props?.pagination?.pageSizeOptions) 
                        ? element.props.pagination.pageSizeOptions.join(', ')
                        : '10, 20, 50, 100'}
                      onChange={(e) => {
                        const pageSizeOptions = e.target.value
                          .split(',')
                          .map(s => s.trim())
                          .filter(s => s)
                        updateProps('pagination', {
                          ...(element.props?.pagination || {}),
                          pageSizeOptions,
                        })
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="10, 20, 50, 100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      用逗号分隔，例如: 10, 20, 50, 100
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={element.props?.pagination?.showSizeChanger === true}
                        onChange={(e) => {
                          updateProps('pagination', {
                            ...(element.props?.pagination || {}),
                            showSizeChanger: e.target.checked,
                          })
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium text-gray-700">显示每页条数选择器</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={element.props?.pagination?.showQuickJumper === true}
                        onChange={(e) => {
                          updateProps('pagination', {
                            ...(element.props?.pagination || {}),
                            showQuickJumper: e.target.checked,
                          })
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium text-gray-700">显示快速跳转</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={element.props?.pagination?.showTotal !== undefined}
                        onChange={(e) => {
                          updateProps('pagination', {
                            ...(element.props?.pagination || {}),
                            showTotal: e.target.checked ? (total: number) => `共 ${total} 条` : undefined,
                          })
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium text-gray-700">显示总数</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">分页位置</label>
                    <select
                      value={element.props?.pagination?.position?.[0] || 'bottomRight'}
                      onChange={(e) => {
                        updateProps('pagination', {
                          ...(element.props?.pagination || {}),
                          position: [e.target.value as any],
                        })
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="topLeft">顶部左侧</option>
                      <option value="topCenter">顶部居中</option>
                      <option value="topRight">顶部右侧</option>
                      <option value="bottomLeft">底部左侧</option>
                      <option value="bottomCenter">底部居中</option>
                      <option value="bottomRight">底部右侧</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* 滚动设置 */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">滚动设置</h3>
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={element.props?.scroll?.x !== undefined}
                        onChange={(e) => {
                          const scroll = { ...(element.props?.scroll || {}) }
                          if (e.target.checked) {
                            scroll.x = scroll.x || 'max-content'
                          } else {
                            delete scroll.x
                          }
                          updateProps('scroll', Object.keys(scroll).length > 0 ? scroll : undefined)
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium text-gray-700">启用横向滚动</span>
                    </label>
                  </div>
                  {element.props?.scroll?.x !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">横向滚动宽度</label>
                      <input
                        type="text"
                        value={typeof element.props.scroll.x === 'string' ? element.props.scroll.x : String(element.props.scroll.x || 'max-content')}
                        onChange={(e) => {
                          const value = e.target.value
                          const scroll = { ...(element.props?.scroll || {}) }
                          // 尝试转换为数字，如果失败则使用字符串
                          scroll.x = /^\d+$/.test(value) ? Number(value) : value || 'max-content'
                          updateProps('scroll', scroll)
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="例如: 800 或 max-content"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        可以是数字（像素）或 "max-content"
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={element.props?.scroll?.y !== undefined}
                        onChange={(e) => {
                          const scroll = { ...(element.props?.scroll || {}) }
                          if (e.target.checked) {
                            scroll.y = scroll.y || 240
                          } else {
                            delete scroll.y
                          }
                          updateProps('scroll', Object.keys(scroll).length > 0 ? scroll : undefined)
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium text-gray-700">启用纵向滚动</span>
                    </label>
                  </div>
                  {element.props?.scroll?.y !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">纵向滚动高度</label>
                      <input
                        type="text"
                        value={typeof element.props.scroll.y === 'string' ? element.props.scroll.y : String(element.props.scroll.y || 240)}
                        onChange={(e) => {
                          const value = e.target.value
                          const scroll = { ...(element.props?.scroll || {}) }
                          // 尝试转换为数字，如果失败则使用字符串
                          scroll.y = /^\d+$/.test(value) ? Number(value) : value || 240
                          updateProps('scroll', scroll)
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="例如: 240"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        表格内容区域的高度（像素）
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 其他设置 */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">其他设置</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">行键字段</label>
                  <input
                    type="text"
                    value={element.props?.rowKey || 'key'}
                    onChange={(e) => updateProps('rowKey', e.target.value || 'key')}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="rowKey"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    用于标识每一行的唯一字段名，默认为 "key"
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={element.props?.showHeader !== false}
                      onChange={(e) => updateProps('showHeader', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-medium text-gray-700">显示表头</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={element.props?.sticky === true}
                      onChange={(e) => updateProps('sticky', e.target.checked || undefined)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-medium text-gray-700">粘性表头</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6 mt-0.5">
                    表头在滚动时保持可见
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={element.props?.rowSelection !== undefined}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateProps('rowSelection', {
                            type: 'checkbox',
                          })
                        } else {
                          updateProps('rowSelection', undefined)
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-medium text-gray-700">启用行选择</span>
                  </label>
                </div>
                {element.props?.rowSelection !== undefined && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">选择类型</label>
                      <select
                        value={element.props?.rowSelection?.type || 'checkbox'}
                        onChange={(e) => {
                          updateProps('rowSelection', {
                            ...(element.props?.rowSelection || {}),
                            type: e.target.value as 'checkbox' | 'radio',
                          })
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="checkbox">多选 (checkbox)</option>
                        <option value="radio">单选 (radio)</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={element.props?.rowSelection?.checkStrictly === true}
                          onChange={(e) => {
                            updateProps('rowSelection', {
                              ...(element.props?.rowSelection || {}),
                              checkStrictly: e.target.checked,
                            })
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-xs font-medium text-gray-700">父子节点独立选择</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
          break

        default:
          // 其他组件类型可以在这里添加
          break
      }

      return <TabsContent value="basic" className="mt-0 p-4 space-y-4">{basicContent}</TabsContent>
    }

    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full" data-property-panel>
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-700">属性面板</h2>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0">
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
            {renderBasicPanel()}
            {isTable ? tableStylePanel : commonStylePanel}
          </div>
        </Tabs>
      </div>
    )
  }

  // Ant Design Button 组件的特殊处理
  if (element.type === 'a-button') {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full" data-property-panel>
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-700">属性面板</h2>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0">
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

              {/* 事件配置 */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">事件配置</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">点击事件名称</label>
                  <input
                    type="text"
                    value={element.props?.onClickEventName || ''}
                    onChange={(e) => updateProps('onClickEventName', e.target.value || undefined)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="例如: handleButtonClick"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    设置后，点击按钮时会触发该事件并打印日志
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={element.props?.enableLog === true}
                      onChange={(e) => updateProps('enableLog', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs font-medium text-gray-700">启用日志打印</span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6 mt-0.5">
                    启用后，点击按钮时会在控制台打印日志
                  </p>
                </div>
              </div>
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

  // 其他 Ant Design 组件使用通用面板
  if (isAntdComponent(element.type)) {
    return renderAntdComponentPanel()
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
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">文本内容</label>
              <input
                type="text"
                value={element.props?.text || ''}
                onChange={(e) => updateProps('text', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={element.props?.textWrap !== false}
                  onChange={(e) => updateProps('textWrap', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">文本换行</span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-0.5">
                禁用后文本将在一行显示，超出部分会被隐藏（配合文本打点使用）
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={element.props?.textEllipsis === true}
                  onChange={(e) => updateProps('textEllipsis', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-gray-700">文本打点（省略号）</span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-0.5">
                启用后超出文本会显示省略号，需要配合禁用文本换行使用
              </p>
            </div>
          </>
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">换行 (flex-wrap)</label>
                    <select
                      value={element.props?.flexWrap || 'nowrap'}
                      onChange={(e) => updateProps('flexWrap', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="nowrap">不换行 (nowrap)</option>
                      <option value="wrap">换行 (wrap)</option>
                      <option value="wrap-reverse">反向换行 (wrap-reverse)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-0.5">
                      设置子元素是否换行，当容器空间不足时是否换到下一行
                    </p>
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

