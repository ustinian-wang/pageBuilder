'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import { PanelProps } from '../types'
import { ElementType } from '@/lib/types'
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface RadioOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface RadioPanelProps extends PanelProps {
  handleTypeChange: (newType: ElementType) => void
}

export function RadioPanel({ 
  element, 
  updateProps, 
  handleTypeChange 
}: RadioPanelProps) {
  const [mode, setMode] = useState<'single' | 'group'>('single')
  const [options, setOptions] = useState<RadioOption[]>([])
  const [label, setLabel] = useState('')
  const [value, setValue] = useState<string | number>('')
  const [defaultValue, setDefaultValue] = useState<string | number>('')
  const [disabled, setDisabled] = useState(false)
  const [buttonStyle, setButtonStyle] = useState<'outline' | 'solid' | undefined>(undefined)
  const [size, setSize] = useState<'large' | 'middle' | 'small' | undefined>(undefined)

  // 初始化数据 - 只在元素ID变化时重新初始化
  useEffect(() => {
    // 判断是单个 radio 还是 radio-group
    // 如果 props 中有 options 数组（即使为空），也认为是 group 模式
    const hasOptionsProp = element.props?.options !== undefined && Array.isArray(element.props.options)
    const currentMode = hasOptionsProp ? 'group' : 'single'
    setMode(currentMode)

    if (currentMode === 'group') {
      // Radio Group 模式
      const currentOptions = element.props?.options || []
      // 如果选项为空，设置默认选项（至少一个）
      if (currentOptions.length === 0) {
        const defaultOptions = [
          { label: '选项1', value: 'option1' },
        ]
        setOptions(defaultOptions)
        updateProps('options', defaultOptions)
      } else {
        setOptions(currentOptions)
      }
      setDefaultValue(element.props?.defaultValue || '')
      setButtonStyle(element.props?.buttonStyle)
      setSize(element.props?.size)
    } else {
      // 单个 Radio 模式
      setLabel(element.props?.label || element.props?.children || 'Radio')
      setValue(element.props?.value || '')
      setDefaultValue(element.props?.defaultValue || false)
      setDisabled(element.props?.disabled === true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]) // 只在元素ID变化时重新初始化

  // 同步外部 props 变化到内部状态（当props从外部更新时）
  const prevPropsRef = React.useRef<{
    options?: any[]
    defaultValue?: any
    buttonStyle?: any
    size?: any
    label?: any
    value?: any
    disabled?: any
  }>({})

  useEffect(() => {
    if (mode === 'group') {
      const currentOptions = element.props?.options
      if (Array.isArray(currentOptions)) {
        const prevOptionsStr = JSON.stringify(prevPropsRef.current.options)
        const currentOptionsStr = JSON.stringify(currentOptions)
        if (prevOptionsStr !== currentOptionsStr) {
          setOptions(currentOptions.length > 0 ? currentOptions : [{ label: '选项1', value: 'option1' }])
          prevPropsRef.current.options = currentOptions
        }
      }
      if (element.props?.defaultValue !== prevPropsRef.current.defaultValue) {
        setDefaultValue(element.props.defaultValue || '')
        prevPropsRef.current.defaultValue = element.props.defaultValue
      }
      if (element.props?.buttonStyle !== prevPropsRef.current.buttonStyle) {
        setButtonStyle(element.props.buttonStyle)
        prevPropsRef.current.buttonStyle = element.props.buttonStyle
      }
      if (element.props?.size !== prevPropsRef.current.size) {
        setSize(element.props.size)
        prevPropsRef.current.size = element.props.size
      }
    } else {
      if (element.props?.label !== prevPropsRef.current.label || element.props?.children !== prevPropsRef.current.label) {
        setLabel(element.props?.label || element.props?.children || 'Radio')
        prevPropsRef.current.label = element.props?.label || element.props?.children
      }
      if (element.props?.value !== prevPropsRef.current.value) {
        setValue(element.props?.value || '')
        prevPropsRef.current.value = element.props?.value
      }
      if (element.props?.defaultValue !== prevPropsRef.current.defaultValue) {
        setDefaultValue(element.props?.defaultValue || false)
        prevPropsRef.current.defaultValue = element.props?.defaultValue
      }
      if (element.props?.disabled !== prevPropsRef.current.disabled) {
        setDisabled(element.props?.disabled === true)
        prevPropsRef.current.disabled = element.props?.disabled
      }
    }
  }, [element.props, mode])

  // 当模式切换时，更新 props
  const handleModeChange = (newMode: 'single' | 'group') => {
    setMode(newMode)
    if (newMode === 'group') {
      // 切换到 group 模式
      // 如果当前没有选项或选项为空，设置默认选项（至少一个）
      const currentOptions = element.props?.options || []
      const defaultOptions = currentOptions.length > 0 ? currentOptions : [
        { label: '选项1', value: 'option1' },
      ]
      setOptions(defaultOptions)
      setDefaultValue('')
      setButtonStyle(undefined)
      setSize(undefined)
      updateProps('options', defaultOptions)
      updateProps('defaultValue', '')
      // 清除单个 radio 的属性
      updateProps('label', undefined)
      updateProps('value', undefined)
      updateProps('children', undefined)
    } else {
      // 切换到 single 模式
      setOptions([])
      setLabel('Radio')
      setValue('')
      setDefaultValue(false)
      setDisabled(false)
      updateProps('options', undefined)
      updateProps('buttonStyle', undefined)
      updateProps('size', undefined)
      updateProps('label', 'Radio')
      updateProps('defaultValue', false)
    }
  }

  // 更新选项
  const handleOptionChange = (index: number, field: keyof RadioOption, newValue: any) => {
    const newOptions = [...options]
    newOptions[index] = {
      ...newOptions[index],
      [field]: newValue,
    }
    setOptions(newOptions)
    updateProps('options', newOptions)
  }

  // 添加选项
  const handleAddOption = () => {
    const newOption: RadioOption = {
      label: `选项${options.length + 1}`,
      value: `option${options.length + 1}`,
      disabled: false,
    }
    const newOptions = [...options, newOption]
    setOptions(newOptions)
    updateProps('options', newOptions)
  }

  // 删除选项
  const handleDeleteOption = (index: number) => {
    // 确保至少保留一个选项
    if (options.length <= 1) {
      return
    }
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    updateProps('options', newOptions)
    
    // 如果删除的选项是当前默认值，清空默认值
    const deletedOption = options[index]
    if (String(defaultValue) === String(deletedOption.value)) {
      setDefaultValue('')
      updateProps('defaultValue', '')
    }
  }

  // 移动选项
  const handleMoveOption = (index: number, direction: 'up' | 'down') => {
    const newOptions = [...options]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newOptions.length) return
    
    ;[newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]]
    setOptions(newOptions)
    updateProps('options', newOptions)
  }

  return (
    <TabsContent value="basic" className="mt-0 p-4 space-y-4">
      {/* 组件类型切换 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">组件类型</label>
        <select
          value={element.type}
          onChange={(e) => handleTypeChange(e.target.value as ElementType)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="a-radio">🔘 Radio</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">切换类型将重置组件属性，但保留样式设置</p>
      </div>

      {/* 模式选择 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">使用模式</label>
        <select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as 'single' | 'group')}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="single">单个 Radio</option>
          <option value="group">Radio Group</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {mode === 'single' 
            ? '单个单选框，可单独使用' 
            : '单选组，包含多个选项，只能选择一个'}
        </p>
      </div>

      {mode === 'single' ? (
        // 单个 Radio 配置
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">标签文本</label>
            <input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value)
                updateProps('label', e.target.value)
                updateProps('children', e.target.value)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="请输入标签文本"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">值 (value)</label>
            <input
              type="text"
              value={String(value)}
              onChange={(e) => {
                const newValue = e.target.value
                setValue(newValue)
                updateProps('value', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="请输入值"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">默认选中</label>
            <select
              value={String(defaultValue)}
              onChange={(e) => {
                const newValue = e.target.value === 'true'
                setDefaultValue(newValue)
                updateProps('defaultValue', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="false">否</option>
              <option value="true">是</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => {
                  setDisabled(e.target.checked)
                  updateProps('disabled', e.target.checked)
                }}
                className="w-4 h-4"
              />
              <span className="text-xs font-medium text-gray-700">禁用</span>
            </label>
          </div>
        </>
      ) : (
        // Radio Group 配置
        <>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-700">选项列表</h3>
              <button
                type="button"
                onClick={handleAddOption}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <PlusOutlined className="text-xs" />
                添加选项
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400">
                  <p>暂无选项，请点击"添加选项"按钮添加</p>
                </div>
              ) : (
                options.map((option, index) => (
                  <div key={index} className="p-2 border border-gray-200 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">选项 {index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveOption(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="上移"
                        >
                          <ArrowUpOutlined className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOption(index, 'down')}
                          disabled={index === options.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="下移"
                        >
                          <ArrowDownOutlined className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOption(index)}
                          disabled={options.length <= 1}
                          className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={options.length <= 1 ? '至少保留一个选项' : '删除'}
                        >
                          <DeleteOutlined className="text-xs" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">标签</label>
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          placeholder="选项标签"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-0.5">值</label>
                        <input
                          type="text"
                          value={String(option.value)}
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          placeholder="选项值"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={option.disabled === true}
                            onChange={(e) => handleOptionChange(index, 'disabled', e.target.checked)}
                            className="w-3 h-3"
                          />
                          <span className="text-xs text-gray-600">禁用此选项</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">默认值</label>
            <select
              value={String(defaultValue)}
              onChange={(e) => {
                setDefaultValue(e.target.value)
                updateProps('defaultValue', e.target.value)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">无</option>
              {options.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">按钮样式</label>
            <select
              value={buttonStyle || ''}
              onChange={(e) => {
                const newValue = e.target.value || undefined
                setButtonStyle(newValue as 'outline' | 'solid' | undefined)
                updateProps('buttonStyle', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">默认</option>
              <option value="outline">轮廓 (outline)</option>
              <option value="solid">实心 (solid)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">将单选组渲染为按钮样式</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">尺寸</label>
            <select
              value={size || ''}
              onChange={(e) => {
                const newValue = e.target.value || undefined
                setSize(newValue as 'large' | 'middle' | 'small' | undefined)
                updateProps('size', newValue)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">默认</option>
              <option value="large">大 (large)</option>
              <option value="middle">中 (middle)</option>
              <option value="small">小 (small)</option>
            </select>
          </div>
        </>
      )}
    </TabsContent>
  )
}

