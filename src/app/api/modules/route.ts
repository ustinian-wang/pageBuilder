import { NextRequest, NextResponse } from 'next/server'
import { getDB, getNextModuleId, initDB } from '@/lib/db'
import { CustomModule, CreateCustomModuleRequest } from '@/lib/types'

// GET /api/modules - 获取所有自定义模块
export async function GET() {
  try {
    await initDB()
    const db = await getDB()

    return NextResponse.json({
      success: true,
      data: db.data.customModules || [],
    })
  } catch (error: any) {
    console.error('获取自定义模块列表失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/modules - 创建新自定义模块
export async function POST(request: NextRequest) {
  try {
    await initDB()
    const db = await getDB()
    const body: CreateCustomModuleRequest = await request.json()

    if (!body.name || !body.label || !body.element) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段：name, label, element' },
        { status: 400 }
      )
    }

    const moduleId = await getNextModuleId()
    const now = Date.now()

    const newModule: CustomModule = {
      id: moduleId,
      name: body.name,
      label: body.label,
      icon: body.icon || '📦',
      description: body.description,
      element: body.element,
      createdAt: now,
      updatedAt: now,
    }

    db.data.customModules.push(newModule)
    await db.write()

    return NextResponse.json({
      success: true,
      data: newModule,
    })
  } catch (error: any) {
    console.error('创建自定义模块失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

