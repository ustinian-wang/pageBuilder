import { ElementType } from '@/lib/types'

// Ant Design 组件列表（用于类型切换）
export const antdComponentTypes: Array<{ type: ElementType; label: string; icon: string }> = [
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
export function getAntdDefaultProps(type: ElementType): Record<string, any> {
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
    'a-tabs': { 
      items: [
        { key: 'tab-1', label: '标签页 1', children: [] },
        { key: 'tab-2', label: '标签页 2', children: [] },
      ]
    },
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
export function isAntdComponent(type: ElementType): boolean {
  return type.startsWith('a-')
}

