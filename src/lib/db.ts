import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import fs from 'fs'
import { PageConfig, CustomModule } from './types'

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'db.json')
const pagesDir = path.join(process.cwd(), 'data', 'pages')

// 确保 data 目录存在
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true })
}

// 数据库结构
interface Database {
  pages: PageConfig[]
  customModules: CustomModule[]
  users: Array<{
    id: number
    username: string
    email: string
    password: string
    name: string
    createdAt: number
  }>
  _meta?: {
    pageIdCounter: number
    moduleIdCounter: number
    userIdCounter: number
  }
}

// 默认数据
const defaultData: Database = {
  pages: [],
  customModules: [],
  users: [],
  _meta: {
    pageIdCounter: 0,
    moduleIdCounter: 0,
    userIdCounter: 0,
  },
}

// 创建适配器
const adapter = new JSONFile<Database>(dbPath)

// 创建数据库实例
export const db = new Low<Database>(adapter, null)

// 初始化数据库
export async function initDB() {
  try {
    await db.read()
  } catch (error) {
    console.error('读取数据库文件失败:', error)
    db.data = defaultData
    await db.write()
    return db
  }

  if (!db.data) {
    db.data = { ...defaultData }
    await db.write()
    return db
  }

  // 确保数据结构完整
  if (!Array.isArray(db.data.pages)) {
    db.data.pages = []
  }
  if (!Array.isArray(db.data.customModules)) {
    db.data.customModules = []
  }
  if (!Array.isArray(db.data.users)) {
    db.data.users = []
  }

  // 确保 _meta 存在
  if (!db.data._meta) {
    const maxPageId = db.data.pages.length > 0
      ? Math.max(0, ...db.data.pages.map(p => {
          const idNum = parseInt(p.id.replace('page-', '') || '0', 10)
          return idNum
        }))
      : 0
    
    const maxModuleId = db.data.customModules.length > 0
      ? Math.max(0, ...db.data.customModules.map(m => {
          const idNum = parseInt(m.id.replace('module-', '') || '0', 10)
          return idNum
        }))
      : 0
    
    const maxUserId = db.data.users.length > 0
      ? Math.max(0, ...db.data.users.map(u => typeof u.id === 'number' ? u.id : 0))
      : 0

    db.data._meta = {
      pageIdCounter: maxPageId,
      moduleIdCounter: maxModuleId,
      userIdCounter: maxUserId,
    }
    await db.write()
  }

  return db
}

// 获取下一个页面 ID
export async function getNextPageId(): Promise<string> {
  const db = await getDB()
  if (!db.data._meta) {
    db.data._meta = { pageIdCounter: 0, userIdCounter: 0 }
  }
  if (typeof db.data._meta.pageIdCounter === 'undefined') {
    db.data._meta.pageIdCounter = 0
  }
  db.data._meta.pageIdCounter++
  await db.write()
  return `page-${db.data._meta.pageIdCounter}`
}

// 获取下一个模块 ID
export async function getNextModuleId(): Promise<string> {
  const db = await getDB()
  if (!db.data._meta) {
    db.data._meta = { pageIdCounter: 0, moduleIdCounter: 0, userIdCounter: 0 }
  }
  if (typeof db.data._meta.moduleIdCounter === 'undefined') {
    db.data._meta.moduleIdCounter = 0
  }
  db.data._meta.moduleIdCounter++
  await db.write()
  return `module-${db.data._meta.moduleIdCounter}`
}

// 获取下一个用户 ID
export async function getNextUserId(): Promise<number> {
  const db = await getDB()
  if (!db.data._meta) {
    db.data._meta = { pageIdCounter: 0, moduleIdCounter: 0, userIdCounter: 0 }
  }
  if (typeof db.data._meta.userIdCounter === 'undefined') {
    db.data._meta.userIdCounter = 0
  }
  db.data._meta.userIdCounter++
  await db.write()
  return db.data._meta.userIdCounter
}

// 获取数据库实例（确保已初始化）
export async function getDB() {
  if (db.data === null || db.data === undefined) {
    await initDB()
  }
  if (!db.data) {
    await initDB()
  }
  return db
}

