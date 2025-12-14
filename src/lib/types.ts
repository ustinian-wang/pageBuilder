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

export interface BaseElement {
  id: string
  type: ElementType
  props: Record<string, any>
  children?: Element[]
  style?: Record<string, string | number>
  className?: string
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

