import { NextRequest, NextResponse } from 'next/server'
import { getDB, getNextPageId, initDB } from '@/lib/db'
import { PageConfig, CreatePageRequest } from '@/lib/types'

// GET /api/pages - 获取所有页面
export async function GET() {
  try {
    await initDB()
    const db = await getDB()

    return NextResponse.json({
      success: true,
      data: db.data.pages || [],
    })
  } catch (error: any) {
    console.error('获取页面列表失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/pages - 创建新页面
export async function POST(request: NextRequest) {
  try {
    await initDB()
    const db = await getDB()
    const body: CreatePageRequest = await request.json()

    const pageId = await getNextPageId()
    const now = Date.now()

    const newPage: PageConfig = {
      id: pageId,
      name: body.name,
      description: body.description,
      elements: body.elements || [],
      createdAt: now,
      updatedAt: now,
    }

    db.data.pages.push(newPage)
    await db.write()

    return NextResponse.json({
      success: true,
      data: newPage,
    })
  } catch (error: any) {
    console.error('创建页面失败:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

