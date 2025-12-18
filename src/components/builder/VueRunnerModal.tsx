'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface VueRunnerModalProps {
  open: boolean
  onClose: () => void
  initialCode?: string
  autoRunKey?: number
}

const DEFAULT_SFC = `<template>
  <div class="demo-wrapper">
    <h2>{{ title }}</h2>
    <a class="demo-link" :href="link" target="_blank">打开链接</a>
    <button @click="count++">点击 {{ count }} 次</button>
  </div>
</template>

<script>
export default {
  name: 'DemoCard',
  data() {
    return {
      title: 'Vue 2 单文件组件示例',
      link: 'https://vuejs.org/',
      count: 0,
    }
  },
}
</script>

<style scoped>
.demo-wrapper {
  padding: 24px;
  background: #fff;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
  border-radius: 16px;
  font-family: 'SF Pro SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.demo-link {
  display: inline-block;
  margin: 12px 0;
  color: #2563eb;
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-radius: 9999px;
  border: none;
  background: linear-gradient(120deg, #ec4899, #a855f7);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
button:hover {
  opacity: 0.9;
}
</style>
`

export function VueRunnerModal({ open, onClose, initialCode, autoRunKey }: VueRunnerModalProps) {
  const [code, setCode] = useState(() => initialCode || DEFAULT_SFC)
  const codeRef = useRef(code)
  useEffect(() => {
    codeRef.current = code
  }, [code])
  const [sandboxKey, setSandboxKey] = useState(0)
  const [sandboxReady, setSandboxReady] = useState(false)
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const [runtimeError, setRuntimeError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeRef.current)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('复制失败')
    }
  }, [])

  const runPreview = useCallback(
    (customCode?: string) => {
      const next = customCode ?? codeRef.current
      setRuntimeError(null)
      if (iframeRef.current?.contentWindow && sandboxReady) {
        iframeRef.current.contentWindow.postMessage({ type: 'run', code: next }, '*')
      } else {
        setPendingCode(next)
      }
    },
    [sandboxReady]
  )

  const previousOpenRef = useRef(false)
  useEffect(() => {
    if (open && !previousOpenRef.current) {
      setSandboxKey((key) => key + 1)
      setSandboxReady(false)
      setRuntimeError(null)
      if (initialCode) {
        setCode(initialCode)
        setPendingCode(initialCode)
      } else {
        setPendingCode(codeRef.current)
      }
    } else if (!open && previousOpenRef.current) {
      setSandboxReady(false)
      setPendingCode(null)
    }
    previousOpenRef.current = open
  }, [open, initialCode])

  useEffect(() => {
    if (!open || !autoRunKey) return
    if (initialCode) {
      setCode(initialCode)
      runPreview(initialCode)
    } else {
      runPreview()
    }
  }, [autoRunKey, open, initialCode, runPreview])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object' || data.source !== 'vue-sandbox') {
        return
      }
      if (data.type === 'ready') {
        setSandboxReady(true)
      } else if (data.type === 'error') {
        setRuntimeError(data.message || '运行失败，请检查控制台')
      } else if (data.type === 'success') {
        setRuntimeError(null)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    if (sandboxReady && pendingCode && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'run', code: pendingCode }, '*')
      setPendingCode(null)
    }
  }, [sandboxReady, pendingCode])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 text-white">
        <div>
          <div className="text-lg font-semibold">Vue 2 SFC 示例运行</div>
          <p className="text-sm text-white/70 mt-1">
            粘贴单文件组件代码，点击“运行示例”即可在右侧实时查看渲染效果
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => runPreview()}
            className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-sm font-medium text-white"
          >
            运行示例
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-white/30 text-sm font-medium hover:bg-white/10"
          >
            关闭
          </button>
        </div>
      </div>
      <div className="flex-1 flex gap-4 p-6 text-white overflow-hidden">
        <div className="flex-1 flex flex-col bg-slate-900/60 rounded-xl border border-white/5">
          <div className="px-4 py-2 border-b border-white/5 text-sm uppercase tracking-wide text-white/60 flex items-center justify-between">
            <span>SFC 源码</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              title="复制代码"
            >
              {copied ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white/60 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-transparent text-sm font-mono p-4 resize-none outline-none text-white"
            spellCheck={false}
          />
        </div>
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 text-sm font-medium text-gray-500">
            运行结果
          </div>
          <div className="flex-1 relative">
            {!sandboxReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white text-gray-400 text-sm z-10 pointer-events-none">
                沙箱初始化中...
              </div>
            )}
            <iframe
              key={sandboxKey}
              ref={iframeRef}
              src="/vue-sandbox.html"
              className="absolute inset-0 w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
          {runtimeError && (
            <div className="border-t border-rose-100 bg-rose-50 text-rose-600 text-xs px-4 py-2 whitespace-pre-wrap font-mono">
              {runtimeError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
