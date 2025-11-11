# Todo List 应用

这是一个使用 Vue 3 + Vite 开发的任务管理应用，具有任务添加、编辑、删除、分类、优先级设置、截止日期提醒等功能。

## 项目特性

- 任务的创建、编辑和删除
- 任务分类管理（工作、学习、生活）
- 优先级设置（高、中、低）
- 截止日期和提醒功能
- 任务完成状态切换
- 任务详情查看
- 任务过滤和排序

## 运行方式

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发环境运行

```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

### 构建生产版本

```bash
# 使用 npm
npm run build

# 或使用 yarn
yarn build
```

### 预览生产版本

```bash
# 使用 npm
npm run preview

# 或使用 yarn
yarn preview
```

## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- Vite
- LocalStorage (数据持久化)
- Web Notifications API (提醒功能)

## 开发指南

本项目使用 Vue 3 的组合式 API，遵循组件化开发模式。数据管理通过自定义 hooks 实现，包括任务管理和通知管理。
