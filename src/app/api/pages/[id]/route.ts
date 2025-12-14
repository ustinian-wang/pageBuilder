import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { UpdatePageRequest } from '@/lib/types'

// GET /api/pages/[id] - 获取单个页面
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDB()
    const db = await getDB()

    const page = db.data.pages.find(p => p.id === params.id)

    if (!page) {
      return NextResponse.json(
        { success: false, error: '页面不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: page,
    })
  } catch (error: any) {
    console.error('获取页面失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/pages/[id] - 更新页面
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDB()
    const db = await getDB()
    const body: UpdatePageRequest = await request.json()

    const pageIndex = db.data.pages.findIndex(p => p.id === params.id)

    if (pageIndex === -1) {
      return NextResponse.json(
        { success: false, error: '页面不存在' },
        { status: 404 }
      )
    }

    const page = db.data.pages[pageIndex]

    if (body.name !== undefined) {
      page.name = body.name
    }
    if (body.description !== undefined) {
      page.description = body.description
    }
    if (body.elements !== undefined) {
      page.elements = body.elements
    }
    page.updatedAt = Date.now()

    await db.write()

    return NextResponse.json({
      success: true,
      data: page,
    })
  } catch (error: any) {
    console.error('更新页面失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[id] - 删除页面
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initDB()
    const db = await getDB()

    const pageIndex = db.data.pages.findIndex(p => p.id === params.id)

    if (pageIndex === -1) {
      return NextResponse.json(
        { success: false, error: '页面不存在' },
        { status: 404 }
      )
    }

    db.data.pages.splice(pageIndex, 1)
    await db.write()

    return NextResponse.json({
      success: true,
      message: '页面已删除',
    })
  } catch (error: any) {
    console.error('删除页面失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

