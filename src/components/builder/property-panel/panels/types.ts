import { Element } from '@/lib/types'

export interface PanelProps {
  element: Element
  updateProps: (key: string, value: any) => void
  updateStyle: (key: string, value: string) => void
  onUpdate: (updates: Partial<Element>) => void
}

