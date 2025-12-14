'use client'

import React, { useState, useEffect } from 'react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { Element } from '@/lib/types'
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
    setContextMenu({ x: e.clientX, y: e.clientY })
    // 选中当前元素
    onSelect(element.id)
  }

  const handleStyleMenuClick = () => {
    // 滚动到属性面板
    const propertyPanel = document.querySelector('[data-property-panel]')
    if (propertyPanel) {
      propertyPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    setContextMenu(null)
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
          {/* 空容器的提示文字（仅在编辑模式显示） */}
          {(!element.children || element.children.length === 0) && !isSelected && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 pointer-events-none z-0">
              空容器
            </div>
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
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClick(e as any)
            }}
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

    case 'a-tabs':
      content = (
        <div ref={setNodeRef} onClick={handleClick} onContextMenu={handleContextMenu} style={style} className={element.className}>
          <Tabs {...(element.props || {})}>
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
          </Tabs>
        </div>
      )
      break

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
    </>
  )
}


