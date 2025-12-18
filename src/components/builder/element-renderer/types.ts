import { Element } from '@/lib/types'

export type ElementUpdateHandler = (id: string, updates: Partial<Element>) => void
export type ElementDeleteHandler = (id: string) => void
export type ElementCopyHandler = (element: Element) => void

export interface ElementRendererProps {
  element: Element
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onUpdate: ElementUpdateHandler
  onDelete: ElementDeleteHandler
  onCopy?: ElementCopyHandler
  parentAutoFill?: boolean
}

export interface ChildRendererOverrides {
  onUpdate?: ElementUpdateHandler
  onDelete?: ElementDeleteHandler
  onCopy?: ElementCopyHandler
  parentAutoFill?: boolean
}

export type ChildRenderer = (child: Element, overrides?: ChildRendererOverrides, keyOverride?: string) => React.ReactNode
