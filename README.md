# 江湖小白成长记 - 江湖模拟器

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/hhhh124hhhh/jianghu-simulator/blob/main/LICENSE)
[![React](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5-blue.svg)](https://www.typescriptlang.org/)

一个基于React + TypeScript + Vite构建的网页游戏，让你体验从江湖小白成长为一代侠客的传奇历程。

## 🎮 游戏介绍

在《江湖小白成长记》中，你将扮演一个初入江湖的无名小辈，通过回答问卷来塑造你的初始属性，然后经历各种江湖事件，做出关键选择，最终成长为一代侠客。

### 核心玩法
- 📝 回答5个问卷问题，塑造你的初始属性
- 🎲 经历10轮江湖事件，每轮都有不同的选择
- ⚔️ 管理武艺、威望、人脉、内力、侠义值五个核心属性
- 🏆 解锁成就，获得额外奖励
- 💾 游戏进度自动保存，可随时继续

## 🚀 技术栈

- [React 18](https://reactjs.org/) - 用于构建用户界面的JavaScript库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集，添加了静态类型
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Radix UI](https://www.radix-ui.com/) - 无障碍UI组件库
- [Lucide React](https://lucide.dev/) - 图标库

## 📦 安装与运行

### 环境要求
- Node.js >= 16
- pnpm >= 8

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 预览生产构建
```bash
pnpm preview
```

## 🎯 游戏机制

### 属性系统
游戏中有五个核心属性：
- **武艺**: 影响你处理武力相关事件的能力
- **威望**: 决定你在江湖中的声望和影响力
- **人脉**: 影响你结识新朋友和获得帮助的能力
- **内力**: 决定你的内功修为和特殊技能的使用
- **侠义值**: 体现你的道德品格和正义感

### 成长系统
每一轮事件都会对你的属性产生影响，合理的选择将帮助你更好地成长。

## 🛠️ 开发指南

### 项目结构
```
src/
├── components/     # 通用UI组件
├── data/           # 游戏数据（事件、成就等）
├── hooks/          # 自定义React Hooks
├── lib/            # 工具函数
├── pages/          # 页面组件
├── types/          # TypeScript类型定义
└── utils/          # 工具函数
```

### 添加新事件
1. 在 `src/data/events.ts` 中添加新的事件对象
2. 确保事件ID唯一且符合命名规范
3. 定义事件对属性的影响

### 添加新成就
1. 在 `src/data/achievements.ts` 中添加新的成就对象
2. 实现成就解锁条件的检查逻辑

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个游戏！

1. Fork本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

## 📧 联系方式

如果你有任何问题或建议，请联系：hhhh124hhhh@qq.com

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](https://github.com/hhhh124hhhh/jianghu-simulator/blob/main/LICENSE) 文件了解详情。