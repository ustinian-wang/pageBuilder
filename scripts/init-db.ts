import { initDB } from '../src/lib/db'

async function main() {
  console.log('初始化数据库...')
  try {
    await initDB()
    console.log('数据库初始化成功！')
    process.exit(0)
  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  }
}

main()

