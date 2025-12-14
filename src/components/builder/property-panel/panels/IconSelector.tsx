'use client'

import React, { useState } from 'react'
import { iconOptions } from '../config/icon-config'

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = iconOptions.find(opt => opt.value === value)

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1">图标（可选）</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-left flex items-center justify-between hover:border-gray-400"
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon ? (
            <>
              {React.createElement(selectedOption.icon, { className: 'text-base' })}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-gray-400">无图标</span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-80 overflow-y-auto">
            {/* 无图标选项 */}
            <button
              type="button"
              onClick={() => {
                onChange('')
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 ${
                value === '' ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span className="text-gray-400">无图标</span>
              {value === '' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-auto text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            
            {/* 分组显示图标 */}
            {['常用操作', '用户相关', '导航', '文件', '通信', '其他'].map((group) => {
              const groupOptions = iconOptions.filter(opt => opt.group === group)
              if (groupOptions.length === 0) return null
              
              return (
                <React.Fragment key={group}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-t border-b border-gray-200">
                    {group}
                  </div>
                  {groupOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value)
                        setIsOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 ${
                        value === option.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {option.icon && React.createElement(option.icon, { className: 'text-base' })}
                      <span>{option.label}</span>
                      {value === option.value && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-auto text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </React.Fragment>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

