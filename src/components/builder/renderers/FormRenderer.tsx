'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Element, FormElementProps, FormFieldConfig, FormFieldDependency } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { Input, Select, Radio, Checkbox, Switch } from 'antd'

interface FormRendererProps {
  element: Element
  setNodeRef: (node: HTMLElement | null) => void
  style: React.CSSProperties
  className?: string
  handleClick: (e: React.MouseEvent) => void
  handleContextMenu: (e: React.MouseEvent) => void
  isOver: boolean
  onUpdate: (id: string, updates: Partial<Element>) => void
  renderChild: (child: Element) => React.ReactNode
}

const getDefaultFormFieldValue = (field: FormFieldConfig) => {
  if (field.componentProps && 'defaultValue' in field.componentProps) {
    return field.componentProps.defaultValue
  }
  if (field.component === 'checkbox' || field.component === 'a-checkbox') {
    return []
  }
  if (field.component === 'switch' || field.component === 'a-switch') {
    return false
  }
  return ''
}

const normalizeDependencyValue = (value: FormFieldDependency['value']) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.includes(',')) {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }
  return value
}

const evaluateFormDependency = (dep: FormFieldDependency, values: Record<string, any>) => {
  const sourceValue = values[dep.sourceFieldId]
  const targetValue = normalizeDependencyValue(dep.value)

  switch (dep.operator) {
    case 'equals':
      return sourceValue === targetValue
    case 'notEquals':
      return sourceValue !== targetValue
    case 'includes':
      if (Array.isArray(sourceValue)) {
        if (Array.isArray(targetValue)) {
          return targetValue.every(val => sourceValue.includes(val))
        }
        return sourceValue.includes(targetValue as any)
      }
      if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
        return sourceValue.includes(targetValue)
      }
      return false
    case 'in':
      if (Array.isArray(targetValue)) {
        return targetValue.includes(sourceValue)
      }
      return sourceValue === targetValue
    default:
      return false
  }
}

export function FormRenderer({
  element,
  setNodeRef,
  style,
  className,
  handleClick,
  handleContextMenu,
  isOver,
  onUpdate,
  renderChild,
}: FormRendererProps) {
  const formProps: FormElementProps = element.props || {}
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [labelDraft, setLabelDraft] = useState<string>('')

  const formFields: FormFieldConfig[] = useMemo(() => {
    return Array.isArray(formProps.fields) ? formProps.fields : []
  }, [formProps.fields])

  const formFieldsKey = useMemo(() => (formFields.length ? formFields.map(field => field.id).join('|') : 'no-fields'), [formFields])
  const formFieldsRef = useRef<FormFieldConfig[]>(formFields)

  useEffect(() => {
    formFieldsRef.current = formFields
  }, [formFields])

  useEffect(() => {
    setFormValues(prev => {
      const next = { ...prev }
      let changed = false
      const fieldsSnapshot = formFieldsRef.current
      const validIds = new Set<string>()
      fieldsSnapshot.forEach(field => {
        validIds.add(field.id)
        if (!(field.id in next)) {
          next[field.id] = getDefaultFormFieldValue(field)
          changed = true
        }
      })
      Object.keys(next).forEach(key => {
        if (!validIds.has(key)) {
          delete next[key]
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [formFieldsKey, element.id])

  const labelWidth = formProps.labelWidth ?? 122
  const layoutDirection = formProps.layout === 'vertical' ? 'column' : 'row'
  const rowGap = formProps.rowGap ?? 16
  const groups = Array.isArray(formProps.groups) ? formProps.groups : []
  const actionsVariant = formProps.actionsVariant || 'default'
  const actionsAlign = formProps.actionsAlign || (actionsVariant === 'default' ? 'right' : 'center')
  const actionsGap = formProps.actionsGap ?? (actionsVariant === 'bar' ? 20 : 12)
  const actionsPadding = formProps.actionsPadding ?? (actionsVariant === 'bar' ? 20 : 12)
  const actionsBackground = formProps.actionsBackground || (actionsVariant === 'bar' ? '#f9fafb' : 'transparent')
  const justifyMap: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }

  const updateFormFields = (nextFields: FormFieldConfig[]) => {
    onUpdate(element.id, {
      props: {
        ...element.props,
        fields: nextFields,
      },
    })
  }

  const handleAddFormField = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const newField: FormFieldConfig = {
      id: generateId(),
      name: `field_${formFields.length + 1}`,
      label: `表单项 ${formFields.length + 1}`,
      component: 'input',
      placeholder: '请输入',
      componentProps: {},
      options: [],
      validations: [],
      dependencies: [],
    }
    updateFormFields([...formFields, newField])
  }

  const handleStartLabelEdit = (field: FormFieldConfig, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditingLabelId(field.id)
    setLabelDraft(field.label || '')
  }

  const commitLabelEdit = (fieldId: string, nextLabel?: string) => {
    const targetLabel = nextLabel !== undefined ? nextLabel : labelDraft
    const safeLabel = targetLabel.trim() || '未命名字段'
    updateFormFields(formFields.map(field => (field.id === fieldId ? { ...field, label: safeLabel } : field)))
    setEditingLabelId(null)
    setLabelDraft('')
  }

  const cancelLabelEdit = () => {
    setEditingLabelId(null)
    setLabelDraft('')
  }

  if (!formFields.length) {
    return (
      <form
        ref={setNodeRef}
        style={style}
        className={className}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {element.children?.map(renderChild)}
        {isOver && <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50" />}
      </form>
    )
  }

  const handleFieldValueChange = (field: FormFieldConfig, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field.id]: value,
    }))
  }

  const computeFieldState = (field: FormFieldConfig) => {
    let visible = true
    let disabled = field.componentProps?.disabled === true
    if (field.dependencies && field.dependencies.length > 0) {
      field.dependencies.forEach(dep => {
        const matches = evaluateFormDependency(dep, formValues)
        if (dep.action === 'hide' && matches) {
          visible = false
        }
        if (dep.action === 'show') {
          visible = matches
        }
        if (dep.action === 'disable' && matches) {
          disabled = true
        }
        if (dep.action === 'enable' && matches) {
          disabled = false
        }
      })
    }
    return { visible, disabled }
  }

  const renderControl = (field: FormFieldConfig, value: any, disabled: boolean) => {
    const baseProps = { ...(field.componentProps || {}) }
    delete (baseProps as any).defaultValue
    const commonInputProps = {
      className: 'w-full border border-gray-300 rounded px-3 py-2',
      placeholder: field.placeholder,
      disabled,
      ...baseProps,
    }

    switch (field.component) {
      case 'textarea':
        return (
          <textarea
            {...commonInputProps}
            value={value ?? ''}
            onChange={e => handleFieldValueChange(field, e.target.value)}
          />
        )
      case 'select':
        return (
          <select
            {...commonInputProps}
            value={value ?? ''}
            onChange={e => handleFieldValueChange(field, e.target.value)}
          >
            <option value="">请选择</option>
            {(field.options || []).map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      case 'radio':
        return (
          <div className="flex flex-wrap gap-4">
            {(field.options || []).map(opt => (
              <label key={opt.value} className="flex items-center gap-1 text-sm text-gray-700">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  disabled={disabled}
                  onChange={e => handleFieldValueChange(field, e.target.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <div className="flex flex-wrap gap-4">
            {(field.options || []).map(opt => {
              const checked = Array.isArray(value) ? value.includes(opt.value) : false
              return (
                <label key={opt.value} className="flex items-center gap-1 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={checked}
                    disabled={disabled}
                    onChange={e => {
                      const current = Array.isArray(value) ? [...value] : []
                      if (e.target.checked) {
                        if (!current.includes(opt.value)) current.push(opt.value)
                      } else {
                        const idx = current.indexOf(opt.value)
                        if (idx > -1) current.splice(idx, 1)
                      }
                      handleFieldValueChange(field, current)
                    }}
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        )
      case 'date':
        return (
          <input
            {...commonInputProps}
            type="date"
            value={value ?? ''}
            onChange={e => handleFieldValueChange(field, e.target.value)}
          />
        )
      case 'number':
        return (
          <input
            {...commonInputProps}
            type="number"
            value={value ?? ''}
            onChange={e => handleFieldValueChange(field, e.target.value)}
          />
        )
      case 'switch':
        return (
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!value}
              disabled={disabled}
              onChange={e => handleFieldValueChange(field, e.target.checked)}
            />
            {field.placeholder || '切换'}
          </label>
        )
      case 'a-input':
        return (
          <Input
            {...baseProps}
            disabled={disabled}
            value={value ?? ''}
            placeholder={field.placeholder}
            onChange={e => handleFieldValueChange(field, e.target.value)}
          />
        )
      case 'a-select':
        return (
          <Select
            {...baseProps}
            disabled={disabled}
            style={{ width: '100%' }}
            value={value ?? undefined}
            placeholder={field.placeholder}
            onChange={val => handleFieldValueChange(field, val)}
            options={(field.options || []).map(opt => ({ label: opt.label, value: opt.value }))}
          />
        )
      case 'a-radio':
        return (
          <Radio.Group
            {...baseProps}
            disabled={disabled}
            value={value}
            onChange={e => handleFieldValueChange(field, e.target.value)}
          >
            {(field.options || []).map(opt => (
              <Radio key={opt.value} value={opt.value}>
                {opt.label}
              </Radio>
            ))}
          </Radio.Group>
        )
      case 'a-checkbox':
        return (
          <Checkbox.Group
            {...baseProps}
            disabled={disabled}
            options={(field.options || []).map(opt => ({ label: opt.label, value: opt.value }))}
            value={Array.isArray(value) ? value : []}
            onChange={vals => handleFieldValueChange(field, vals)}
          />
        )
      case 'a-switch':
        return (
          <Switch
            {...baseProps}
            checked={!!value}
            disabled={disabled}
            onChange={checked => handleFieldValueChange(field, checked)}
          />
        )
      default:
        return (
          <input
            {...commonInputProps}
            type="text"
            value={value ?? ''}
            onChange={e => handleFieldValueChange(field, e.target.value)}
          />
        )
    }
  }

  const sections: Array<{ id: string; group?: { label: string; description?: string } | null; fields: FormFieldConfig[] }> = []
  const groupMap = new Map<string, FormFieldConfig[]>()
  formFields.forEach(field => {
    const key = field.groupId || 'default'
    if (!groupMap.has(key)) {
      groupMap.set(key, [])
    }
    groupMap.get(key)!.push(field)
  })
  groups.forEach(group => {
    if (groupMap.has(group.id)) {
      sections.push({ id: group.id, group, fields: groupMap.get(group.id)! })
      groupMap.delete(group.id)
    }
  })
  if (groupMap.has('default')) {
    sections.push({ id: 'default', group: null, fields: groupMap.get('default')! })
  }

  return (
    <form
      ref={setNodeRef}
      style={{ ...style, display: 'flex', flexDirection: 'column', gap: `${rowGap}px`, position: 'relative' }}
      className={className}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {sections.map(section => (
        <div key={section.id} className="flex flex-col gap-4">
          {section.group && (
            <div>
              <div className="text-sm font-semibold text-gray-800">{section.group.label}</div>
              {section.group.description && <div className="text-xs text-gray-500 mt-1">{section.group.description}</div>}
            </div>
          )}
          {section.fields.map(field => {
            const { visible, disabled } = computeFieldState(field)
            if (!visible) return null
            const isEditingLabel = editingLabelId === field.id
            const labelStyles: React.CSSProperties = {
              width: layoutDirection === 'row' ? `${labelWidth}px` : '100%',
              flexShrink: 0,
              color: '#1f2937',
              fontWeight: 500,
              whiteSpace: formProps.labelWrap ? 'normal' : 'nowrap',
              wordBreak: 'break-word',
              overflow: formProps.labelEllipsis ? 'hidden' : undefined,
              textOverflow: formProps.labelEllipsis ? 'ellipsis' : undefined,
              display: formProps.labelWrap ? 'block' : 'flex',
            }
            const value = field.id in formValues ? formValues[field.id] : getDefaultFormFieldValue(field)
            return (
              <div
                key={field.id}
                className="flex"
                style={{ gap: '12px', flexDirection: layoutDirection, alignItems: layoutDirection === 'row' ? 'center' : 'flex-start' }}
              >
                <div style={labelStyles} onDoubleClick={e => handleStartLabelEdit(field, e)}>
                  {isEditingLabel ? (
                    <input
                      type="text"
                      value={labelDraft}
                      autoFocus
                      onFocus={event => event.currentTarget.select()}
                      onChange={e => setLabelDraft(e.target.value)}
                      onBlur={() => {
                        if (editingLabelId === field.id) {
                          commitLabelEdit(field.id)
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          commitLabelEdit(field.id, (e.target as HTMLInputElement).value)
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          cancelLabelEdit()
                        }
                      }}
                      className="w-full border border-blue-400 rounded px-1 py-0.5 text-sm"
                    />
                  ) : (
                    field.label
                  )}
                </div>
                <div style={{ flex: 1, width: '100%' }}>
                  {renderControl(field, value, disabled)}
                  {field.validations?.map(rule => (
                    <div key={rule.id} className="text-xs text-gray-400 mt-1">
                      {rule.message || `${field.label}校验`}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddFormField}
        className="w-full border border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-500 rounded-lg py-2 text-sm transition-colors"
      >
        + 新增表单项
      </button>
      <div
        className={actionsVariant === 'bar' ? 'rounded-lg border border-gray-200' : ''}
        style={{
          display: 'flex',
          justifyContent: justifyMap[actionsAlign] || 'flex-end',
          gap: `${actionsGap}px`,
          padding: actionsVariant === 'bar' ? `${actionsPadding}px` : '0',
          backgroundColor: actionsVariant === 'bar' ? actionsBackground : 'transparent',
          marginTop: '12px',
          alignItems: 'center',
          borderTop: actionsVariant === 'bar' ? '1px solid #efefef' : undefined,
        }}
      >
        <button type="button" className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700">
          {formProps.cancelLabel || '取消'}
        </button>
        <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
          {formProps.submitLabel || '提交'}
        </button>
      </div>
      {isOver && <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 pointer-events-none" />}
    </form>
  )
}
