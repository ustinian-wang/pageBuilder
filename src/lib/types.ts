// 页面构建器相关类型定义

export type ElementType =
  | 'container'
  | 'layout'
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

// 表单元素相关类型
export type FormFieldComponentType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'switch'
  | 'a-input'
  | 'a-select'
  | 'a-radio'
  | 'a-checkbox'
  | 'a-switch'

export interface FormFieldOption {
  label: string
  value: string
}

export interface FormValidationRule {
  id: string
  type: 'required' | 'string' | 'number' | 'email' | 'pattern'
  message?: string
  min?: number
  max?: number
  pattern?: string
}

export interface FormFieldDependency {
  id: string
  sourceFieldId: string
  operator: 'equals' | 'notEquals' | 'includes' | 'in'
  value?: string | number | string[]
  action: 'show' | 'hide' | 'enable' | 'disable'
}

export interface FormFieldConfig {
  id: string
  name: string
  label: string
  placeholder?: string
  component: FormFieldComponentType
  componentProps?: Record<string, any>
  options?: FormFieldOption[]
  groupId?: string
  required?: boolean
  validations?: FormValidationRule[]
  dependencies?: FormFieldDependency[]
}

export interface FormGroup {
  id: string
  label: string
  description?: string
}

export interface FormElementProps {
  fields: FormFieldConfig[]
  labelWidth?: number
  labelWrap?: boolean
  labelEllipsis?: boolean
  groups?: FormGroup[]
  layout?: 'horizontal' | 'vertical'
  rowGap?: number
  submitLabel?: string
  cancelLabel?: string
  actionsVariant?: 'default' | 'bar'
  actionsAlign?: 'left' | 'center' | 'right'
  actionsGap?: number
  actionsPadding?: number
  actionsBackground?: string
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
  category: 'system' | 'custom' | 'composite'
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
