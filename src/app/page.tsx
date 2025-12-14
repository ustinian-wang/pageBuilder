import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Page Builder</h1>
        <p className="text-gray-600 text-center mb-8">
          可视化页面构建器，支持拖拽搭建页面并生成 Vue 组件代码
        </p>
        <Link
          href="/builder"
          className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          开始构建
        </Link>
      </div>
    </div>
  )
}

