import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { UpdateCustomModuleRequest } from '@/lib/types'

// PUT /api/modules/[id] - 更新自定义模块
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDB()
    const db = await getDB()
    const moduleId = params.id
    const body: UpdateCustomModuleRequest = await request.json()

    const moduleIndex = db.data.customModules.findIndex(m => m.id === moduleId)
    if (moduleIndex === -1) {
      return NextResponse.json(
        { success: false, error: '模块不存在' },
        { status: 404 }
      )
    }

    const module = db.data.customModules[moduleIndex]
    
    // 更新模块字段
    if (body.label !== undefined) {
      module.label = body.label
    }
    if (body.icon !== undefined) {
      module.icon = body.icon
    }
    if (body.description !== undefined) {
      module.description = body.description
    }
    if (body.element !== undefined) {
      module.element = body.element
    }
    
    module.updatedAt = Date.now()
    
    await db.write()

    return NextResponse.json({
      success: true,
      data: module,
    })
  } catch (error: any) {
    console.error('更新自定义模块失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/modules/[id] - 删除自定义模块
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDB()
    const db = await getDB()
    const moduleId = params.id

    const index = db.data.customModules.findIndex(m => m.id === moduleId)
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '模块不存在' },
        { status: 404 }
      )
    }

    db.data.customModules.splice(index, 1)
    await db.write()

    return NextResponse.json({
      success: true,
      message: '模块已删除',
    })
  } catch (error: any) {
    console.error('删除自定义模块失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

