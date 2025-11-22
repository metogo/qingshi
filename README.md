# 轻食热量计算器

一个基于 Next.js 的专业轻食热量计算与营养分析工具，集成 AI 营养师功能，助您科学规划饮食，轻松实现减脂目标。

## 🌟 主要功能

### 1. 精准热量计算
- 丰富的食材数据库：包含主食、蛋白质、蔬菜、水果、酱料等多个分类
- 实时营养计算：自动计算总热量、蛋白质、碳水化合物和脂肪
- 成本估算：基于市场价格估算每餐成本

### 2. AI 营养师点评 ⭐
- **个性化分析**：AI 自动分析您的餐食搭配
- **流式输出**：像ChatGPT一样实时生成分析报告
- **专业建议**：获取总体评价、优点分析、改进建议和适用人群推荐

### 3. 健康资讯博客
- 减脂知识文章
- 食材推荐指南
- 科学饮食建议

### 4. 法律页面
- 关于我们
- 联系我们
- 隐私政策

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- pnpm

### 安装依赖

```bash
pnpm install
```

### 配置 AI 功能（可选）

如果您想使用 AI 营养师功能，需要配置 OpenRouter API Key：

1. 获取 OpenRouter API Key：访问 [OpenRouter](https://openrouter.ai/) 注册账号并获取 API Key
2. 在项目根目录的 `.env.local` 文件中填入您的 API Key：

```env
OPENROUTER_API_KEY=sk-or-v1-你的真实API_KEY
```

### 启动开发服务器

```bash
pnpm dev
```

然后打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 📁 项目结构

```
qingshi/
├── app/                    # Next.js App Router 页面
│   ├── layout.js          # 全局布局
│   ├── page.js            # 首页（计算器）
│   ├── blog/              # 博客系统
│   ├── about/             # 关于我们
│   ├── contact/           # 联系我们
│   ├── privacy/           # 隐私政策
│   └── api/               # API 路由
│       └── analyze-meal/  # AI 分析 API
├── components/            # React 组件
│   ├── CalorieCalculator.js  # 核心计算器组件
│   ├── Navbar.js          # 导航栏
│   └── Footer.js          # 页脚
├── posts/                 # Markdown 博客文章
├── lib/                   # 工具函数
│   └── posts.js          # 博客文章处理
├── styles/                # 样式文件
└── public/                # 静态资源
```

## 🎯 使用指南

### 使用热量计算器
1. 从左侧选择食材分类（主食、蛋白质、蔬菜等）
2. 点击"+"按钮添加食材到右侧搭配区
3. 调整每种食材的份量
4. 实时查看总热量和营养数据

### 使用 AI 营养师
1. 搭配好您的一餐食材
2. 点击"AI 营养师点评"按钮
3. 等待 AI 实时生成专业的营养分析报告
4. 查看总体评价、优点分析、改进建议和适用人群

## 🛠️ 技术栈

- **框架**：Next.js 14 (App Router)
- **UI**：Tailwind CSS
- **图标**：Lucide React
- **AI**：@ai-sdk/react + @ai-sdk/openai
- **Markdown**：react-markdown
- **部署**：Vercel（推荐）

## 📝 添加博客文章

在 `posts/` 目录下创建 `.md` 文件，格式如下：

```markdown
---
title: '文章标题'
date: '2023-11-22'
description: '文章描述'
readTime: '5 分钟阅读'
---

文章内容（支持 Markdown 格式）...
```

## 🚀 部署到 Vercel

1. 将代码推送到 GitHub
2. 登录 [Vercel](https://vercel.com/)
3. 导入 GitHub 仓库
4. 在 Environment Variables 中添加 `OPENROUTER_API_KEY`
5. 部署完成！

## 📋 待办事项

- [ ] 购买独立域名
- [ ] 绑定域名到 Vercel
- [ ] 申请 Google AdSense
- [ ] 添加更多博客文章
- [ ] 实现"智能食谱扩展"功能
- [ ] 添加用户账户系统（保存食谱）

## 📄 许可证

MIT License

## 👨‍💻 贡献

欢迎提交 Issue 和 Pull Request！