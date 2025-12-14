import { NextRequest, NextResponse } from 'next/server'
import { VueGenerator } from '@/lib/generator/vue-generator'
import { Element } from '@/lib/types'
import path from 'path'
import fs from 'fs/promises'

// POST /api/generate - 生成 Vue 组件代码
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { elements, componentName = 'GeneratedPage', pageId } = body

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json(
        { success: false, error: '缺少元素数据' },
        { status: 400 }
      )
    }

    const generator = new VueGenerator()
    let code = ''

    if (elements.length === 1) {
      code = generator.generate(elements[0] as Element, componentName)
    } else {
      code = generator.generateFromConfig(elements as Element[], componentName)
    }

    // 如果提供了 pageId，保存到文件
    if (pageId) {
      const pagesDir = path.join(process.cwd(), 'data', 'pages')
      await fs.mkdir(pagesDir, { recursive: true })
      const filePath = path.join(pagesDir, `${componentName}.vue`)
      await fs.writeFile(filePath, code, 'utf-8')
    }

    return NextResponse.json({
      success: true,
      data: {
        code,
        componentName,
      },
    })
  } catch (error: any) {
    console.error('生成代码失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

