// 页面构建器相关类型定义

export type ElementType =
  | 'container'
  | 'text'
  | 'button'
  | 'input'
  | 'image'
  | 'card'
  | 'divider'
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'form'
  // Ant Design 组件
  | 'a-button'
  | 'a-input'
  | 'a-card'
  | 'a-form'
  | 'a-table'
  | 'a-select'
  | 'a-datepicker'
  | 'a-radio'
  | 'a-checkbox'
  | 'a-switch'
  | 'a-slider'
  | 'a-rate'
  | 'a-tag'
  | 'a-badge'
  | 'a-avatar'
  | 'a-divider'
  | 'a-space'
  | 'a-row'
  | 'a-col'
  | 'a-layout'
  | 'a-menu'
  | 'a-tabs'
  | 'a-collapse'
  | 'a-timeline'
  | 'a-list'
  | 'a-empty'
  | 'a-spin'
  | 'a-alert'
  | 'a-message'
  | 'a-notification'
  | 'a-modal'
  | 'a-drawer'
  | 'a-popconfirm'
  | 'a-popover'
  | 'a-tooltip'
  | 'a-dropdown'

export interface BaseElement {
  id: string
  type: ElementType
  props: Record<string, any>
  children?: Element[]
  style?: Record<string, string | number>
  className?: string
  moduleId?: string // 如果元素来自自定义模块，保存模块ID
  undeletable?: boolean // 标记元素不可删除（如 tabs content 中的默认 container）
}

export interface Element extends BaseElement {
  children?: Element[]
}

// 页面配置
export interface PageConfig {
  id: string
  name: string
  description?: string
  elements: Element[]
  createdAt: number
  updatedAt: number
  userId?: number
}

// 创建页面请求
export interface CreatePageRequest {
  name: string
  description?: string
  elements: Element[]
}

// 更新页面请求
export interface UpdatePageRequest {
  name?: string
  description?: string
  elements?: Element[]
}

// 组件属性配置
export interface ComponentProps {
  [key: string]: any
}

// 组件定义（用于组件库）
export interface ComponentDefinition {
  type: ElementType | string // 自定义模块使用字符串类型
  label: string
  icon: string
  category: 'system' | 'custom'
  description?: string
  elementData?: Element // 自定义模块的元素数据
  moduleId?: string // 自定义模块的ID（仅自定义模块有此字段）
}

// 自定义模块（保存的元素配置）
export interface CustomModule {
  id: string
  name: string
  label: string
  icon: string
  description?: string
  element: Element // 保存的元素配置
  createdAt: number
  updatedAt: number
}

// 创建自定义模块请求
export interface CreateCustomModuleRequest {
  name: string
  label: string
  icon?: string
  description?: string
  element: Element
}

// 更新自定义模块请求
export interface UpdateCustomModuleRequest {
  label?: string
  icon?: string
  description?: string
  element?: Element
}

