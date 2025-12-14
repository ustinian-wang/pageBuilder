'use client'

import { useState } from 'react'

interface CodeViewerProps {
  code: string
  componentName: string
  onClose: () => void
}

export function CodeViewer({ code, componentName, onClose }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      // 降级方案：使用 textarea
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (e) {
        console.error('降级复制也失败:', e)
      }
      document.body.removeChild(textarea)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">生成的 Vue 2 组件代码 - {componentName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? '✓ 已复制' : '📋 复制代码'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
            >
              关闭
            </button>
          </div>
        </div>

        {/* 代码区域 */}
        <div className="flex-1 overflow-auto bg-gray-900 p-6">
          <pre className="text-sm text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-words">
            <code>{code}</code>
          </pre>
        </div>

        {/* 底部提示 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            💡 提示：点击"复制代码"按钮可以复制完整的 Vue 2 组件代码，然后粘贴到你的项目中直接使用
          </p>
        </div>
      </div>
    </div>
  )
}

