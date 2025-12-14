'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { TabsContent } from '@/components/ui/Tabs'
import { PanelProps } from '../types'
import { ElementType } from '@/lib/types'
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'right' | 'center'
  ellipsis?: boolean
  sorter?: boolean
}

interface TablePanelProps extends PanelProps {
  handleTypeChange: (newType: ElementType) => void
}

export function TablePanel({ 
  element, 
  updateProps, 
  handleTypeChange 
}: TablePanelProps) {
  const [columns, setColumns] = useState<TableColumn[]>([])
  const [dataSource, setDataSource] = useState<any[]>([])
  const [dataSourceJson, setDataSourceJson] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>({
    pageSize: 10,
    showSizeChanger: true,
    showTotal: true,
    showQuickJumper: false,
  })

  // 初始化数据 - 只在元素ID变化时初始化，避免循环更新
  useEffect(() => {
    const currentColumns = element.props?.columns
    const currentDataSource = element.props?.dataSource
    const currentPagination = element.props?.pagination

    // 如果 props 中有数据，使用它们；否则使用默认值
    const defaultColumns = [
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '年龄', dataIndex: 'age', key: 'age' },
      { title: '地址', dataIndex: 'address', key: 'address' },
    ]
    const defaultDataSource = [
      { key: '1', name: '张三', age: 32, address: '北京市' },
      { key: '2', name: '李四', age: 42, address: '上海市' },
      { key: '3', name: '王五', age: 28, address: '广州市' },
    ]

    // 设置列配置 - 优先使用element.props中的mock数据
    if (Array.isArray(currentColumns) && currentColumns.length > 0) {
      setColumns(currentColumns)
    } else {
      setColumns(defaultColumns)
      // 如果props中没有columns，初始化它们（这样mock数据会成为面板的数据来源）
      updateProps('columns', defaultColumns)
    }

    // 设置数据源 - 优先使用element.props中的mock数据
    if (Array.isArray(currentDataSource) && currentDataSource.length > 0) {
      setDataSource(currentDataSource)
      setDataSourceJson(JSON.stringify(currentDataSource, null, 2))
    } else {
      setDataSource(defaultDataSource)
      setDataSourceJson(JSON.stringify(defaultDataSource, null, 2))
      // 如果props中没有dataSource，初始化它（这样mock数据会成为面板的数据来源）
      updateProps('dataSource', defaultDataSource)
    }

    // 初始化分页配置
    if (currentPagination === false) {
      setPagination(false)
    } else if (currentPagination && typeof currentPagination === 'object') {
      setPagination({
        pageSize: 10,
        showSizeChanger: true,
        showTotal: true,
        showQuickJumper: false,
        ...currentPagination,
      })
    } else {
      // 默认启用分页
      const defaultPagination = {
        pageSize: 10,
        showSizeChanger: true,
        showTotal: true,
        showQuickJumper: false,
      }
      setPagination(defaultPagination)
      updateProps('pagination', defaultPagination)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]) // 只在元素ID变化时重新初始化

  // 同步外部props变化到内部状态（当props从外部更新时，包括初始的mock数据）
  // 使用useRef来避免循环更新
  const prevPropsRef = React.useRef<{
    columns?: any[]
    dataSource?: any[]
    pagination?: any
  }>({})

  useEffect(() => {
    const currentColumns = element.props?.columns
    const currentDataSource = element.props?.dataSource
    const currentPagination = element.props?.pagination

    // 同步列配置 - 确保mock数据中的columns能正确显示在面板中
    if (Array.isArray(currentColumns)) {
      const prevColumnsStr = JSON.stringify(prevPropsRef.current.columns)
      const currentColumnsStr = JSON.stringify(currentColumns)
      if (prevColumnsStr !== currentColumnsStr) {
        setColumns(currentColumns)
        prevPropsRef.current.columns = currentColumns
      }
    }
    
    // 同步数据源 - 确保mock数据中的dataSource能正确显示在面板中
    if (Array.isArray(currentDataSource)) {
      const prevDataSourceStr = JSON.stringify(prevPropsRef.current.dataSource)
      const currentDataSourceStr = JSON.stringify(currentDataSource)
      if (prevDataSourceStr !== currentDataSourceStr) {
        setDataSource(currentDataSource)
        setDataSourceJson(JSON.stringify(currentDataSource, null, 2))
        prevPropsRef.current.dataSource = currentDataSource
      }
    }
    
    // 同步分页配置
    if (currentPagination !== undefined) {
      const prevPaginationStr = JSON.stringify(prevPropsRef.current.pagination)
      const currentPaginationStr = JSON.stringify(currentPagination)
      if (prevPaginationStr !== currentPaginationStr) {
        if (currentPagination === false) {
          setPagination(false)
        } else if (currentPagination && typeof currentPagination === 'object') {
          setPagination({
            pageSize: 10,
            showSizeChanger: true,
            showTotal: true,
            showQuickJumper: false,
            ...currentPagination,
          })
        }
        prevPropsRef.current.pagination = currentPagination
      }
    }
  }, [element.props?.columns, element.props?.dataSource, element.props?.pagination])

  // 同步到 props
  const updateTableProps = useCallback((updates: any) => {
    if (updates.columns) {
      updateProps('columns', updates.columns)
    }
    if (updates.dataSource) {
      updateProps('dataSource', updates.dataSource)
    }
    if ('pagination' in updates) {
      updateProps('pagination', updates.pagination)
    }
  }, [updateProps])

  // 更新列
  const handleColumnChange = (index: number, field: keyof TableColumn, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
    updateTableProps({ columns: newColumns })
  }

  // 添加列
  const handleAddColumn = () => {
    const newColumn: TableColumn = {
      title: `列${columns.length + 1}`,
      dataIndex: `column${columns.length + 1}`,
      key: `column${columns.length + 1}`,
    }
    const newColumns = [...columns, newColumn]
    setColumns(newColumns)
    updateTableProps({ columns: newColumns })
  }

  // 删除列
  const handleDeleteColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index)
    setColumns(newColumns)
    updateTableProps({ columns: newColumns })
  }

  // 移动列
  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === columns.length - 1) return

    const newColumns = [...columns]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]]
    setColumns(newColumns)
    updateTableProps({ columns: newColumns })
  }

  // 更新数据源JSON
  const handleDataSourceJsonChange = (json: string) => {
    setDataSourceJson(json)
    setJsonError(null)

    try {
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed)) {
        setDataSource(parsed)
        updateTableProps({ dataSource: parsed })
      } else {
        setJsonError('数据源必须是数组格式')
      }
    } catch (error) {
      // 允许编辑中的JSON错误
      setJsonError('JSON格式错误，请检查语法')
    }
  }

  // 应用数据源（从JSON编辑器）
  const handleApplyDataSource = () => {
    try {
      const parsed = JSON.parse(dataSourceJson)
      if (Array.isArray(parsed)) {
        setDataSource(parsed)
        setJsonError(null)
        updateTableProps({ dataSource: parsed })
      } else {
        setJsonError('数据源必须是数组格式')
      }
    } catch (error: any) {
      setJsonError(error.message || 'JSON格式错误')
    }
  }

  // 更新分页配置
  const handlePaginationChange = (field: string, value: any) => {
    if (field === 'enabled') {
      const newPagination = value ? pagination : false
      setPagination(newPagination)
      updateTableProps({ pagination: newPagination })
    } else {
      const newPagination = { ...pagination, [field]: value }
      setPagination(newPagination)
      updateTableProps({ pagination: newPagination })
    }
  }

  return (
    <TabsContent value="basic" className="mt-0 p-4 space-y-4">
      {/* 组件类型切换器 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">组件类型</label>
        <select
          value={element.type}
          onChange={(e) => handleTypeChange(e.target.value as ElementType)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="a-table">📊 Table</option>
        </select>
      </div>

      {/* 列配置 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-700">列配置</h3>
          <button
            onClick={handleAddColumn}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <PlusOutlined className="text-xs" />
            添加列
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {columns.map((column, index) => (
            <div key={column.key || index} className="p-2 border border-gray-200 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">列 {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveColumn(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="上移"
                  >
                    <ArrowUpOutlined className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleMoveColumn(index, 'down')}
                    disabled={index === columns.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="下移"
                  >
                    <ArrowDownOutlined className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleDeleteColumn(index)}
                    className="p-1 text-red-400 hover:text-red-600"
                    title="删除"
                  >
                    <DeleteOutlined className="text-xs" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">列标题</label>
                <input
                  type="text"
                  value={column.title || ''}
                  onChange={(e) => handleColumnChange(index, 'title', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="列标题"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">数据字段</label>
                <input
                  type="text"
                  value={column.dataIndex || ''}
                  onChange={(e) => handleColumnChange(index, 'dataIndex', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="dataIndex"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">Key</label>
                <input
                  type="text"
                  value={column.key || ''}
                  onChange={(e) => handleColumnChange(index, 'key', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="key"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">列宽度</label>
                <input
                  type="text"
                  value={column.width || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    // 支持数字或字符串（如 "100px", "20%"）
                    const numValue = parseInt(value)
                    handleColumnChange(index, 'width', value === '' ? undefined : (isNaN(numValue) ? value : numValue))
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="如: 100, 100px, 20%"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-0.5">对齐</label>
                  <select
                    value={column.align || 'left'}
                    onChange={(e) => handleColumnChange(index, 'align', e.target.value || undefined)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="">默认</option>
                    <option value="left">左对齐</option>
                    <option value="center">居中</option>
                    <option value="right">右对齐</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-0.5">固定</label>
                  <select
                    value={column.fixed || ''}
                    onChange={(e) => handleColumnChange(index, 'fixed', e.target.value || undefined)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="">不固定</option>
                    <option value="left">左侧固定</option>
                    <option value="right">右侧固定</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={column.ellipsis === true}
                      onChange={(e) => handleColumnChange(index, 'ellipsis', e.target.checked || undefined)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-600">文本省略</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={column.sorter === true}
                      onChange={(e) => handleColumnChange(index, 'sorter', e.target.checked || undefined)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-600">可排序</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
          {columns.length === 0 && (
            <div className="text-center py-4 text-xs text-gray-400">
              暂无列配置，点击&ldquo;添加列&rdquo;按钮添加
            </div>
          )}
        </div>
      </div>

      {/* 数据源配置 */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">数据源配置</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">数据源 (JSON格式)</label>
            <textarea
              value={dataSourceJson}
              onChange={(e) => handleDataSourceJsonChange(e.target.value)}
              className={`w-full px-2 py-1 text-xs border rounded font-mono ${
                jsonError ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={8}
              placeholder='[{"key": "1", "name": "张三", "age": 32, "address": "北京市"}]'
            />
            {jsonError && (
              <p className="text-xs text-red-500 mt-1">{jsonError}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                当前数据量: {Array.isArray(dataSource) ? dataSource.length : 0} 条
              </p>
              <button
                onClick={handleApplyDataSource}
                disabled={!!jsonError}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                应用数据源
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <p className="font-semibold mb-1">提示：</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>数据源必须是JSON数组格式</li>
              <li>每条数据建议包含 key 字段作为唯一标识</li>
              <li>数据字段需要与列配置中的 dataIndex 对应</li>
              <li>表格添加时的mock数据会自动成为面板的数据来源</li>
            </ul>
          </div>
          {/* 数据字段匹配提示 */}
          {columns.length > 0 && dataSource.length > 0 && (
            <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
              <p className="font-semibold mb-1 text-blue-700">数据字段检查：</p>
              <div className="space-y-0.5">
                {columns.map((col) => {
                  const hasField = dataSource.some((item) => col.dataIndex in item)
                  return (
                    <div key={col.key} className={hasField ? 'text-green-600' : 'text-orange-600'}>
                      {hasField ? '✓' : '⚠'} {col.title} ({col.dataIndex})
                      {!hasField && ' - 数据源中缺少此字段'}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 分页配置 */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">分页配置</h3>
        <div className="space-y-2">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pagination !== false}
                onChange={(e) => handlePaginationChange('enabled', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs font-medium text-gray-700">启用分页</span>
            </label>
          </div>
          {pagination !== false && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">每页条数</label>
                <input
                  type="number"
                  value={pagination.pageSize || 10}
                  onChange={(e) => handlePaginationChange('pageSize', parseInt(e.target.value) || 10)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  min="1"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pagination.showSizeChanger !== false}
                    onChange={(e) => handlePaginationChange('showSizeChanger', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">显示每页条数选择器</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pagination.showTotal === true}
                    onChange={(e) => handlePaginationChange('showTotal', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">显示总条数</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pagination.showQuickJumper === true}
                    onChange={(e) => handlePaginationChange('showQuickJumper', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-700">显示快速跳转</span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </TabsContent>
  )
}

