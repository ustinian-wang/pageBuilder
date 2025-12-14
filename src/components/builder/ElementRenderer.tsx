'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { Element, ElementType } from '@/lib/types'
import { ResizeHandle } from './ResizeHandle'
import { generateId } from '@/lib/utils'
// Ant Design 组件导入
import {
  Button,
  Input,
  Card,
  Form,
  Table,
  Select,
  DatePicker,
  Radio,
  Checkbox,
  Switch,
  Slider,
  Rate,
  Tag,
  Badge,
  Avatar,
  Divider as AntdDivider,
  Space,
  Row,
  Col,
  Layout,
  Menu,
  Tabs,
  Collapse,
  Timeline,
  List,
  Empty,
  Spin,
  Alert,
  Modal,
} from 'antd'
// Ant Design 图标导入
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

interface ElementRendererProps {
  element: Element
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  onDelete: (id: string) => void
  onCopy?: (element: Element) => void // 复制元素回调
  parentAutoFill?: boolean // 父容器是否启用自动填充
}

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

// 根据图标名称获取图标组件
const getIconComponent = (iconName: string | undefined): React.ReactNode | undefined => {
  if (!iconName) return undefined
  const IconComponent = iconMap[iconName]
  return IconComponent ? React.createElement(IconComponent) : undefined
}

// 系统组件（与 ComponentPanel 保持一致）
const systemComponents: Array<{ type: ElementType; label: string; icon: string; description?: string }> = [
  { type: 'container', label: '容器', icon: '📦', description: '用于包裹其他组件的容器' },
  { type: 'text', label: '文本', icon: '📝', description: '普通文本元素' },
  { type: 'button', label: '按钮', icon: '🔘', description: '可点击的按钮' },
  { type: 'input', label: '输入框', icon: '📥', description: '文本输入框' },
  { type: 'image', label: '图片', icon: '🖼️', description: '图片元素' },
  { type: 'card', label: '卡片', icon: '🎴', description: '卡片容器' },
  { type: 'heading', label: '标题', icon: '📌', description: '标题文本（H1-H6）' },
  { type: 'paragraph', label: '段落', icon: '📄', description: '段落文本' },
  { type: 'divider', label: '分割线', icon: '➖', description: '水平分割线' },
  { type: 'list', label: '列表', icon: '📋', description: '有序或无序列表' },
  { type: 'form', label: '表单', icon: '📋', description: '表单容器' },
]

// Ant Design 组件（与 ComponentPanel 保持一致）
const antdComponents: Array<{ type: ElementType; label: string; icon: string; description?: string }> = [
  { type: 'a-button', label: 'Button', icon: '🔘', description: 'Ant Design 按钮' },
  { type: 'a-input', label: 'Input', icon: '📥', description: 'Ant Design 输入框' },
  { type: 'a-card', label: 'Card', icon: '🎴', description: 'Ant Design 卡片' },
  { type: 'a-form', label: 'Form', icon: '📋', description: 'Ant Design 表单' },
  { type: 'a-table', label: 'Table', icon: '📊', description: 'Ant Design 表格' },
  { type: 'a-select', label: 'Select', icon: '📋', description: 'Ant Design 选择器' },
  { type: 'a-datepicker', label: 'DatePicker', icon: '📅', description: 'Ant Design 日期选择器' },
  { type: 'a-radio', label: 'Radio', icon: '🔘', description: 'Ant Design 单选框' },
  { type: 'a-checkbox', label: 'Checkbox', icon: '☑️', description: 'Ant Design 复选框' },
  { type: 'a-switch', label: 'Switch', icon: '🔀', description: 'Ant Design 开关' },
  { type: 'a-slider', label: 'Slider', icon: '🎚️', description: 'Ant Design 滑动输入条' },
  { type: 'a-rate', label: 'Rate', icon: '⭐', description: 'Ant Design 评分' },
  { type: 'a-tag', label: 'Tag', icon: '🏷️', description: 'Ant Design 标签' },
  { type: 'a-badge', label: 'Badge', icon: '🔖', description: 'Ant Design 徽标数' },
  { type: 'a-avatar', label: 'Avatar', icon: '👤', description: 'Ant Design 头像' },
  { type: 'a-divider', label: 'Divider', icon: '➖', description: 'Ant Design 分割线' },
  { type: 'a-space', label: 'Space', icon: '↔️', description: 'Ant Design 间距' },
  { type: 'a-row', label: 'Row', icon: '➡️', description: 'Ant Design 行' },
  { type: 'a-col', label: 'Col', icon: '⬇️', description: 'Ant Design 列' },
  { type: 'a-layout', label: 'Layout', icon: '📐', description: 'Ant Design 布局' },
  { type: 'a-menu', label: 'Menu', icon: '📑', description: 'Ant Design 导航菜单' },
  { type: 'a-tabs', label: 'Tabs', icon: '📑', description: 'Ant Design 标签页' },
  { type: 'a-collapse', label: 'Collapse', icon: '📂', description: 'Ant Design 折叠面板' },
  { type: 'a-timeline', label: 'Timeline', icon: '⏱️', description: 'Ant Design 时间轴' },
  { type: 'a-list', label: 'List', icon: '📋', description: 'Ant Design 列表' },
  { type: 'a-empty', label: 'Empty', icon: '📭', description: 'Ant Design 空状态' },
  { type: 'a-spin', label: 'Spin', icon: '🌀', description: 'Ant Design 加载中' },
  { type: 'a-alert', label: 'Alert', icon: '⚠️', description: 'Ant Design 警告提示' },
]

// 获取默认属性
const getDefaultProps = (type: ElementType): Record<string, any> => {
  const defaults: Record<string, Record<string, any>> = {
    container: {},
    text: { text: '文本' },
    button: { text: '按钮', variant: 'primary' },
    input: { placeholder: '请输入' },
    image: { src: '', alt: '图片' },
    card: {},
    divider: {},
    heading: { text: '标题', level: 1 },
    paragraph: { text: '段落文本' },
    list: { items: ['项目1', '项目2'], ordered: false },
    form: {},
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

// TabContentRenderer 组件：用于渲染每个 tab 的内容区域，支持拖拽
// 提取为独立组件，避免在每次渲染时重新创建
// 注意：不使用 React.memo，因为需要响应 tabItem 的变化
const TabContentRenderer = ({ 
  elementId,
  tabKey, 
  tabItem,
  selectedElementId,
  onSelect,
  onUpdate,
  onDelete,
  onCopy,
}: { 
  elementId: string
  tabKey: string
  tabItem: any
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Element>) => void
  onDelete: (id: string) => void
  onCopy?: (element: Element) => void
}) => {
  const tabDroppableId = `tab-content-${elementId}-${tabKey}`
  const { setNodeRef: setTabDroppableRef, isOver: isTabOver } = useDroppable({
    id: tabDroppableId,
  })
  
  // 组件选择对话框状态
  const [showComponentModal, setShowComponentModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customComponents, setCustomComponents] = useState<Array<{ type: string; label: string; icon: string; description?: string; elementData?: Element; moduleId?: string }>>([])
  
  // 加载自定义模块
  useEffect(() => {
    const loadCustomModules = async () => {
      try {
        const response = await fetch('/api/modules')
        const result = await response.json()
        if (result.success && result.data) {
          const modules = result.data.map((m: any) => ({
            type: m.name,
            label: m.label,
            icon: m.icon || '📦',
            description: m.description,
            elementData: m.element,
            moduleId: m.id,
          }))
          setCustomComponents(modules)
        }
      } catch (error) {
        console.error('加载自定义模块失败:', error)
      }
    }
    loadCustomModules()
    
    // 监听自定义模块保存事件
    const handleModuleSaved = () => {
      loadCustomModules()
    }
    window.addEventListener('customModuleSaved', handleModuleSaved)
    return () => {
      window.removeEventListener('customModuleSaved', handleModuleSaved)
    }
  }, [])
  
  // 过滤组件（根据搜索关键词）
  const filteredSystemComponents = useMemo(() => {
    if (!searchQuery) return systemComponents
    const query = searchQuery.toLowerCase()
    return systemComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery])
  
  const filteredAntdComponents = useMemo(() => {
    if (!searchQuery) return antdComponents
    const query = searchQuery.toLowerCase()
    return antdComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery])
  
  const filteredCustomComponents = useMemo(() => {
    if (!searchQuery) return customComponents
    const query = searchQuery.toLowerCase()
    return customComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery, customComponents])
  
  const totalMatchCount = filteredSystemComponents.length + filteredAntdComponents.length + filteredCustomComponents.length
  
  // 添加组件到 tab content
  const handleAddComponent = (componentType: ElementType | string, elementData?: Element, moduleId?: string) => {
    let newElement: Element
    
    if (elementData && moduleId) {
      // 自定义模块：深拷贝并生成新ID
      const cloneElement = (el: Element): Element => {
        const newId = generateId()
        return {
          ...el,
          id: newId,
          moduleId: moduleId,
          children: el.children ? el.children.map(cloneElement) : undefined,
        }
      }
      newElement = cloneElement(elementData)
    } else {
      // 系统组件
      newElement = {
        id: generateId(),
        type: componentType as ElementType,
        props: getDefaultProps(componentType as ElementType),
      }
    }
    
    // 更新 tab content
    const currentItems = (tabItem as any).__parentItems || []
    const updatedItems = currentItems.map((item: any) => {
      if (item.key === tabKey) {
        return {
          ...item,
          children: Array.isArray(item.children) 
            ? [...item.children, newElement]
            : [newElement],
        }
      }
      return item
    })
    
    onUpdate(elementId, {
      props: {
        items: updatedItems,
      },
    })
    
    setShowComponentModal(false)
  }
  
  // 如果 children 是 Element 数组（用于页面构建器的元素树）
  if (Array.isArray(tabItem.children) && tabItem.children.length > 0) {
    // 检查是否是 Element 对象（有 id 和 type 属性）
    const isElementArray = tabItem.children.every(
      (child: any) => child && typeof child === 'object' && 'id' in child && 'type' in child
    )
    
    if (isElementArray) {
      // 是 Element 数组，渲染为可拖拽区域
      return (
        <div
          ref={setTabDroppableRef}
          className="relative min-h-[60px] p-2"
          style={{ minHeight: '60px', position: 'relative', zIndex: 1 }}
          onClick={(e) => {
            // 只有当点击的是容器本身的空白区域时，才阻止事件冒泡
            // 如果点击的是子元素（有 data-element-id），允许事件继续传播
            const target = e.target as HTMLElement
            const clickedElement = target.closest('[data-element-id]')
            // 如果点击的不是子元素，或者是容器本身，阻止冒泡到 tabs
            if (!clickedElement || target === e.currentTarget) {
              e.stopPropagation()
            }
          }}
          onMouseDown={(e) => {
            // 只有当点击的是容器本身的空白区域时，才阻止事件冒泡
            const target = e.target as HTMLElement
            const clickedElement = target.closest('[data-element-id]')
            if (!clickedElement || target === e.currentTarget) {
              e.stopPropagation()
            }
          }}
          onContextMenu={(e) => {
            // 只有当点击的是容器本身的空白区域时，才阻止事件冒泡
            // 如果点击的是子元素（有 data-element-id），允许事件继续传播
            const target = e.target as HTMLElement
            const clickedElement = target.closest('[data-element-id]')
            // 如果点击的不是子元素，或者是容器本身，阻止冒泡到 tabs
            if (!clickedElement || target === e.currentTarget) {
              e.stopPropagation()
            }
            // 注意：不要在这里调用 preventDefault，让子元素自己处理
          }}
        >
          {tabItem.children.map((child: Element) => (
            <ElementRenderer
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={(childId, updates) => {
                // 更新 tab 内容中的子元素
                // 使用传入的 __parentItems 来更新
                const currentItems = (tabItem as any).__parentItems || []
                const updatedItems = currentItems.map((item: any) => {
                  if (item.key === tabKey && Array.isArray(item.children)) {
                    return {
                      ...item,
                      children: item.children.map((c: Element) =>
                        c.id === childId ? { ...c, ...updates } : c
                      ),
                    }
                  }
                  return item
                })
                onUpdate(elementId, {
                  props: {
                    items: updatedItems,
                  },
                })
              }}
              onDelete={(childId) => {
                // 删除 tab 内容中的子元素
                const currentItems = (tabItem as any).__parentItems || []
                const updatedItems = currentItems.map((item: any) => {
                  if (item.key === tabKey && Array.isArray(item.children)) {
                    return {
                      ...item,
                      children: item.children.filter((c: Element) => c.id !== childId),
                    }
                  }
                  return item
                })
                onUpdate(elementId, {
                  props: {
                    items: updatedItems,
                  },
                })
              }}
              onCopy={onCopy ? (copiedElement) => {
                // 复制 tab 内容中的子元素
                const { generateId } = require('@/lib/utils')
                const cloneElement = (el: Element): Element => {
                  const newId = generateId()
                  return {
                    ...el,
                    id: newId,
                    children: el.children ? el.children.map(cloneElement) : undefined,
                  }
                }
                const clonedElement = cloneElement(copiedElement)
                
                const currentItems = (tabItem as any).__parentItems || []
                const updatedItems = currentItems.map((item: any) => {
                  if (item.key === tabKey && Array.isArray(item.children)) {
                    return {
                      ...item,
                      children: [...item.children, clonedElement],
                    }
                  }
                  return item
                })
                onUpdate(elementId, {
                  props: {
                    items: updatedItems,
                  },
                })
              } : undefined}
              parentAutoFill={false}
            />
          ))}
          {isTabOver && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 z-0 pointer-events-none" />
          )}
          {(!tabItem.children || tabItem.children.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowComponentModal(true)
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 pointer-events-auto text-sm flex items-center gap-2"
              >
                {React.createElement(PlusOutlined, { className: 'text-sm' })}
                点击添加组件
              </button>
            </div>
          )}
          {/* 添加组件按钮（当有内容时也显示） */}
        </div>
      )
    }
  }
  
  // 如果 children 是字符串、数字或其他简单类型，或者为空
  const textContent = typeof tabItem.children === 'string' || typeof tabItem.children === 'number'
    ? String(tabItem.children)
    : ''
  
  // 检查是否有 Element 数组（即使为空数组）
  const hasElementArray = Array.isArray(tabItem.children) && 
    (tabItem.children.length === 0 || tabItem.children.every(
      (child: any) => child && typeof child === 'object' && 'id' in child && 'type' in child
    ))
  
  return (
    <div
      ref={setTabDroppableRef}
      className="relative min-h-[60px] p-2"
      style={{ 
        minHeight: '60px', 
        position: 'relative', 
        zIndex: 1,
        width: '100%',
        // 确保拖拽区域可以接收事件
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        // 只有当点击的是容器本身的空白区域时，才阻止事件冒泡
        // 如果点击的是子元素（有 data-element-id），允许事件继续传播
        const target = e.target as HTMLElement
        const clickedElement = target.closest('[data-element-id]')
        // 如果点击的不是子元素，或者是容器本身，阻止冒泡到 tabs
        if (!clickedElement || target === e.currentTarget) {
          e.stopPropagation()
        }
      }}
      onMouseDown={(e) => {
        // 只有当点击的是容器本身的空白区域时，才阻止事件冒泡
        const target = e.target as HTMLElement
        const clickedElement = target.closest('[data-element-id]')
        if (!clickedElement || target === e.currentTarget) {
          e.stopPropagation()
        }
      }}
      onContextMenu={(e) => {
        // 只有当点击的是容器本身的空白区域时，才阻止事件冒泡
        // 如果点击的是子元素（有 data-element-id），允许事件继续传播
        const target = e.target as HTMLElement
        const clickedElement = target.closest('[data-element-id]')
        // 如果点击的不是子元素，或者是容器本身，阻止冒泡到 tabs
        if (!clickedElement || target === e.currentTarget) {
          e.stopPropagation()
        }
        // 注意：不要在这里调用 preventDefault，让子元素自己处理
      }}
    >
      {/* 如果有 Element 数组，渲染子元素 */}
      {hasElementArray && tabItem.children.length > 0 && (
        <>
          {tabItem.children.map((child: Element) => (
            <ElementRenderer
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={(childId, updates) => {
                const currentItems = (tabItem as any).__parentItems || []
                const updatedItems = currentItems.map((item: any) => {
                  if (item.key === tabKey && Array.isArray(item.children)) {
                    return {
                      ...item,
                      children: item.children.map((c: Element) =>
                        c.id === childId ? { ...c, ...updates } : c
                      ),
                    }
                  }
                  return item
                })
                onUpdate(elementId, {
                  props: {
                    items: updatedItems,
                  },
                })
              }}
              onDelete={(childId) => {
                const currentItems = (tabItem as any).__parentItems || []
                const updatedItems = currentItems.map((item: any) => {
                  if (item.key === tabKey && Array.isArray(item.children)) {
                    return {
                      ...item,
                      children: item.children.filter((c: Element) => c.id !== childId),
                    }
                  }
                  return item
                })
                onUpdate(elementId, {
                  props: {
                    items: updatedItems,
                  },
                })
              }}
              onCopy={onCopy ? (copiedElement) => {
                const { generateId } = require('@/lib/utils')
                const cloneElement = (el: Element): Element => {
                  const newId = generateId()
                  return {
                    ...el,
                    id: newId,
                    children: el.children ? el.children.map(cloneElement) : undefined,
                  }
                }
                const clonedElement = cloneElement(copiedElement)
                
                const currentItems = (tabItem as any).__parentItems || []
                const updatedItems = currentItems.map((item: any) => {
                  if (item.key === tabKey && Array.isArray(item.children)) {
                    return {
                      ...item,
                      children: [...item.children, clonedElement],
                    }
                  }
                  return item
                })
                onUpdate(elementId, {
                  props: {
                    items: updatedItems,
                  },
                })
              } : undefined}
              parentAutoFill={false}
            />
          ))}
        </>
      )}
      
      {/* 文本内容 */}
      {textContent && !hasElementArray && <div>{textContent}</div>}
      
      {/* 拖拽悬停提示 */}
      {isTabOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 z-10 pointer-events-none" />
      )}
      
      {/* 空内容提示 */}
      {!textContent && (!hasElementArray || tabItem.children.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowComponentModal(true)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 pointer-events-auto text-sm flex items-center gap-2"
          >
            {React.createElement(PlusOutlined, { className: 'text-sm' })}
            点击添加组件
          </button>
        </div>
      )}
      
      {/* 添加组件按钮（当有内容时也显示） */}
      {hasElementArray && tabItem.children.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowComponentModal(true)
          }}
          className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs flex items-center gap-1 z-10"
          title="添加组件"
        >
          {React.createElement(PlusOutlined, { className: 'text-xs' })}
          添加
        </button>
      )}
      
      {/* 组件选择对话框 */}
      <Modal
        title="选择组件"
        open={showComponentModal}
        onCancel={() => {
          setShowComponentModal(false)
          setSearchQuery('')
        }}
        footer={null}
        width={800}
      >
        <div className="flex flex-col max-h-[70vh]">
          {/* 搜索框 */}
          <div className="mb-4 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索组件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  aria-label="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="text-xs text-gray-500 mt-1">
                {totalMatchCount > 0 ? `找到 ${totalMatchCount} 个组件` : '未找到匹配的组件'}
              </div>
            )}
          </div>
          
          {/* 组件列表 */}
          <div className="flex-1 overflow-y-auto">
            {/* 自定义组件 */}
            {filteredCustomComponents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">
                  自定义组件 ({filteredCustomComponents.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {filteredCustomComponents.map((comp) => (
                    <button
                      key={comp.moduleId}
                      onClick={() => handleAddComponent(comp.type, comp.elementData, comp.moduleId)}
                      className="p-3 border border-gray-200 rounded hover:border-green-400 hover:bg-green-50 transition-all text-left"
                      title={comp.description}
                    >
                      <div className="text-xl mb-1">{comp.icon}</div>
                      <div className="text-xs font-medium text-gray-700 truncate">{comp.label}</div>
                      {comp.description && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">{comp.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 系统组件 */}
            {filteredSystemComponents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">
                  系统组件 ({filteredSystemComponents.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {filteredSystemComponents.map((comp) => (
                    <button
                      key={comp.type}
                      onClick={() => handleAddComponent(comp.type)}
                      className="p-3 border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      title={comp.description}
                    >
                      <div className="text-xl mb-1">{comp.icon}</div>
                      <div className="text-xs font-medium text-gray-700 truncate">{comp.label}</div>
                      {comp.description && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">{comp.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Ant Design 组件 */}
            {filteredAntdComponents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">
                  Ant Design 组件 ({filteredAntdComponents.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {filteredAntdComponents.map((comp) => (
                    <button
                      key={comp.type}
                      onClick={() => handleAddComponent(comp.type)}
                      className="p-3 border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      title={comp.description}
                    >
                      <div className="text-xl mb-1">{comp.icon}</div>
                      <div className="text-xs font-medium text-gray-700 truncate">{comp.label}</div>
                      {comp.description && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">{comp.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 无搜索结果 */}
            {searchQuery && totalMatchCount === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">未找到匹配的组件</p>
                <p className="text-xs mt-1">尝试使用其他关键词搜索</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
TabContentRenderer.displayName = 'TabContentRenderer'

export function ElementRenderer({
  element,
  selectedElementId,
  onSelect,
  onUpdate,
  onDelete,
  onCopy,
  parentAutoFill = false,
}: ElementRendererProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: element.id,
  })

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: element.id,
    data: {
      type: 'element',
      element: element,
    },
  })

  // 合并两个 ref
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node)
    setDraggableRef(node)
  }

  const isSelected = selectedElementId === element.id
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [moduleName, setModuleName] = useState('')
  const [moduleLabel, setModuleLabel] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [includeChildren, setIncludeChildren] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkingName, setCheckingName] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  
  // 组件选择弹窗状态（用于容器组件）
  const [showComponentModal, setShowComponentModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customComponents, setCustomComponents] = useState<Array<{ type: string; label: string; icon: string; description?: string; elementData?: Element; moduleId?: string }>>([])
  
  // 加载自定义模块
  useEffect(() => {
    const loadCustomModules = async () => {
      try {
        const response = await fetch('/api/modules')
        const result = await response.json()
        if (result.success && result.data) {
          const modules = result.data.map((m: any) => ({
            type: m.name,
            label: m.label,
            icon: m.icon || '📦',
            description: m.description,
            elementData: m.element,
            moduleId: m.id,
          }))
          setCustomComponents(modules)
        }
      } catch (error) {
        console.error('加载自定义模块失败:', error)
      }
    }
    loadCustomModules()
    
    // 监听自定义模块保存事件
    const handleModuleSaved = () => {
      loadCustomModules()
    }
    window.addEventListener('customModuleSaved', handleModuleSaved)
    return () => {
      window.removeEventListener('customModuleSaved', handleModuleSaved)
    }
  }, [])
  
  // 过滤组件（根据搜索关键词）
  const filteredSystemComponents = useMemo(() => {
    if (!searchQuery) return systemComponents
    const query = searchQuery.toLowerCase()
    return systemComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery])
  
  const filteredAntdComponents = useMemo(() => {
    if (!searchQuery) return antdComponents
    const query = searchQuery.toLowerCase()
    return antdComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery])
  
  const filteredCustomComponents = useMemo(() => {
    if (!searchQuery) return customComponents
    const query = searchQuery.toLowerCase()
    return customComponents.filter(
      comp =>
        comp.label.toLowerCase().includes(query) ||
        comp.description?.toLowerCase().includes(query) ||
        comp.type.toLowerCase().includes(query)
    )
  }, [searchQuery, customComponents])
  
  const totalMatchCount = filteredSystemComponents.length + filteredAntdComponents.length + filteredCustomComponents.length
  
  // 添加组件到容器
  const handleAddComponentToContainer = (componentType: ElementType | string, elementData?: Element, moduleId?: string) => {
    let newElement: Element
    
    if (elementData && moduleId) {
      // 自定义模块：深拷贝并生成新ID
      const cloneElement = (el: Element): Element => {
        const newId = generateId()
        return {
          ...el,
          id: newId,
          moduleId: moduleId,
          children: el.children ? el.children.map(cloneElement) : undefined,
        }
      }
      newElement = cloneElement(elementData)
    } else {
      // 系统组件
      newElement = {
        id: generateId(),
        type: componentType as ElementType,
        props: getDefaultProps(componentType as ElementType),
      }
    }
    
    // 更新容器的 children
    onUpdate(element.id, {
      children: [...(element.children || []), newElement],
    })
    
    setShowComponentModal(false)
    setSearchQuery('')
  }

  const handleClick = (e: React.MouseEvent) => {
    // 如果刚刚拖拽过，不触发点击选择
    if (dragStartPos) {
      const dx = Math.abs(e.clientX - dragStartPos.x)
      const dy = Math.abs(e.clientY - dragStartPos.y)
      if (dx > 5 || dy > 5) {
        // 拖拽距离超过5px，认为是拖拽而不是点击
        setDragStartPos(null)
        return
      }
      setDragStartPos(null)
    }
    e.stopPropagation()
    onSelect(element.id)
    // 关闭右键菜单
    setContextMenu(null)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // 记录鼠标按下位置
    setDragStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[右键菜单] handleContextMenu 触发, element.id:', element.id, 'element:', element)
    setContextMenu({ x: e.clientX, y: e.clientY })
    // 选中当前元素
    console.log('[右键菜单] 调用 onSelect, 传递 element.id:', element.id)
    onSelect(element.id)
    console.log('[右键菜单] onSelect 调用完成, element.id:', element.id)
  }

  const handleStyleMenuClick = () => {
    console.log('[设置样式] handleStyleMenuClick 触发, element.id:', element.id, 'element:', element)
    console.log('[设置样式] 当前 selectedElementId (从 props):', selectedElementId)
    console.log('[设置样式] 当前 element.id 是否等于 selectedElementId:', element.id === selectedElementId)
    
    // 触发自定义事件，通知属性面板切换到样式标签页
    const eventDetail = {
      elementId: element.id,
      tab: 'style'
    }
    console.log('[设置样式] 准备发送 switchPropertyPanelTab 事件, detail:', eventDetail)
    console.log('[设置样式] 当前时间戳:', Date.now())
    const switchTabEvent = new CustomEvent('switchPropertyPanelTab', {
      detail: eventDetail
    })
    window.dispatchEvent(switchTabEvent)
    console.log('[设置样式] switchPropertyPanelTab 事件已发送, elementId:', element.id)
    
    // 滚动到属性面板
    const propertyPanel = document.querySelector('[data-property-panel]')
    if (propertyPanel) {
      console.log('[设置样式] 找到属性面板，准备滚动')
      propertyPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      console.warn('[设置样式] 未找到属性面板元素 [data-property-panel]')
    }
    setContextMenu(null)
    console.log('[设置样式] handleStyleMenuClick 完成, element.id:', element.id)
  }

  const handleDeleteMenuClick = () => {
    onDelete(element.id)
    setContextMenu(null)
  }

  const handleCopyMenuClick = () => {
    if (onCopy) {
      onCopy(element)
    }
    setContextMenu(null)
  }

  const handleSaveAsModuleClick = async () => {
    setContextMenu(null)
    
    // 自动生成默认名称
    const defaultLabel = element.props?.label || element.type || 'module'
    setModuleLabel(defaultLabel)
    setModuleDescription('')
    setIncludeChildren(true)
    
    // 生成默认模块名称并检查是否重复
    const baseName = `custom-${defaultLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    let generatedName = baseName
    setCheckingName(true)
    try {
      const response = await fetch('/api/modules')
      const result = await response.json()
      if (result.success) {
        const existingNames = (result.data || []).map((m: any) => m.name)
        let counter = 1
        while (existingNames.includes(generatedName)) {
          generatedName = `${baseName}-${counter}`
          counter++
        }
      }
    } catch (error) {
      console.error('检查模块名称失败:', error)
    } finally {
      setCheckingName(false)
    }
    
    setModuleName(generatedName)
    setShowSaveDialog(true)
  }

  // 深拷贝元素并生成新ID
  const cloneElement = (el: Element, includeChildren: boolean): Element => {
    const newId = generateId()
    const cloned: Element = {
      ...el,
      id: newId,
      children: includeChildren && el.children ? el.children.map(child => cloneElement(child, true)) : undefined,
    }
    return cloned
  }

  const handleSaveModule = async () => {
    if (!moduleName.trim() || !moduleLabel.trim()) {
      alert('请输入模块名称和显示名称')
      return
    }

    // 检查名称是否重复
    setCheckingName(true)
    try {
      const checkResponse = await fetch('/api/modules')
      const checkResult = await checkResponse.json()
      if (checkResult.success) {
        const existingNames = (checkResult.data || []).map((m: any) => m.name)
        if (existingNames.includes(moduleName.trim())) {
          alert(`模块名称 "${moduleName.trim()}" 已存在，请使用其他名称`)
          setCheckingName(false)
          return
        }
      }
    } catch (error) {
      console.error('检查模块名称失败:', error)
    } finally {
      setCheckingName(false)
    }

    setSaving(true)
    try {
      // 根据选择创建元素副本
      const elementCopy = cloneElement(element, includeChildren)

      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: moduleName.trim(),
          label: moduleLabel.trim(),
          icon: '📦',
          description: moduleDescription.trim() || undefined,
          element: elementCopy,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('模块保存成功！')
        setShowSaveDialog(false)
        // 触发自定义模块列表刷新
        window.dispatchEvent(new CustomEvent('customModuleSaved'))
      } else {
        alert(`保存失败：${result.error}`)
      }
    } catch (error: any) {
      console.error('保存模块失败:', error)
      alert(`保存失败：${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // 保存到现有模块（更新操作）
  const handleSaveToModuleClick = async () => {
    if (!element.moduleId) {
      alert('当前元素不是自定义模块，无法保存')
      return
    }

    setContextMenu(null)
    
    const confirmed = confirm('确定要将当前设置保存到自定义模块吗？这将更新模块的配置。')
    if (!confirmed) {
      return
    }

    setSaving(true)
    try {
      // 根据选择创建元素副本（不包含moduleId，因为这是要保存到模块的）
      const elementCopy = cloneElement(element, true)
      // 移除moduleId，因为这是要保存到模块的模板
      const removeModuleId = (el: Element): Element => {
        const { moduleId, ...rest } = el
        return {
          ...rest,
          children: el.children ? el.children.map(removeModuleId) : undefined,
        }
      }
      const elementToSave = removeModuleId(elementCopy)

      const response = await fetch(`/api/modules/${element.moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          element: elementToSave,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('模块更新成功！')
        // 触发自定义模块列表刷新
        window.dispatchEvent(new CustomEvent('customModuleSaved'))
      } else {
        alert(`更新失败：${result.error}`)
      }
    } catch (error: any) {
      console.error('更新模块失败:', error)
      alert(`更新失败：${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // 点击其他地方时关闭右键菜单
  const handleDocumentClick = () => {
    setContextMenu(null)
  }

  // 监听全局点击事件来关闭右键菜单
  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', handleDocumentClick)
      return () => {
        document.removeEventListener('click', handleDocumentClick)
      }
    }
  }, [contextMenu])

  // 基础样式（会保存到代码中）
  const baseStyle: React.CSSProperties = {
    ...element.style,
    position: 'relative',
    boxSizing: 'border-box', // 确保padding和border包含在高度内
  }

  // 设置默认最小尺寸（仅在未在style中指定时）
  if (element.type === 'container') {
    if (!baseStyle.minWidth) {
      baseStyle.minWidth = '100px'
    }
    if (!baseStyle.minHeight) {
      baseStyle.minHeight = '16px'
    }
  }

  // 容器自动填充布局（如果启用）
  if (element.type === 'container' && element.props?.autoFill) {
    baseStyle.display = 'flex'
    baseStyle.width = baseStyle.width || '100%'
    // 确保容器有高度，这样子元素才能使用 height: 100% 来填充
    // 如果父容器启用了autoFill，父容器应该有高度，所以这里也设置height: 100%
    baseStyle.height = baseStyle.height || '100%'
    
    if (element.props.flexDirection) {
      baseStyle.flexDirection = element.props.flexDirection as 'row' | 'column'
    }
    
    if (element.props.justifyContent) {
      baseStyle.justifyContent = element.props.justifyContent as any
    }
    
    if (element.props.alignItems) {
      baseStyle.alignItems = element.props.alignItems as any
    }
    
    if (element.props.flexWrap) {
      baseStyle.flexWrap = element.props.flexWrap as 'nowrap' | 'wrap' | 'wrap-reverse'
    }
    
    // 设置 gap（如果指定了）
    if (element.props.gap !== undefined && element.props.gap !== null && element.props.gap !== '') {
      // 如果gap是纯数字，添加px单位；否则使用原始值
      const gapValue = String(element.props.gap)
      baseStyle.gap = /^\d+$/.test(gapValue) ? `${gapValue}px` : gapValue
    } else if (element.children && element.children.length > 0) {
      // 如果没有指定gap但有子元素，默认设置为0px（这样可以清除浏览器默认样式）
      baseStyle.gap = '0px'
    }
  }

  // 如果父容器启用了自动填充，子元素使用 height: 100% 来填充父容器
  // 注意：这要求父容器有明确的高度（上面的逻辑已经确保启用autoFill的容器有height: 100%）
  if (parentAutoFill) {
    // 如果子元素没有显式设置高度，使用 100% 来填充父容器
    if (!baseStyle.height) {
      baseStyle.height = '100%'
    }
    // 同样处理宽度
    if (!baseStyle.width && element.type === 'container') {
      baseStyle.width = '100%'
    }
  }

  // 编辑器辅助样式（不会保存到代码中）
  const editorStyle: React.CSSProperties = {
    outline: isSelected ? '2px solid #3b82f6' : 'none',
    outlineOffset: '2px',
    opacity: isDragging ? 0.5 : 1,
  }

  // 容器特有的编辑器视觉提示样式
  if (element.type === 'container') {
    // 如果没有内容或背景色，显示虚线边框提示
    const hasBackground = element.style?.backgroundColor || element.className?.includes('bg-')
    const hasChildren = element.children && element.children.length > 0
    
    if (!hasBackground && !hasChildren) {
      editorStyle.border = '1px dashed #d1d5db'
      editorStyle.borderRadius = '4px'
    }
  }

  const style: React.CSSProperties = {
    ...baseStyle,
    ...editorStyle,
  }

  // 处理容器尺寸调整
  const handleResize = (deltaX: number, deltaY: number) => {
    if (element.type !== 'container') return

    const currentWidth = element.style?.width
      ? parseFloat(String(element.style.width).replace(/[^0-9.]/g, ''))
      : null
    const currentHeight = element.style?.height
      ? parseFloat(String(element.style.height).replace(/[^0-9.]/g, ''))
      : null

    const newStyle = { ...(element.style || {}) }
    
    if (deltaX !== 0) {
      const baseWidth = currentWidth !== null && !isNaN(currentWidth) ? currentWidth : 200
      const newWidth = Math.max(100, baseWidth + deltaX)
      newStyle.width = `${newWidth}px`
    }
    
    if (deltaY !== 0) {
      const baseHeight = currentHeight !== null && !isNaN(currentHeight) ? currentHeight : 100
      const newHeight = Math.max(50, baseHeight + deltaY)
      newStyle.height = `${newHeight}px`
    }

    onUpdate(element.id, { style: newStyle })
  }

  // 处理 a-tabs 的 items
  // 注意：不使用 useMemo，因为需要响应 items 数组内部的变化
  // 每次渲染时都重新计算，确保能正确响应 items 的更新
  let tabsProcessedItems: any = null
  if (element.type === 'a-tabs' && element.props?.items && Array.isArray(element.props.items)) {
    const tabsItems = element.props.items
    console.log('[ElementRenderer] 渲染 tabs，element.id:', element.id, 'items count:', tabsItems.length)
    tabsItems.forEach((item: any, index: number) => {
      const childrenCount = Array.isArray(item.children) ? item.children.length : 0
      console.log(`[ElementRenderer] Tab ${index}: key=${item.key}, children count=${childrenCount}`)
    })
    
    tabsProcessedItems = tabsItems.map((tabItem: any) => {
      // 将父 items 传递给子组件，以便在更新时使用
      const tabItemWithParent = {
        ...tabItem,
        __parentItems: tabsItems,
      }
      
      return {
        ...tabItem,
        // 使用稳定的 key，避免 React 认为这是新的元素
        children: (
          <TabContentRenderer
            key={`${element.id}-${tabItem.key}`}
            elementId={element.id}
            tabKey={tabItem.key}
            tabItem={tabItemWithParent}
            selectedElementId={selectedElementId}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onCopy={onCopy}
          />
        ),
      }
    })
  }

  let content: React.ReactNode = null

  switch (element.type) {
    case 'container':
      content = (
        <div
          ref={setNodeRef}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {element.children?.map(child => (
            <ElementRenderer
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onCopy={onCopy}
              parentAutoFill={element.props?.autoFill === true}
            />
          ))}
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 z-0 pointer-events-none" />
          )}
          {isSelected && (
            <>
              <ResizeHandle position="right" onResize={handleResize} />
              <ResizeHandle position="bottom" onResize={handleResize} />
              <ResizeHandle position="bottom-right" onResize={handleResize} />
            </>
          )}
        </div>
      )
      break

    case 'text':
      // 文本样式处理
      const textStyle: React.CSSProperties = { ...baseStyle }
      
      // 文本换行设置（默认允许换行）
      if (element.props?.textWrap === false) {
        textStyle.whiteSpace = 'nowrap'
      }
      
      // 文本打点（省略号）设置
      if (element.props?.textEllipsis === true) {
        textStyle.overflow = 'hidden'
        textStyle.textOverflow = 'ellipsis'
        
        // 如果禁用了换行，单行省略；如果允许换行，使用多行省略
        if (element.props?.textWrap === false) {
          // 单行省略：只需 nowrap + overflow hidden + textOverflow ellipsis
          // 已经在上面设置了
        } else {
          // 多行省略：使用 -webkit-line-clamp
          textStyle.display = '-webkit-box'
          ;(textStyle as any).WebkitLineClamp = element.props?.maxLines || 1
          ;(textStyle as any).WebkitBoxOrient = 'vertical'
        }
      }
      
      // 合并样式
      const finalTextStyle: React.CSSProperties = {
        ...textStyle,
        ...editorStyle,
      }
      
      content = (
        <span
          ref={setNodeRef}
          style={finalTextStyle}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {element.props?.text || '文本'}
        </span>
      )
      break

    case 'button':
      content = (
        <button
          ref={setNodeRef}
          style={style}
          className={`px-4 py-2 rounded ${element.className || ''}`}
          onClick={(e) => {
            e.preventDefault()
            handleClick(e)
          }}
          onContextMenu={handleContextMenu}
        >
          {element.props?.text || '按钮'}
        </button>
      )
      break

    case 'input':
      content = (
        <input
          ref={setNodeRef}
          type="text"
          placeholder={element.props?.placeholder || '请输入'}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          readOnly
        />
      )
      break

    case 'image':
      content = (
        <img
          ref={setNodeRef}
          src={element.props?.src || '/placeholder-image.png'}
          alt={element.props?.alt || '图片'}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        />
      )
      break

    case 'card':
      content = (
        <div
          ref={setNodeRef}
          style={style}
          className={`p-4 border rounded ${element.className || ''}`}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {element.children?.map(child => (
            <ElementRenderer
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onCopy={onCopy}
              parentAutoFill={false}
            />
          ))}
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50" />
          )}
        </div>
      )
      break

    case 'heading':
      const HeadingTag = `h${element.props?.level || 1}` as keyof JSX.IntrinsicElements
      content = (
        <HeadingTag
          ref={setNodeRef}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {element.props?.text || '标题'}
        </HeadingTag>
      )
      break

    case 'paragraph':
      content = (
        <p
          ref={setNodeRef}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {element.props?.text || '段落文本'}
        </p>
      )
      break

    case 'divider':
      content = (
        <hr
          ref={setNodeRef}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        />
      )
      break

    case 'list':
      const ListTag = element.props?.ordered ? 'ol' : 'ul'
      const items = element.props?.items || []
      content = (
        <ListTag
          ref={setNodeRef}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {items.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ListTag>
      )
      break

    case 'form':
      content = (
        <form
          ref={setNodeRef}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {element.children?.map(child => (
            <ElementRenderer
              key={child.id}
              element={child}
              selectedElementId={selectedElementId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onCopy={onCopy}
              parentAutoFill={false}
            />
          ))}
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50" />
          )}
        </form>
      )
      break

    // Ant Design 组件
    case 'a-button':
      // 处理图标：如果 props 中有 icon 字符串，转换为图标组件
      const buttonProps = { ...(element.props || {}) }
      if (buttonProps.icon && typeof buttonProps.icon === 'string') {
        const IconComponent = getIconComponent(buttonProps.icon)
        if (IconComponent) {
          buttonProps.icon = IconComponent
        } else {
          // 如果找不到对应的图标，移除 icon 属性
          delete buttonProps.icon
        }
      }
      
      // 处理点击事件
      const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        // 触发事件日志（如果配置了事件名称，默认启用日志）
        const hasEventName = element.props?.onClickEventName
        const enableLog = element.props?.enableLog !== false // 默认启用
        const shouldLog = hasEventName && enableLog
        
        if (shouldLog) {
          const eventName = element.props.onClickEventName
          const logMessage = `[事件触发] ${eventName} - 按钮被点击`
          const logData = {
            eventName,
            elementId: element.id,
            elementType: element.type,
            timestamp: new Date().toISOString(),
          }
          
          console.log(logMessage, logData)
          
          // 触发全局事件，供预览页面监听
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('pageBuilder:log', {
              detail: {
                type: 'event',
                message: logMessage,
                ...logData
              }
            }))
          }
        }
        
        // 在编辑器模式下才处理选择
        if (selectedElementId !== null) {
          handleClick(e as any)
        }
      }
      
      // 移除事件相关属性，避免传递给 Button 组件
      delete buttonProps.onClickEventName
      delete buttonProps.enableLog
      
      content = (
        <div 
          ref={setNodeRef} 
          onClick={handleClick} 
          onContextMenu={handleContextMenu} 
          style={style} 
          className={element.className}
        >
          <Button 
            {...buttonProps}
            onClick={handleButtonClick}
          >
            {element.props?.children || element.props?.text || 'Button'}
          </Button>
        </div>
      )
      break

    case 'a-input':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Input {...(element.props || {})} placeholder={element.props?.placeholder || '请输入'} />
        </div>
      )
      break

    case 'a-card':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Card {...(element.props || {})} title={element.props?.title}>
            {element.children?.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                selectedElementId={selectedElementId}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                parentAutoFill={false}
              />
            ))}
          </Card>
        </div>
      )
      break

    case 'a-form':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Form {...(element.props || {})}>
            {element.children?.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                selectedElementId={selectedElementId}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                parentAutoFill={false}
              />
            ))}
          </Form>
        </div>
      )
      break

    case 'a-select':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Select {...(element.props || {})} placeholder={element.props?.placeholder || '请选择'} style={{ width: '100%' }} />
        </div>
      )
      break

    case 'a-table':
      // 处理 Table 的 columns 和 dataSource
      const tableProps = { ...(element.props || {}) }
      
      // 确保 columns 和 dataSource 存在
      if (!tableProps.columns || !Array.isArray(tableProps.columns) || tableProps.columns.length === 0) {
        tableProps.columns = [
          { title: '姓名', dataIndex: 'name', key: 'name' },
          { title: '年龄', dataIndex: 'age', key: 'age' },
          { title: '地址', dataIndex: 'address', key: 'address' },
        ]
      }
      
      if (!tableProps.dataSource || !Array.isArray(tableProps.dataSource) || tableProps.dataSource.length === 0) {
        tableProps.dataSource = [
          { key: '1', name: '张三', age: 32, address: '北京市' },
          { key: '2', name: '李四', age: 42, address: '上海市' },
          { key: '3', name: '王五', age: 28, address: '广州市' },
        ]
      }
      
      // 设置默认 rowKey
      if (!tableProps.rowKey) {
        tableProps.rowKey = 'key'
      }
      
      // 处理分页配置
      // 如果 pagination 为 false，则不显示分页
      // 如果 pagination 为对象，使用该配置
      // 如果 pagination 为 undefined，使用默认分页配置
      if (tableProps.pagination === false) {
        // 不显示分页，保持 false
      } else if (!tableProps.pagination) {
        // 默认启用分页
        // 将 showTotal 设置为函数而不是 true，以避免 "showTotal is not a function" 错误
        tableProps.pagination = {
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number, range: [number, number]) => 
            `${range[0]}-${range[1]} of ${total} items`,
          showQuickJumper: false,
        }
      } else if (tableProps.pagination && typeof tableProps.pagination === 'object') {
        // 确保 pagination 对象有合理的默认值
        // 处理 showTotal: 如果是 true 或任何非函数值（除了 false），转换为默认函数
        let showTotalValue = tableProps.pagination.showTotal
        
        // 如果 showTotal 是 true 或不是函数/false，转换为默认函数以避免 "showTotal is not a function" 错误
        if (showTotalValue === true || (showTotalValue !== false && typeof showTotalValue !== 'function')) {
          showTotalValue = (total: number, range: [number, number]) => 
            `${range[0]}-${range[1]} of ${total} items`
        }
        // 如果 showTotal 是 false，保持 false
        // 如果 showTotal 已经是函数，保持函数
        
        tableProps.pagination = {
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: false,
          ...tableProps.pagination,
          // 确保 showTotal 是函数或 false，永远不会是 true
          showTotal: showTotalValue !== undefined ? showTotalValue : 
            ((total: number, range: [number, number]) => 
              `${range[0]}-${range[1]} of ${total} items`),
        }
      }
      
      content = (
        <div 
          ref={setNodeRef} 
          onClickCapture={(e) => {
            // 使用捕获阶段确保能捕获到 Table 内部的点击事件
            // 即使 Table 内部阻止了冒泡，我们也能在捕获阶段处理
            const target = e.target as HTMLElement
            const currentTarget = e.currentTarget as HTMLElement
            // 检查点击的是 table 容器或其子元素（包括 Table 组件内部的所有元素）
            // 只要点击发生在当前容器内，就处理事件
            if (currentTarget.contains(target) || target === currentTarget) {
              console.log('[Table] onClickCapture triggered', {
                elementId: element.id,
                target: target.tagName,
                willCallOnSelect: true
              })
              e.stopPropagation() // 阻止冒泡到 tabs
              // 直接调用 onSelect，确保元素被选中
              onSelect(element.id)
              // 也调用 handleClick 来处理其他逻辑（如关闭右键菜单）
              handleClick(e)
            }
          }}
          onClick={(e) => {
            // 备用处理：如果捕获阶段没有捕获到，在冒泡阶段处理
            const target = e.target as HTMLElement
            const currentTarget = e.currentTarget as HTMLElement
            if (currentTarget.contains(target) || target === currentTarget) {
              console.log('[Table] onClick (bubble) triggered', {
                elementId: element.id,
                target: target.tagName
              })
              e.stopPropagation()
              onSelect(element.id)
              handleClick(e)
            }
          }}
          onContextMenuCapture={(e) => {
            // 使用捕获阶段确保能捕获到 Table 内部的右键菜单事件
            const target = e.target as HTMLElement
            const currentTarget = e.currentTarget as HTMLElement
            // 只要右键点击发生在当前容器内，就处理事件
            if (currentTarget.contains(target) || target === currentTarget) {
              console.log('[Table] onContextMenuCapture triggered', {
                elementId: element.id,
                target: target.tagName,
                currentTarget: currentTarget.getAttribute('data-element-id')
              })
              e.stopPropagation() // 阻止冒泡到 tabs
              e.preventDefault() // 阻止默认右键菜单
              // 直接调用 handleContextMenu，因为它内部已经有 preventDefault
              handleContextMenu(e)
            }
          }}
          onContextMenu={(e) => {
            // 备用处理：如果捕获阶段没有捕获到，在冒泡阶段处理
            const target = e.target as HTMLElement
            const currentTarget = e.currentTarget as HTMLElement
            if (currentTarget.contains(target) || target === currentTarget) {
              console.log('[Table] onContextMenu (bubble) triggered', {
                elementId: element.id,
                target: target.tagName
              })
              e.stopPropagation()
              e.preventDefault()
              handleContextMenu(e)
            }
          }}
          style={style} 
          className={element.className}
          data-element-id={element.id}
        >
          <Table {...tableProps} />
        </div>
      )
      break

    case 'a-datepicker':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <DatePicker {...(element.props || {})} style={{ width: '100%' }} />
        </div>
      )
      break

    case 'a-radio':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Radio {...(element.props || {})}>{element.props?.children || element.props?.label || 'Radio'}</Radio>
        </div>
      )
      break

    case 'a-checkbox':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Checkbox {...(element.props || {})}>{element.props?.children || element.props?.label || 'Checkbox'}</Checkbox>
        </div>
      )
      break

    case 'a-switch':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Switch {...(element.props || {})} />
        </div>
      )
      break

    case 'a-slider':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Slider {...(element.props || {})} />
        </div>
      )
      break

    case 'a-rate':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Rate {...(element.props || {})} />
        </div>
      )
      break

    case 'a-tag':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Tag {...(element.props || {})}>{element.props?.children || element.props?.text || 'Tag'}</Tag>
        </div>
      )
      break

    case 'a-badge':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Badge {...(element.props || {})}>
            {element.children?.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                selectedElementId={selectedElementId}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                parentAutoFill={false}
              />
            ))}
          </Badge>
        </div>
      )
      break

    case 'a-avatar':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Avatar {...(element.props || {})}>{element.props?.children || element.props?.text}</Avatar>
        </div>
      )
      break

    case 'a-divider':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <AntdDivider {...(element.props || {})}>{element.props?.children || element.props?.text}</AntdDivider>
        </div>
      )
      break

    case 'a-space':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Space {...(element.props || {})}>
            {element.children?.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                selectedElementId={selectedElementId}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                parentAutoFill={false}
              />
            ))}
          </Space>
        </div>
      )
      break

    case 'a-row':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Row {...(element.props || {})}>
            {element.children?.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                selectedElementId={selectedElementId}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                parentAutoFill={false}
              />
            ))}
          </Row>
        </div>
      )
      break

    case 'a-col':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Col {...(element.props || {})}>
            {element.children?.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                selectedElementId={selectedElementId}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                parentAutoFill={false}
              />
            ))}
          </Col>
        </div>
      )
      break

    case 'a-tabs': {
      // Ant Design Tabs 支持 items 配置方式
      const tabsProps = { ...(element.props || {}) }
      
      // 如果使用 items 配置，使用 useMemo 处理的结果
      if (tabsProcessedItems) {
        tabsProps.items = tabsProcessedItems
      } else {
        // 如果没有 items 配置，使用 children 方式（向后兼容）
        // 注意：Ant Design v5+ 主要使用 items，但也可以使用 TabPane 方式
        // 这里保持原有逻辑
      }
      
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Tabs {...tabsProps} key={element.id}>
            {/* 如果没有 items，使用 children 方式 */}
            {!tabsProps.items && element.children?.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                selectedElementId={selectedElementId}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                parentAutoFill={false}
              />
            ))}
          </Tabs>
        </div>
      )
      break
    }

    case 'a-alert':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Alert {...(element.props || {})} message={element.props?.message || 'Alert'} description={element.props?.description} />
        </div>
      )
      break

    case 'a-spin':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Spin {...(element.props || {})}>
            {element.children?.map(child => (
              <ElementRenderer
                key={child.id}
                element={child}
                selectedElementId={selectedElementId}
                onSelect={onSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
                parentAutoFill={false}
              />
            ))}
          </Spin>
        </div>
      )
      break

    default:
      content = (
        <div
          ref={setNodeRef}
          style={style}
          className={element.className}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {element.type}
        </div>
      )
  }

  return (
    <>
      <div 
        className="relative group" 
        data-element-id={element.id}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
      >
        {content}
        {/* 拖拽手柄 - 悬停或选中时显示 */}
        {(isSelected || isDragging) && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-0 right-0 bg-blue-600 text-white px-1.5 py-0.5 rounded-bl cursor-move z-50 hover:bg-blue-700"
            title="拖拽移动"
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
        )}
        {/* 未选中时，悬停显示拖拽手柄 */}
        {!isSelected && !isDragging && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-0 right-0 bg-gray-100 hover:bg-gray-200 rounded-bl px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10"
            title="拖拽移动"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(element.id)
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
        )}
        {isSelected && (
          <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded z-50 flex items-center gap-2">
            <span>{element.type}</span>
            <button
              className="text-red-200 hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(element.id)
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[200] min-w-[160px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              onClick={handleStyleMenuClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              设置样式
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              onClick={handleCopyMenuClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              复制
            </button>
            {/* 容器组件显示添加组件选项 */}
            {element.type === 'container' && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  onClick={() => {
                    setContextMenu(null)
                    setShowComponentModal(true)
                  }}
                >
                  {React.createElement(PlusOutlined, { className: 'h-4 w-4' })}
                  添加组件
                </button>
              </>
            )}
            <div className="border-t border-gray-200 my-1"></div>
            {/* 如果元素来自自定义模块，显示保存菜单 */}
            {element.moduleId && (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  onClick={handleSaveToModuleClick}
                  disabled={saving}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {saving ? '保存中...' : '保存'}
                </button>
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}
            <button
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              onClick={handleSaveAsModuleClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              另存为
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={handleDeleteMenuClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              删除
            </button>
          </div>
          {/* 背景遮罩，点击关闭菜单 */}
          <div
            className="fixed inset-0 z-[199]"
            onClick={() => setContextMenu(null)}
          />
        </>
      )}
      {/* 另存为自定义模块对话框 */}
      {showSaveDialog && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[300] flex items-center justify-center"
            onClick={() => setShowSaveDialog(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                另存为自定义模块
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模块名称（英文，唯一标识）*
                  </label>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如: custom-banner"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    显示名称*
                  </label>
                  <input
                    type="text"
                    value={moduleLabel}
                    onChange={(e) => setModuleLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如: 轮播图"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述（可选）
                  </label>
                  <textarea
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="模块描述"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeChildren}
                      onChange={(e) => setIncludeChildren(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      包含子元素
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 ml-6 mt-0.5">
                    {includeChildren ? '将保存当前模块及其所有子元素' : '仅保存当前模块，不包含子元素'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={() => setShowSaveDialog(false)}
                  disabled={saving}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  onClick={handleSaveModule}
                  disabled={saving || !moduleName.trim() || !moduleLabel.trim()}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* 组件选择对话框（用于容器组件） */}
      {element.type === 'container' && (
        <Modal
          title="选择组件"
          open={showComponentModal}
          onCancel={() => {
            setShowComponentModal(false)
            setSearchQuery('')
          }}
          footer={null}
          width={800}
        >
          <div className="flex flex-col max-h-[70vh]">
            {/* 搜索框 */}
            <div className="mb-4 flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索组件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    aria-label="清除搜索"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="text-xs text-gray-500 mt-1">
                  {totalMatchCount > 0 ? `找到 ${totalMatchCount} 个组件` : '未找到匹配的组件'}
                </div>
              )}
            </div>
            
            {/* 组件列表 */}
            <div className="flex-1 overflow-y-auto">
              {/* 自定义组件 */}
              {filteredCustomComponents.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">
                    自定义组件 ({filteredCustomComponents.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {filteredCustomComponents.map((comp) => (
                      <button
                        key={comp.moduleId}
                        onClick={() => handleAddComponentToContainer(comp.type, comp.elementData, comp.moduleId)}
                        className="p-3 border border-gray-200 rounded hover:border-green-400 hover:bg-green-50 transition-all text-left"
                        title={comp.description}
                      >
                        <div className="text-xl mb-1">{comp.icon}</div>
                        <div className="text-xs font-medium text-gray-700 truncate">{comp.label}</div>
                        {comp.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">{comp.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 系统组件 */}
              {filteredSystemComponents.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">
                    系统组件 ({filteredSystemComponents.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {filteredSystemComponents.map((comp) => (
                      <button
                        key={comp.type}
                        onClick={() => handleAddComponentToContainer(comp.type)}
                        className="p-3 border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                        title={comp.description}
                      >
                        <div className="text-xl mb-1">{comp.icon}</div>
                        <div className="text-xs font-medium text-gray-700 truncate">{comp.label}</div>
                        {comp.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">{comp.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Ant Design 组件 */}
              {filteredAntdComponents.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-1">
                    Ant Design 组件 ({filteredAntdComponents.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {filteredAntdComponents.map((comp) => (
                      <button
                        key={comp.type}
                        onClick={() => handleAddComponentToContainer(comp.type)}
                        className="p-3 border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                        title={comp.description}
                      >
                        <div className="text-xl mb-1">{comp.icon}</div>
                        <div className="text-xs font-medium text-gray-700 truncate">{comp.label}</div>
                        {comp.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">{comp.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 无搜索结果 */}
              {searchQuery && totalMatchCount === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">未找到匹配的组件</p>
                  <p className="text-xs mt-1">尝试使用其他关键词搜索</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}


