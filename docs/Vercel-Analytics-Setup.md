# Vercel Web Analytics 集成指南

## 🎯 两种集成方式

### 方式 1：Vercel Dashboard 启用（推荐 ⭐）

**最简单，无需代码改动！**

#### 步骤：

1. **登录 Vercel Dashboard**

   - 访问：https://vercel.com/dashboard
   - 选择您的项目

2. **进入 Analytics 设置**

   - 点击项目 → Settings
   - 左侧菜单找到"Analytics"
   - 点击"Enable"按钮

3. **完成！**

   - Vercel 会自动注入追踪脚本
   - 无需任何代码改动
   - 实时生效

4. **查看数据**
   - 项目页面 → Analytics 标签
   - 查看访问量、页面浏览等数据

---

### 方式 2：代码集成（手动控制）

如果需要更灵活的控制或自定义事件追踪。

#### 步骤 1：安装依赖

```bash
npm install @vercel/analytics
# 或
pnpm add @vercel/analytics
```

#### 步骤 2：修改 app/layout.js

```javascript
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ToastContainer />
        <Analytics /> {/* 添加这一行 */}
      </body>
    </html>
  );
}
```

#### 步骤 3：部署

```bash
git add .
git commit -m "Add Vercel Analytics"
git push
```

---

## 📊 可追踪的数据

### 自动追踪（无需代码）

- ✅ 页面浏览量（Page Views）
- ✅ 独立访客（Unique Visitors）
- ✅ 访问来源（Referrers）
- ✅ 地理位置（Countries）
- ✅ 设备类型（Devices）
- ✅ 浏览器分布

### 自定义事件（需要代码）

```javascript
import { track } from "@vercel/analytics";

// 追踪对话分析
track("Conversation Analysis", {
  foodCount: extractedFoods.length,
  totalCalories: totals.calories,
});

// 追踪保存到日历
track("Save to Calendar", {
  mealType: "manual",
});

// 追踪手动分析
track("Manual Analysis", {
  foodCount: selectedFoods.length,
});
```

---

## 💡 推荐配置

### 对于轻食热量计算器

**建议使用方式 1（Dashboard 启用）因为：**

1. ✅ 零代码改动
2. ✅ 即时生效
3. ✅ 自动追踪核心指标
4. ✅ 免费（Hobby 计划包含）

**已足够追踪：**

- 首页访问量
- 对话分析使用率
- 日历页面访问
- 个人设置使用

---

## 🎯 高级追踪（可选）

### 如果需要详细的用户行为分析

**添加自定义事件：**

```javascript
// components/ConversationalAnalysis.js
import { track } from "@vercel/analytics";

async function handleAnalyze() {
  // ... 原有代码

  track("对话分析", {
    输入长度: mealDescription.length,
    识别食材数: result.foods.length,
    总热量: result.totals.calories,
  });
}
```

```javascript
// components/CalorieCalculator.js
import { track } from "@vercel/analytics";

const handleSaveToCalendar = () => {
  // ... 原有代码

  track("保存到日历", {
    食材数: selectedFoods.length,
    总热量: totals.calories,
    来源: "手动",
  });
};
```

---

## 📈 数据看板示例

**在 Vercel Analytics 中可以看到：**

```
今日数据：
├─ 访问量: 127次
├─ 独立访客: 45人
├─ 平均停留: 3分15秒
├─ 跳出率: 32%
│
热门页面：
├─ / (首页): 127次
├─ /calendar: 23次
├─ /profile: 12次
│
设备分布：
├─ 移动端: 65%
├─ 桌面端: 35%
│
地理分布：
├─ 中国: 89%
├─ 美国: 7%
└─ 其他: 4%
```

---

## 🚀 立即行动

### 推荐步骤：

**1. 在 Vercel Dashboard 启用 Analytics**

- 进入项目设置
- 点击 Analytics
- 点击 Enable

**2. 部署项目**

```bash
git add .
git commit -m "V7.0 Final + Gemini 2.5 Pro"
git push
```

**3. 等待部署完成（2-3 分钟）**

**4. 访问您的网站**

- 产生一些访问数据

**5. 查看 Analytics**

- Vercel Dashboard → 您的项目 → Analytics
- 实时查看数据

---

## 📋 成本说明

**Vercel Analytics 定价：**

- Hobby 计划：免费（包含基础 Analytics）
- Pro 计划：$20/月（高级 Analytics）

**基础 Analytics 包含：**

- ✅ 页面浏览
- ✅ 独立访客
- ✅ Top 页面
- ✅ 地理分布
- ✅ 30 天数据保留

**对于 MVP 阶段完全够用！**

---

## ✨ 总结

**最简单的方式：**

1. Vercel Dashboard → Analytics → Enable
2. 完成！

**无需任何代码改动，立即获得数据分析能力！**
