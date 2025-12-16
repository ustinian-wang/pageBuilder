'use client'

import React, { useMemo } from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import type { FormElementProps, FormFieldConfig, FormFieldDependency, FormValidationRule, FormGroup } from '@/lib/types'
import { PanelProps } from './types'
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { generateId } from '@/lib/utils'

interface FormPanelProps extends PanelProps {}

const componentOptions: Array<{ value: FormFieldConfig['component']; label: string }> = [
  { value: 'input', label: '文本输入' },
  { value: 'textarea', label: '多行文本' },
  { value: 'select', label: '原生下拉' },
  { value: 'radio', label: '原生单选' },
  { value: 'checkbox', label: '原生复选' },
  { value: 'date', label: '日期' },
  { value: 'number', label: '数字' },
  { value: 'switch', label: '开关' },
  { value: 'a-input', label: 'Antd Input' },
  { value: 'a-select', label: 'Antd Select' },
  { value: 'a-radio', label: 'Antd Radio' },
  { value: 'a-checkbox', label: 'Antd Checkbox' },
  { value: 'a-switch', label: 'Antd Switch' },
]

const validationOptions: Array<{ value: FormValidationRule['type']; label: string }> = [
  { value: 'required', label: '必填' },
  { value: 'string', label: '字符串长度' },
  { value: 'number', label: '数值范围' },
  { value: 'email', label: '邮箱格式' },
  { value: 'pattern', label: '正则匹配' },
]

export function FormPanel({ element, onUpdate }: FormPanelProps) {
  const formProps = useMemo<FormElementProps>(() => {
    return {
      fields: element.props?.fields || [],
      labelWidth: element.props?.labelWidth ?? 122,
      labelWrap: element.props?.labelWrap !== false,
      labelEllipsis: element.props?.labelEllipsis === true,
      groups: element.props?.groups || [],
      layout: element.props?.layout || 'horizontal',
      rowGap: element.props?.rowGap ?? 16,
      submitLabel: element.props?.submitLabel || '提交',
      cancelLabel: element.props?.cancelLabel || '取消',
    }
  }, [element.props])

  const updateFormProps = (patch: Partial<FormElementProps>) => {
    onUpdate({
      props: {
        ...element.props,
        ...patch,
      },
    })
  }

  const handleFieldChange = (fieldId: string, updates: Partial<FormFieldConfig>) => {
    const newFields = formProps.fields.map(field => (field.id === fieldId ? { ...field, ...updates } : field))
    updateFormProps({ fields: newFields })
  }

  const handleAddField = () => {
    const newField: FormFieldConfig = {
      id: generateId(),
      name: `field_${formProps.fields.length + 1}`,
      label: `表单项 ${formProps.fields.length + 1}`,
      component: 'input',
      placeholder: '请输入',
      componentProps: {},
      options: [],
      validations: [],
      dependencies: [],
    }
    updateFormProps({ fields: [...formProps.fields, newField] })
  }

  const handleRemoveField = (fieldId: string) => {
    const newFields = formProps.fields.filter(field => field.id !== fieldId)
    updateFormProps({ fields: newFields })
  }

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= formProps.fields.length) return
    const newFields = [...formProps.fields]
    const [moved] = newFields.splice(index, 1)
    newFields.splice(newIndex, 0, moved)
    updateFormProps({ fields: newFields })
  }

  const handleAddGroup = () => {
    const newGroup: FormGroup = {
      id: generateId(),
      label: `分组 ${formProps.groups?.length + 1}`,
    }
    updateFormProps({ groups: [...(formProps.groups || []), newGroup] })
  }

  const handleGroupChange = (groupId: string, updates: Partial<FormGroup>) => {
    const newGroups = (formProps.groups || []).map(group => (group.id === groupId ? { ...group, ...updates } : group))
    updateFormProps({ groups: newGroups })
  }

  const handleRemoveGroup = (groupId: string) => {
    const newGroups = (formProps.groups || []).filter(group => group.id !== groupId)
    const newFields = formProps.fields.map(field => (field.groupId === groupId ? { ...field, groupId: undefined } : field))
    updateFormProps({ groups: newGroups, fields: newFields })
  }

  const renderField = (field: FormFieldConfig, index: number) => {
    return (
      <div key={field.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between text-sm font-medium text-gray-700">
          <span>{field.label}</span>
          <div className="space-x-2">
            <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => moveField(index, -1)}>
              <ArrowUpOutlined />
            </button>
            <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => moveField(index, 1)}>
              <ArrowDownOutlined />
            </button>
            <button type="button" className="text-red-500 hover:text-red-600" onClick={() => handleRemoveField(field.id)}>
              <DeleteOutlined />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">显示文本</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={field.label}
              onChange={e => handleFieldChange(field.id, { label: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">字段名</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={field.name}
              onChange={e => handleFieldChange(field.id, { name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">占位提示</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={field.placeholder || ''}
              onChange={e => handleFieldChange(field.id, { placeholder: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">组件类型</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={field.component}
              onChange={e => handleFieldChange(field.id, { component: e.target.value as FormFieldConfig['component'] })}
            >
              {componentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">所属分组</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={field.groupId || ''}
              onChange={e => handleFieldChange(field.id, { groupId: e.target.value || undefined })}
            >
              <option value="">未分组</option>
              {(formProps.groups || []).map(group => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 text-sm pt-5">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={e => handleFieldChange(field.id, { required: e.target.checked })}
              />
              必填
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={field.componentProps?.disabled === true}
                onChange={e =>
                  handleFieldChange(field.id, {
                    componentProps: { ...field.componentProps, disabled: e.target.checked },
                  })
                }
              />
              禁用
            </label>
          </div>
        </div>

        {['select', 'radio', 'checkbox', 'a-select', 'a-radio', 'a-checkbox'].includes(field.component) && (
          <OptionEditor field={field} onChange={options => handleFieldChange(field.id, { options })} />
        )}

        <ValidationEditor field={field} onChange={validations => handleFieldChange(field.id, { validations })} />

        <DependencyEditor
          field={field}
          allFields={formProps.fields}
          onChange={dependencies => handleFieldChange(field.id, { dependencies })}
        />
      </div>
    )
  }

  return (
    <TabsContent value="basic" className="mt-0 p-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">表单布局</label>
        <select
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          value={formProps.layout}
          onChange={e => updateFormProps({ layout: e.target.value as FormElementProps['layout'] })}
        >
          <option value="horizontal">左右布局</option>
          <option value="vertical">上下布局</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">行间距</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={formProps.rowGap}
            onChange={e => updateFormProps({ rowGap: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">标签宽度(px)</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={formProps.labelWidth}
            onChange={e => updateFormProps({ labelWidth: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={formProps.labelWrap}
            onChange={e => updateFormProps({ labelWrap: e.target.checked })}
          />
          标签多行
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={formProps.labelEllipsis}
            onChange={e => updateFormProps({ labelEllipsis: e.target.checked })}
          />
          文本省略
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">提交按钮</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={formProps.submitLabel}
            onChange={e => updateFormProps({ submitLabel: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">取消按钮</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={formProps.cancelLabel}
            onChange={e => updateFormProps({ cancelLabel: e.target.value })}
          />
        </div>
      </div>

      <GroupManager
        groups={formProps.groups || []}
        onAdd={handleAddGroup}
        onChange={handleGroupChange}
        onRemove={handleRemoveGroup}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">表单项 ({formProps.fields.length})</h3>
          <button type="button" className="text-xs text-blue-600 hover:text-blue-700" onClick={handleAddField}>
            <PlusOutlined className="mr-1" /> 新增表单项
          </button>
        </div>
        <div className="space-y-3">
          {formProps.fields.map(renderField)}
          {formProps.fields.length === 0 && <div className="text-xs text-gray-500">暂无表单项，点击“新增”开始配置</div>}
        </div>
      </div>
    </TabsContent>
  )
}

function GroupManager({
  groups,
  onAdd,
  onChange,
  onRemove,
}: {
  groups: FormGroup[]
  onAdd: () => void
  onChange: (id: string, updates: Partial<FormGroup>) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">表单分组</h3>
        <button type="button" className="text-xs text-blue-600 hover:text-blue-700" onClick={onAdd}>
          <PlusOutlined className="mr-1" /> 新增分组
        </button>
      </div>
      {groups.length === 0 && <div className="text-xs text-gray-500">默认只有一个分组，可在此创建多个分组</div>}
      <div className="space-y-2">
        {groups.map(group => (
          <div key={group.id} className="border border-dashed border-gray-300 rounded p-2 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="分组名称"
                value={group.label}
                onChange={e => onChange(group.id, { label: e.target.value })}
              />
              <button type="button" className="text-red-500" onClick={() => onRemove(group.id)}>
                <DeleteOutlined />
              </button>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="分组描述 (可选)"
              value={group.description || ''}
              onChange={e => onChange(group.id, { description: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

interface OptionEditorProps {
  field: FormFieldConfig
  onChange: (options: FormFieldConfig['options']) => void
}

function OptionEditor({ field, onChange }: OptionEditorProps) {
  const options = field.options || []

  const handleAddOption = () => {
    const next = [...options, { label: `选项${options.length + 1}`, value: `option_${options.length + 1}` }]
    onChange(next)
  }

  const handleUpdate = (idx: number, key: 'label' | 'value', value: string) => {
    const next = options.map((opt, index) => (index === idx ? { ...opt, [key]: value } : opt))
    onChange(next)
  }

  const handleRemove = (idx: number) => {
    const next = options.filter((_, index) => index !== idx)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">选项配置</span>
        <button type="button" className="text-xs text-blue-600" onClick={handleAddOption}>
          <PlusOutlined />
        </button>
      </div>
      {options.map((option, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="显示文本"
            value={option.label}
            onChange={e => handleUpdate(idx, 'label', e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
              placeholder="选项值"
              value={option.value}
              onChange={e => handleUpdate(idx, 'value', e.target.value)}
            />
            <button type="button" className="text-red-500" onClick={() => handleRemove(idx)}>
              <DeleteOutlined />
            </button>
          </div>
        </div>
      ))}
      {options.length === 0 && <div className="text-xs text-gray-400">暂无选项</div>}
    </div>
  )
}

interface ValidationEditorProps {
  field: FormFieldConfig
  onChange: (rules: FormFieldConfig['validations']) => void
}

function ValidationEditor({ field, onChange }: ValidationEditorProps) {
  const rules = field.validations || []

  const handleAddRule = () => {
    const newRule: FormValidationRule = {
      id: generateId(),
      type: 'required',
      message: `${field.label}为必填项`,
    }
    onChange([...(rules || []), newRule])
  }

  const handleRuleChange = (ruleId: string, updates: Partial<FormValidationRule>) => {
    onChange(rules.map(rule => (rule.id === ruleId ? { ...rule, ...updates } : rule)))
  }

  const handleRemoveRule = (ruleId: string) => {
    onChange(rules.filter(rule => rule.id !== ruleId))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">校验规则</span>
        <button type="button" className="text-xs text-blue-600" onClick={handleAddRule}>
          <PlusOutlined />
        </button>
      </div>
      {rules.map(rule => (
        <div key={rule.id} className="border border-dashed border-gray-200 rounded p-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={rule.type}
              onChange={e => handleRuleChange(rule.id, { type: e.target.value as FormValidationRule['type'] })}
            >
              {validationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="提示语"
              value={rule.message || ''}
              onChange={e => handleRuleChange(rule.id, { message: e.target.value })}
            />
          </div>
          {(rule.type === 'string' || rule.type === 'number') && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="最小值/长度"
                value={rule.min ?? ''}
                onChange={e => handleRuleChange(rule.id, { min: e.target.value ? Number(e.target.value) : undefined })}
              />
              <input
                type="number"
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="最大值/长度"
                value={rule.max ?? ''}
                onChange={e => handleRuleChange(rule.id, { max: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          )}
          {rule.type === 'pattern' && (
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
              placeholder="正则表达式"
              value={rule.pattern || ''}
              onChange={e => handleRuleChange(rule.id, { pattern: e.target.value })}
            />
          )}
          <button type="button" className="text-xs text-red-500" onClick={() => handleRemoveRule(rule.id)}>
            删除规则
          </button>
        </div>
      ))}
      {rules.length === 0 && <div className="text-xs text-gray-400">暂无规则</div>}
    </div>
  )
}

interface DependencyEditorProps {
  field: FormFieldConfig
  allFields: FormFieldConfig[]
  onChange: (deps: FormFieldConfig['dependencies']) => void
}

const dependencyActions: Array<{ value: FormFieldDependency['action']; label: string }> = [
  { value: 'show', label: '显示' },
  { value: 'hide', label: '隐藏' },
  { value: 'enable', label: '启用' },
  { value: 'disable', label: '禁用' },
]

const dependencyOperators: Array<{ value: FormFieldDependency['operator']; label: string }> = [
  { value: 'equals', label: '等于' },
  { value: 'notEquals', label: '不等于' },
  { value: 'includes', label: '包含' },
  { value: 'in', label: '属于集合' },
]

function DependencyEditor({ field, allFields, onChange }: DependencyEditorProps) {
  const dependencies = field.dependencies || []
  const candidateFields = allFields.filter(f => f.id !== field.id)

  const handleAddDependency = () => {
    const firstField = candidateFields[0]
    if (!firstField) return
    const dep: FormFieldDependency = {
      id: generateId(),
      sourceFieldId: firstField.id,
      operator: 'equals',
      value: '',
      action: 'show',
    }
    onChange([...(dependencies || []), dep])
  }

  const handleDependencyChange = (depId: string, updates: Partial<FormFieldDependency>) => {
    onChange(dependencies.map(dep => (dep.id === depId ? { ...dep, ...updates } : dep)))
  }

  const handleRemoveDependency = (depId: string) => {
    onChange(dependencies.filter(dep => dep.id !== depId))
  }

  if (candidateFields.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">联动设置</span>
        <button type="button" className="text-xs text-blue-600" onClick={handleAddDependency}>
          <PlusOutlined />
        </button>
      </div>
      {dependencies.map(dep => (
        <div key={dep.id} className="border border-dashed border-gray-200 rounded p-2 space-y-2">
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            value={dep.sourceFieldId}
            onChange={e => handleDependencyChange(dep.id, { sourceFieldId: e.target.value })}
          >
            {candidateFields.map(candidate => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={dep.operator}
              onChange={e => handleDependencyChange(dep.id, { operator: e.target.value as FormFieldDependency['operator'] })}
            >
              {dependencyOperators.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={dep.action}
              onChange={e => handleDependencyChange(dep.id, { action: e.target.value as FormFieldDependency['action'] })}
            >
              {dependencyActions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            placeholder="触发值，多个值用逗号分隔"
            value={Array.isArray(dep.value) ? dep.value.join(',') : (dep.value as string | number | undefined) || ''}
            onChange={e => {
              const raw = e.target.value
              const parsed = raw.includes(',') ? raw.split(',').map(item => item.trim()).filter(Boolean) : raw
              handleDependencyChange(dep.id, { value: parsed })
            }}
          />
          <button type="button" className="text-xs text-red-500" onClick={() => handleRemoveDependency(dep.id)}>
            删除联动
          </button>
        </div>
      ))}
      {dependencies.length === 0 && <div className="text-xs text-gray-400">暂无联动配置</div>}
    </div>
  )
}
