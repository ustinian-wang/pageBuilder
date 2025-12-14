'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Element } from '@/lib/types'
import { ElementRenderer } from '@/components/builder/ElementRenderer'
import { ConfigProvider } from 'antd'

interface LogEntry {
  id: string
  type: 'log' | 'event' | 'info'
  message: string
  timestamp: string
  data?: any
}

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const pageId = searchParams.get('id')
  const [elements, setElements] = useState<Element[]>([])
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showConsole, setShowConsole] = useState(true)
  const [showWindowData, setShowWindowData] = useState(false)
  const [windowData, setWindowData] = useState<Record<string, any>>({})
  const logContainerRef = useRef<HTMLDivElement>(null)

  // 加载页面数据
  useEffect(() => {
    const loadPage = async () => {
      if (!pageId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/pages/${pageId}`)
        const result = await response.json()
        if (result.success && result.data) {
          setElements(result.data.elements || [])
          
          // 添加初始日志
          addLog('info', `页面加载成功: ${result.data.name || '未命名页面'}`, {
            pageId: result.data.id,
            elementsCount: result.data.elements?.length || 0,
          })
        }
      } catch (error) {
        console.error('加载页面失败:', error)
        addLog('log', '加载页面失败', { error })
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [pageId])

  // 监听全局日志事件
  useEffect(() => {
    const handleLog = (e: CustomEvent) => {
      const detail = e.detail
      addLog(detail.type || 'event', detail.message, detail)
    }

    window.addEventListener('pageBuilder:log', handleLog as EventListener)
    
    // 拦截 console.log
    const originalConsoleLog = console.log
    console.log = (...args: any[]) => {
      originalConsoleLog.apply(console, args)
      addLog('log', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '))
    }

    return () => {
      window.removeEventListener('pageBuilder:log', handleLog as EventListener)
      console.log = originalConsoleLog
    }
  }, [])

  // 添加日志
  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    const logEntry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      data,
    }
    setLogs(prev => [...prev, logEntry])
    
    // 自动滚动到底部
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
      }
    }, 0)
  }

  // 更新 window 数据
  useEffect(() => {
    const updateWindowData = () => {
      // 获取 window 上的所有属性（排除一些内置属性）
      const data: Record<string, any> = {}
      const excludeKeys = [
        'window', 'document', 'navigator', 'location', 'history',
        'screen', 'innerWidth', 'innerHeight', 'outerWidth', 'outerHeight',
        'devicePixelRatio', 'performance', 'localStorage', 'sessionStorage',
        'console', 'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval',
        'clearTimeout', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame',
        'fetch', 'XMLHttpRequest', 'Event', 'CustomEvent', 'MouseEvent',
        'KeyboardEvent', 'TouchEvent', 'FileReader', 'Blob', 'URL',
        'URLSearchParams', 'FormData', 'Headers', 'Request', 'Response',
      ]
      
      for (const key in window) {
        if (!excludeKeys.includes(key) && typeof (window as any)[key] !== 'function') {
          try {
            const value = (window as any)[key]
            // 只记录可序列化的值
            if (typeof value === 'string' || typeof value === 'number' || 
                typeof value === 'boolean' || value === null || value === undefined ||
                (typeof value === 'object' && value.constructor === Object)) {
              data[key] = value
            }
          } catch (e) {
            // 忽略无法访问的属性
          }
        }
      }
      
      setWindowData(data)
    }

    // 初始化时更新一次
    updateWindowData()
    
    // 延迟添加初始化日志，确保 windowData 已更新
    setTimeout(() => {
      addLog('info', '页面初始化完成，Window 全局数据已加载')
    }, 100)
  }, [])

  // 清空日志
  const clearLogs = () => {
    setLogs([])
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <ConfigProvider>
      <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
        <h1 className="text-lg font-semibold">页面预览</h1>
        <div className="flex-1" />
        
        {/* 控制台切换按钮 */}
        <button
          onClick={() => setShowConsole(!showConsole)}
          className={`px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2 ${
            showConsole ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          控制台
        </button>
        
        {/* Window 数据查看按钮 */}
        <button
          onClick={() => setShowWindowData(!showWindowData)}
          className={`px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2 ${
            showWindowData ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Window 数据
        </button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 预览区域 */}
        <div className="flex-1 overflow-auto bg-white p-8">
          {elements.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">页面为空</p>
                <p className="text-sm">请在构建器中添加组件</p>
              </div>
            </div>
          ) : (
            <div>
              {elements.map(element => (
                <ElementRenderer
                  key={element.id}
                  element={element}
                  selectedElementId={null}
                  onSelect={() => {}}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  parentAutoFill={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* 右侧面板 */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* 控制台面板 */}
          {showConsole && (
            <div className="flex-1 flex flex-col border-b border-gray-200">
              <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
                <h2 className="text-sm font-semibold text-gray-700">控制台</h2>
                <button
                  onClick={clearLogs}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  清空
                </button>
              </div>
              <div
                ref={logContainerRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2"
                style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4' }}
              >
                {logs.length === 0 ? (
                  <div className="text-gray-500">暂无日志</div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            log.type === 'event'
                              ? 'bg-purple-500/20 text-purple-300'
                              : log.type === 'info'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {log.type}
                        </span>
                      </div>
                      <div className="text-sm break-words">{log.message}</div>
                      {log.data && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-gray-500 text-[10px]">
                            查看详情
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-800 rounded text-[10px] overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Window 数据面板 */}
          {showWindowData && (
            <div className={`flex-1 flex flex-col ${showConsole ? '' : 'border-b border-gray-200'}`}>
              <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4">
                <h2 className="text-sm font-semibold text-gray-700">Window 全局数据</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {Object.keys(windowData).length === 0 ? (
                  <div className="text-sm text-gray-500">暂无数据</div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(windowData).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-2">
                        <div className="font-mono text-xs font-semibold text-gray-700 mb-1">
                          {key}
                        </div>
                        <div className="text-xs text-gray-600 break-words">
                          {typeof value === 'object' ? (
                            <pre className="bg-gray-50 p-2 rounded overflow-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            String(value)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </ConfigProvider>
  )
}

