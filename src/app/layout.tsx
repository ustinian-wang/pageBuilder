import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Page Builder - 可视化页面构建器',
  description: '拖拽式页面构建工具，生成 Vue 组件代码',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

