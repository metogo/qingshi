# 热量日历系统技术架构方案 V1.0

## 🎯 产品愿景

**From：** 单次餐食计算工具  
**To：** 长期饮食管理系统

### 核心价值

> 从"计算这一餐" → "管理每一天"

---

## 📊 第一部分：数据模型设计

### 1.1 MealRecord（餐食记录）

```typescript
interface MealRecord {
  // 基础标识
  recordId: string;              // 唯一ID，如"rec_1700000000_abc123"
  userId: string;                // 用户ID（localStorage可用浏览器指纹）

  // 时间信息
  recordDate: string;            // 记录日期 "2025-11-24"
  recordTime: string;            // 记录时间 "14:30:25"
  createdAt: number;             // 时间戳 1700000000

  // 营养汇总
  totals: {
    calories: number;            // 总热量 293
    protein: number;             // 总蛋白质 21.3
    carbs: number;               // 总碳水 30.5
    fat: number;                 // 总脂肪 11.8
    price: number;               // 总价格 3.2
  };

  // 食物列表
  foodItems: Array<{
    id: string | number;
    name: string;                // "鸡蛋"
    emoji: string;               // "🥚"
    quantity: number;            // 2
    unit: string;                // "个"
    grams: number;               // 100 (换算后的克数)
    calories: number;            // 144
    protein: number;             // 13.3
    carbs: number;               // 2.8
    fat: number;                 // 8.8
  }>;

  // AI分析
  ai Analysis?: string;           // AI生成的营养分析报告

  // 元数据
  source: 'manual' | 'conversational';  // 记录来源
  tags?: string[];               // 标签，如["早餐", "减脂"]
}
```

### 1.2 DailyStats（每日统计）

```typescript
interface DailyStats {
  date: string; // "2025-11-24"
  totalCalories: number; // 当日总热量
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number; // 记录次数
  goalStatus: "under" | "target" | "over"; // 达标状态
  records: MealRecord[]; // 当日所有记录
}
```

### 1.3 MonthlyReport（月度报告）

```typescript
interface MonthlyReport {
  month: string; // "2025-11"
  stats: {
    avgDailyCalories: number; // 平均每日热量
    recordedDays: number; // 记录天数
    totalDays: number; // 当月总天数
    targetDays: number; // 达标天数
    overDays: number; // 超标天数
    underDays: number; // 不足天数

    // 营养素占比
    avgProteinPercent: number;
    avgCarbsPercent: number;
    avgFatPercent: number;

    // 极值
    maxCalorieDay: { date: string; calories: number };
    minCalorieDay: { date: string; calories: number };
  };

  dailyData: DailyStats[]; // 每日数据数组
}
```

---

## 🗄️ 第二部分：数据存储策略

### 2.1 存储方案对比

| 方案             | 优势                 | 劣势                    | 推荐        |
| ---------------- | -------------------- | ----------------------- | ----------- |
| **LocalStorage** | 免费、简单、即时     | 容量限制 5-10MB、单设备 | ⭐ MVP 阶段 |
| **Vercel KV**    | 免费额度、跨设备同步 | 需配置、复杂度高        | 未来升级    |
| **Supabase**     | 免费、功能强大、实时 | 需额外服务、学习成本    | 长期方案    |

### 2.2 推荐方案：渐进式存储

#### Phase 1: LocalStorage（MVP）⭐

**实现：**

```javascript
// lib/calendarStorage.js

const STORAGE_KEY = "calorie_calendar_records";

export function saveMealRecord(record) {
  const records = getAllRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getAllRecords() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getRecordsByDate(date) {
  const allRecords = getAllRecords();
  return allRecords.filter((r) => r.recordDate === date);
}

export function getRecordsByMonth(month) {
  const allRecords = getAllRecords();
  return allRecords.filter((r) => r.recordDate.startsWith(month));
}
```

**优势：**

- ✅ 零成本
- ✅ 即时可用
- ✅ 无需后端
- ✅ 2 小时完成 MVP

#### Phase 2: Vercel KV（可选升级）

```javascript
// app/api/calendar/records/route.js
import { kv } from "@vercel/kv";

export async function POST(request) {
  const record = await request.json();
  const key = `records:${record.userId}:${record.recordDate}`;

  const existing = (await kv.get(key)) || [];
  existing.push(record);
  await kv.set(key, existing);

  return Response.json({ success: true });
}
```

---

## 🏗️ 第三部分：API 架构设计

### 3.1 API 端点清单

#### 本地存储版（Phase 1）

```javascript
// 无需API端点，纯前端实现
// 使用 lib/calendarStorage.js 工具函数

saveMealRecord(record); // 保存记录
getRecordsByDate(date); // 获取某日记录
getRecordsByMonth(month); // 获取某月记录
calculateMonthlyStats(records); // 计算月度统计
```

#### 服务端版（Phase 2，未来）

```javascript
POST   /api/calendar/records          // 创建记录
GET    /api/calendar/records/day      // 查询某日
GET    /api/calendar/records/month    // 查询某月
POST   /api/ai/next-day-suggestion    // AI建议
DELETE /api/calendar/records/:id      // 删除记录
PUT    /api/calendar/records/:id      // 更新记录
```

### 3.2 前端函数架构

```javascript
// lib/calendarStorage.js

export const CalendarStorage = {
  // 基础CRUD
  saveRecord(record) {
    /* ... */
  },
  getRecords() {
    /* ... */
  },
  getRecordsByDate(date) {
    /* ... */
  },
  getRecordsByMonth(month) {
    /* ... */
  },
  deleteRecord(recordId) {
    /* ... */
  },

  // 统计计算
  getDailyStats(date) {
    /* ... */
  },
  getMonthlyStats(month) {
    /* ... */
  },

  // 辅助函数
  getTodayRecords() {
    /* ... */
  },
  getRecordsCount() {
    /* ... */
  },
};
```

---

## 🎨 第四部分：UI 组件设计

### 4.1 页面结构

```
/calendar - 热量日历主页
  ├─ 月视图（默认）
  │   ├─ 顶部控制器
  │   ├─ 日历网格
  │   └─ 月度报告栏
  └─ 日视图（点击日期进入）
      ├─ 顶部标题+返回
      ├─ 当日餐食记录列表
      └─ AI建议区
```

### 4.2 月视图组件设计

```jsx
// app/calendar/page.js

<div className="calendar-month-view">
  {/* 顶部控制器 */}
  <div className="calendar-header">
    <button onClick={prevMonth}>←</button>
    <h2>2025年 11月</h2>
    <button onClick={nextMonth}>→</button>
  </div>

  {/* 日历网格 */}
  <div className="calendar-grid">
    {daysInMonth.map((day) => (
      <div
        key={day.date}
        className="calendar-day-cell"
        onClick={() => goToDayView(day.date)}
      >
        <div className="day-number">{day.day}</div>
        {day.records && (
          <div className="day-calories">{day.totalCalories} kcal</div>
        )}
      </div>
    ))}
  </div>

  {/* 月度报告栏 */}
  <div className="monthly-report">
    <h3>本月数据</h3>
    <div className="stat">平均: {avgCalories} kcal/天</div>
    <div className="stat">记录: {recordedDays}/30 天</div>
    <DonutChart data={monthlyNutrientRatio} />
  </div>
</div>
```

### 4.3 日视图组件设计

```jsx
// app/calendar/[date]/page.js

<div className="calendar-day-view">
  {/* 顶部 */}
  <div className="header">
    <button onClick={backToMonth}>← 返回月视图</button>
    <h2>11月24日 周日</h2>
  </div>

  {/* 餐食记录列表 */}
  <div className="meal-records">
    {todayRecords.map((record) => (
      <div key={record.recordId} className="meal-card">
        <div className="time">记录于 {record.recordTime}</div>
        <div className="summary">{record.totals.calories} kcal</div>
        <details>
          <summary>包含：鸡蛋、牛奶...</summary>
          <ul>
            {record.foodItems.map((food) => (
              <li>
                {food.emoji} {food.name} {food.quantity}
                {food.unit}
              </li>
            ))}
          </ul>
        </details>
      </div>
    ))}
  </div>

  {/* AI建议 */}
  <div className="ai-suggestions">
    <h3>💡 明日饮食建议</h3>
    <p>{aiSuggestion}</p>
  </div>
</div>
```

---

## 🧮 第五部分：统计算法设计

### 5.1 月度统计计算

```javascript
// lib/calendarStats.js

export function calculateMonthlyStats(monthRecords, userGoal = 2000) {
  const dailyGroups = groupByDate(monthRecords);

  const stats = {
    avgDailyCalories: 0,
    recordedDays: Object.keys(dailyGroups).length,
    totalDays: getDaysInMonth(),
    targetDays: 0,
    overDays: 0,
    underDays: 0,

    avgProteinPercent: 0,
    avgCarbsPercent: 0,
    avgFatPercent: 0,

    maxCalorieDay: null,
    minCalorieDay: null,
  };

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0,

  Object.entries(dailyGroups).forEach(([date, records]) => {
    const dayTotal = records.reduce((sum, r) => sum + r.totals.calories, 0);

    totalCalories += dayTotal;
    totalProtein += records.reduce((sum, r) => sum + r.totals.protein, 0);
    totalCarbs += records.reduce((sum, r) => sum + r.totals.carbs, 0);
    totalFat += records.reduce((sum, r) => sum + r.totals.fat, 0);

    // 判断达标状态
    if (dayTotal >= userGoal * 0.9 && dayTotal <= userGoal * 1.1) {
      stats.targetDays++;
    } else if (dayTotal > userGoal * 1.1) {
      stats.overDays++;
    } else {
      stats.underDays++;
    }

    // 更新极值
    if (!stats.maxCalorieDay || dayTotal > stats.maxCalorieDay.calories) {
      stats.maxCalorieDay = { date, calories: dayTotal };
    }
    if (!stats.minCalorieDay || dayTotal < stats.minCalorieDay.calories) {
      stats.minCalorieDay = { date, calories: dayTotal };
    }
  });

  // 计算平均值
  stats.avgDailyCalories = Math.round(totalCalories / stats.recordedDays);

  // 计算营养素占比
  const totalNutrients = totalProtein + totalCarbs + totalFat;
  stats.avgProteinPercent = ((totalProtein / totalNutrients) * 100).toFixed(0);
  stats.avgCarbsPercent = ((totalCarbs / totalNutrients) * 100).toFixed(0);
  stats.avgFatPercent = ((totalFat / totalNutrients) * 100).toFixed(0);

  return stats;
}

// 辅助函数
function groupByDate(records) {
  return records.reduce((groups, record) => {
    const date = record.recordDate;
    if (!groups[date]) groups[date] = [];
    groups[date].push(record);
    return groups;
  }, {});
}
```

---

## 🔗 第六部分：与现有流程集成

### 6.1 修改 AI 分析弹窗

```jsx
// components/CalorieCalculator.js

{
  /* AI分析模态弹窗 */
}
{
  drawerState === "expanded" && aiResponse && (
    <div className="modal">
      {/* ... 现有内容 ... */}

      {/* 底部操作栏 - 修改 */}
      <div className="footer">
        <button
          onClick={handleSaveToCalendar}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "保存中..." : "📅 添加到热量日历"}
        </button>
        <button
          onClick={() => setDrawerState("closed")}
          className="btn-secondary"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

// 新增函数
async function handleSaveToCalendar() {
  setSaving(true);

  const record = {
    recordId: `rec_${Date.now()}_${Math.random().toString(36)}`,
    userId: "default", // 或从UserProfile获取
    recordDate: new Date().toISOString().split("T")[0],
    recordTime: new Date().toLocaleTimeString("zh-CN"),
    createdAt: Date.now(),
    totals: totals,
    foodItems: selectedFoods.map((f) => ({
      id: f.id,
      name: f.name,
      emoji: f.emoji,
      quantity: f.amount,
      unit: f.currentUnit,
      grams:
        f.amount * (f.units.find((u) => u.name === f.currentUnit)?.rate || 1),
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
    })),
    aiAnalysis: aiResponse,
    source: "manual", // 或 'conversational'
  };

  // 保存到localStorage
  CalendarStorage.saveRecord(record);

  // 显示成功提示
  toast.success("✅ 已成功添加到今日记录！");

  // 1秒后自动关闭弹窗
  setTimeout(() => {
    setDrawerState("closed");
    setSaving(false);
  }, 1000);
}
```

### 6.2 导航栏添加入口

```jsx
// components/Navbar.js

<Link href="/calendar" className="nav-link">
  📅 热量日历
</Link>
```

---

## 📅 第七部分：日历 UI 详细设计

### 7.1 月视图布局

```jsx
// app/calendar/page.js

"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarStorage } from "@/lib/calendarStorage";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState("2025-11");
  const [monthlyData, setMonthlyData] = useState(null);

  useEffect(() => {
    loadMonthData(currentMonth);
  }, [currentMonth]);

  function loadMonthData(month) {
    const records = CalendarStorage.getRecordsByMonth(month);
    const stats = calculateMonthlyStats(records);
    setMonthlyData(stats);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* 顶部控制器 */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setCurrentMonth(getPrevMonth(currentMonth))}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">{formatMonth(currentMonth)}</h1>
        <button onClick={() => setCurrentMonth(getNextMonth(currentMonth))}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 日历网格 */}
        <div className="lg:col-span-2">
          <CalendarGrid
            month={currentMonth}
            data={monthlyData?.dailyData || []}
          />
        </div>

        {/* 月度报告 */}
        <div className="lg:col-span-1">
          <MonthlyStatsPanel stats={monthlyData?.stats} />
        </div>
      </div>
    </div>
  );
}
```

### 7.2 日历网格组件

```jsx
// components/CalendarGrid.js

export function CalendarGrid({ month, data }) {
  const days = generateCa lendarDays(month);
  const dailyMap = createDailyMap(data);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <DayCell
            key={day.date}
            day={day}
            stats={dailyMap[day.date]}
          />
        ))}
      </div>
    </div>
  );
}

// 单日单元格
function DayCell({ day, stats }) {
  const hasRecords = stats && stats.totalCalories > 0;

  return (
    <Link
      href={`/calendar/${day.date}`}
      className={`
        aspect-square p-3 rounded-xl border-2 transition-all
        ${hasRecords
          ? 'bg-primary/5 border-primary/30 hover:border-primary hover:shadow-md'
          : 'border-gray-100 hover:border-gray-200'}
        ${day.isToday ? 'ring-2 ring-primary' : ''}
      `}
    >
      <div className="text-sm font-semibold text-text-primary">{day.day}</div>
      {hasRecords && (
        <div className="mt-2">
          <div className="text-xs font-bold text-primary">
            {stats.totalCalories} kcal
          </div>
          <div className="text-xs text-gray-500">
            {stats.mealCount}餐
          </div>
        </div>
      )}
    </Link>
  );
}
```

### 7.3 月度统计面板

```jsx
// components/MonthlyStatsPanel.js

export function MonthlyStatsPanel({ stats }) {
  if (!stats) return <div>加载中...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h3 className="text-xl font-bold text-text-primary">📊 本月数据</h3>

      {/* 核心指标 */}
      <div className="space-y-4">
        <div className="stat-card">
          <div className="label">平均每日热量</div>
          <div className="value">{stats.avgDailyCalories} kcal</div>
        </div>

        <div className="stat-card">
          <div className="label">记录天数</div>
          <div className="value">
            {stats.recordedDays} / {stats.totalDays} 天
          </div>
        </div>

        <div className="stat-card">
          <div className="label">热量控制</div>
          <div className="flex gap-2">
            <span className="badge bg-green-100">
              达标 {stats.targetDays}天
            </span>
            <span className="badge bg-red-100">超标 {stats.overDays}天</span>
          </div>
        </div>
      </div>

      {/* 营养素占比 */}
      <div>
        <div className="label mb-3">营养素平均占比</div>
        <DonutChart
          protein={stats.avgProteinPercent}
          carbs={stats.avgCarbsPercent}
          fat={stats.avgFatPercent}
        />
      </div>

      {/* 极值日 */}
      <div>
        <div className="label mb-2">关键日</div>
        <div className="text-sm space-y-1">
          <div>
            🔥 最高: {stats.maxCalorieDay.date} ({stats.maxCalorieDay.calories}{" "}
            kcal)
          </div>
          <div>
            🌱 最低: {stats.minCalorieDay.date} ({stats.minCalorieDay.calories}{" "}
            kcal)
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🤖 第八部分：AI 建议功能

### 8.1 第二天建议生成

```javascript
// lib/aiSuggestions.js

export async function generateNextDaySuggestion(todayRecords, userProfile) {
  // 汇总今日数据
  const todayTotals = todayRecords.reduce(
    (sum, r) => ({
      calories: sum.calories + r.totals.calories,
      protein: sum.protein + r.totals.protein,
      carbs: sum.carbs + r.totals.carbs,
      fat: sum.fat + r.totals.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // 构建Prompt
  const prompt = `你是营养师。分析今天的饮食记录：

今日摄入：
- 热量：${todayTotals.calories} kcal
- 蛋白质：${todayTotals.protein}g
- 碳水：${todayTotals.carbs}g
- 脂肪：${todayTotals.fat}g

用户目标：
- 每日热量目标：${userProfile.tdee} kcal
- 健康目标：${userProfile.goal}

分析今日不足，给出明日3条具体的饮食建议。`;

  const response = await fetch("/api/analyze-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
    }),
  });

  return await response.text();
}
```

---

## 🚀 第九部分：实施路线图

### Phase 1: MVP 基础功能（1 周）

**任务清单：**

- [ ] 创建 calendarStorage.js（LocalStorage 存储）
- [ ] 在 AI 弹窗添加"添加到日历"按钮
- [ ] 创建/calendar 页面（月视图）
- [ ] 实现日历网格组件
- [ ] 基础月度统计

**可交付：**

- 可以保存记录
- 可以查看月历
- 显示当日热量

---

### Phase 2: 日视图+统计（5 天）

**任务清单：**

- [ ] 创建/calendar/[date]页面（日视图）
- [ ] 实现餐食记录卡片
- [ ] 完善月度统计算法
- [ ] 添加环形图展示

**可交付：**

- 点击日期查看详情
- 完整月度报告
- 数据可视化

---

### Phase 3: AI 建议功能（3 天）

**任务清单：**

- [ ] 实现第二天建议生成
- [ ] 在日视图添加 AI 建议区
- [ ] 优化用户体验
- [ ] 性能优化

**可交付：**

- 智能饮食建议
- 完整闭环体验

---

### Phase 4: 增强功能（未来）

**任务清单：**

- [ ] 导出为 PDF/图片
- [ ] 数据备份/导入
- [ ] 历史趋势图表
- [ ] 周报告功能
- [ ] 云端同步（Vercel KV）

---

## 💾 第十部分：数据示例

### 示例数据

```javascript
// 一条完整的餐食记录
const exampleRecord = {
  recordId: "rec_1700000000_abc123",
  userId: "user_default",
  recordDate: "2025-11-24",
  recordTime: "14:30:25",
  createdAt: 1700000000,
  totals: {
    calories: 293,
    protein: 21.3,
    carbs: 30.5,
    fat: 11.8,
    price: 3.2,
  },
  foodItems: [
    {
      id: 28,
      name: "鸡蛋",
      emoji: "🥚",
      quantity: 2,
      unit: "个",
      grams: 100,
      calories: 144,
      protein: 13.3,
      carbs: 2.8,
      fat: 8.8,
    },
    {
      id: 109,
      name: "牛奶",
      emoji: "🥛",
      quantity: 250,
      unit: "ml",
      grams: 250,
      calories: 135,
      protein: 8,
      carbs: 12.5,
      fat: 8,
    },
  ],
  aiAnalysis: "### 总体评价\n这是一份高蛋白、低脂肪的健康早餐...",
  source: "manual",
};
```

---

## 📊 第十一部分：技术栈总览

```
前端框架
├─ Next.js 14
├─ React 18
└─ Tailwind CSS

数据存储
├─ Phase 1: localStorage ⭐
├─ Phase 2: Vercel KV (可选)
└─ Phase 3: Supabase (长期)

AI服务
├─ OpenRouter + Gemini
├─ 对话分析
├─ 营养分析
└─ 建议生成

UI组件
├─ 日历网格组件
├─ 日期选择器
├─ 统计图表（环形图）
└─ 餐食记录卡片
```

---

## 🎯 第十二部分：成功指标

| 指标              | 目标值                |
| ----------------- | --------------------- |
| 记录保存成功率    | >99%                  |
| 月视图加载时间    | <500ms                |
| 日视图加载时间    | <300ms                |
| LocalStorage 容量 | <2MB（可存 1 年数据） |
| 用户留存率        | >50%（7 天）          |

---

## 💡 第十三部分：未来扩展

### 数据分析

- 📈 趋势图表（热量曲线）
- 📊 营养素分析雷达图
- 🎯 目标达成率统计
- 📉 体重变化追踪

### 社交功能

- 👥 分享月报告
- 🏆 成就系统
- 📱 提醒推送

### 智能功能

- 🤖 AI 自动规划下周饮食
- 📷 拍照自动记录
- 🗣️ 语音快速记录

---

## 🎉 方案总结

热量日历将应用从"计算器"升级为"管理系统"：

✅ **长期记录**：每日餐食持久化  
✅ **可视化**：日历+图表展示  
✅ **智能分析**：月度统计+AI 建议  
✅ **闭环管理**：计算 → 记录 → 分析 → 优化  
✅ **零成本**：LocalStorage 方案免费

下一步建议：

1. 审阅本方案
2. 确认技术选型
3. 切换到 Code 模式开始实施
