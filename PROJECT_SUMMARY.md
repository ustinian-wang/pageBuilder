# Page Builder 项目总结

## 项目概述

Page Builder 是一个基于 Next.js 15 的可视化 PC 端页面构建器，支持拖拽搭建页面并生成可维护的 Vue 3 组件代码。

## 已完成功能

### 1. 项目基础配置
- ✅ Next.js 15 + TypeScript 配置
- ✅ Tailwind CSS 样式框架
- ✅ 项目结构和目录组织
- ✅ 数据库配置（LowDB）

### 2. 核心功能
- ✅ 可视化拖拽编辑器
- ✅ 组件库（11 种基础组件）
- ✅ 组件属性配置面板
- ✅ 实时预览
- ✅ 页面配置保存
- ✅ Vue 3 组件代码生成

### 3. API 接口
- ✅ GET /api/pages - 获取所有页面
- ✅ POST /api/pages - 创建新页面
- ✅ GET /api/pages/[id] - 获取单个页面
- ✅ PATCH /api/pages/[id] - 更新页面
- ✅ DELETE /api/pages/[id] - 删除页面
- ✅ POST /api/generate - 生成 Vue 代码

### 4. 编辑器组件
- ✅ ComponentPanel - 组件面板（左侧）
- ✅ Canvas - 画布区域（中间）
- ✅ PropertyPanel - 属性面板（右侧）
- ✅ ElementRenderer - 元素渲染器

### 5. 代码生成器
- ✅ VueGenerator - Vue 3 组件代码生成
- ✅ 支持嵌套组件结构
- ✅ 支持样式和属性配置
- ✅ 生成规范的 Vue 3 SFC 代码

## 支持的组件类型

1. **Container** - 容器（可嵌套子元素）
2. **Text** - 文本
3. **Button** - 按钮
4. **Input** - 输入框
5. **Image** - 图片
6. **Card** - 卡片（可嵌套）
7. **Heading** - 标题（H1-H6）
8. **Paragraph** - 段落
9. **Divider** - 分割线
10. **List** - 列表（有序/无序）
11. **Form** - 表单（可嵌套）

## 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **拖拽**: @dnd-kit
- **数据库**: LowDB (JSON)
- **UI 组件**: Radix UI

## 项目结构

```
pageBuilder/
├── data/                  # 数据库和生成的代码
│   ├── db.json           # 页面配置数据
│   └── pages/            # 生成的 Vue 组件文件
├── scripts/              # 脚本文件
│   └── init-db.ts        # 数据库初始化
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   ├── builder/      # 编辑器页面
│   │   └── page.tsx      # 首页
│   ├── components/       # React 组件
│   │   └── builder/      # 编辑器组件
│   └── lib/              # 工具函数
│       ├── db.ts         # 数据库操作
│       ├── generator/    # 代码生成器
│       └── types.ts      # 类型定义
└── public/               # 静态资源
```

## 快速开始

1. 安装依赖：
```bash
cd pageBuilder
yarn install
```

2. 初始化数据库：
```bash
yarn init-db
```

3. 启动开发服务器：
```bash
yarn dev
```

4. 访问编辑器：
   - 首页: http://localhost:3000
   - 编辑器: http://localhost:3000/builder

## 使用流程

1. 进入编辑器页面
2. 从左侧组件库拖拽组件到中间画布
3. 点击组件选择，在右侧属性面板配置属性
4. 可以嵌套组件（拖拽到容器类组件内）
5. 点击"保存"保存页面配置
6. 点击"生成代码"生成 Vue 组件代码

## 生成的代码特点

- ✅ 规范的 Vue 3 单文件组件格式
- ✅ 使用 `<script setup>` 语法
- ✅ 支持 scoped 样式
- ✅ 保留所有配置的属性和样式
- ✅ 可维护、可扩展的代码结构

## 后续优化建议

1. 添加更多组件类型（表格、导航、轮播图等）
2. 支持组件复制、粘贴功能
3. 支持撤销/重做操作
4. 添加响应式布局配置
5. 支持导入/导出页面配置
6. 添加组件预设模板
7. 优化代码生成，支持 TypeScript 类型定义
8. 添加组件预览模式（非编辑模式）
9. 支持多页面管理
10. 添加用户认证和权限管理

## 注意事项

- 首次运行前需要执行 `yarn init-db` 初始化数据库
- 生成的 Vue 代码保存在 `data/pages/` 目录
- 页面配置数据保存在 `data/db.json`
- 建议将 `data/` 目录添加到 `.gitignore`（已添加）

