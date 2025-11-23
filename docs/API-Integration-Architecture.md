# 动态食物数据查询与集成技术方案 V1.0

## 📋 项目概述

### 当前状态

- 静态食材数据库：110 种预定义食材
- 数据硬编码在前端
- 用户只能从固定列表选择

### 目标升级

将应用从"固定菜单计算器"升级为"全功能营养查询工具"，支持用户查询任意食材并获取实时营养数据。

---

## 🔍 第一部分：API 服务商选型对比

### 1.1 候选 API 服务

#### Option 1: Nutritionix API ⭐ **推荐**

**优势：**

- ✅ 支持自然语言查询（"一个苹果"、"100 克牛肉"）
- ✅ 数据覆盖全面（包含中文食材数据）
- ✅ 响应速度快（平均<500ms）
- ✅ JSON 格式清晰
- ✅ 提供品牌食品数据

**数据字段：**

```json
{
  "food_name": "apple",
  "serving_qty": 1,
  "serving_unit": "medium",
  "nf_calories": 95,
  "nf_protein": 0.5,
  "nf_total_carbohydrate": 25,
  "nf_total_fat": 0.3
}
```

**定价：**

- Free tier: 500 次/天
- Basic: $69/月（50,000 次）
- Pro: $199/月（250,000 次）

**中文支持：**

- 部分支持中文食材名称
- 可能需要中英文混合查询策略

---

#### Option 2: Edamam Food Database API

**优势：**

- ✅ 数据库庞大（超过 900,000 种食品）
- ✅ 结构化数据完善
- ✅ RESTful API 设计优秀

**数据字段：**

```json
{
  "food": {
    "label": "Apple",
    "nutrients": {
      "ENERC_KCAL": 52,
      "PROCNT": 0.26,
      "CHOCDF": 13.81,
      "FAT": 0.17
    }
  }
}
```

**定价：**

- Developer: Free（5,000 次/月）
- Starter: $49/月（100,000 次）
- Growth: $299/月（1,000,000 次）

**劣势：**

- ⚠️ 中文支持较弱
- ⚠️ 需要精确的英文名称

---

#### Option 3: USDA FoodData Central API

**优势：**

- ✅ 官方权威数据
- ✅ 完全免费
- ✅ 数据质量高

```json
{
  "description": "Apples, raw",
  "foodNutrients": [
    { "nutrientName": "Energy", "value": 52 },
    { "nutrientName": "Protein", "value": 0.26 },
    { "nutrientName": "Carbohydrate", "value": 13.81 },
    { "nutrientName": "Total lipid (fat)", "value": 0.17 }
  ]
}
```

**劣势：**

- ⚠️ 仅英文，无中文支持
- ⚠️ 接口复杂，需要多次请求
- ⚠️ 响应速度较慢

---

### 1.2 推荐方案

**主选：Nutritionix API**

- 理由：自然语言查询+部分中文 support+快速响应
- 备选：USDA（免费兜底）

**混合策略：**

1. 优先使用本地静态数据库（110 种常见食材）
2. 搜索不到时调用 Nutritionix API
3. USDA 作为免费补充数据源

---

## 🏗️ 第二部分：后端代理架构设计

### 2.1 技术栈

**Next.js API Routes (Serverless Functions)**

- 路径：`/app/api/food/search/route.js`
- 部署：Vercel Edge Functions
- 语言：JavaScript/TypeScript

### 2.2 架构图

```
┌─────────────┐
│  用户前端    │
│  搜索框      │
└──────┬──────┘
       │ 1. 输入"菠萝"
       ↓
┌──────────────────┐
│  Debounce (300ms)│
└──────┬───────────┘
       │ 2. 发起请求
       ↓
┌────────────────────────────────┐
│ Next.js API Routes             │
│ /api/food/search?q=菠萝        │
│                                 │
│  ┌─────────────────────────┐  │
│  │ 1. 查询本地缓存 (KV)    │  │
│  └─────────┬───────────────┘  │
│            │ 命中？            │
│       ┌────┴────┐              │
│      是         否              │
│       │          │              │
│   返回缓存  ┌───┴──────────┐  │
│       │     │ 2. 查询静态DB │  │
│       │     └───┬──────────┘  │
│       │         │ 命中？       │
│       │    ┌────┴────┐         │
│       │   是         否         │
│       │    │          │         │
│       │  返回   ┌────┴────────┐│
│       │    │    │3. 调用第三方││
│       │    │    │   API       ││
│       │    │    └────┬────────┘│
│       │    │         │         │
│       │    │    ┌────┴────────┐│
│       │    │    │4. 缓存结果  ││
│       │    │    │  (7天)      ││
│       │    │    └────┬────────┘│
│       │    │         │         │
│       └────┴─────────┘         │
│              │                  │
│          返回统一格式           │
└──────────────┬─────────────────┘
               │ 5. 标准化数据
               ↓
┌──────────────────────┐
│  前端接收并渲染      │
│  食材列表            │
└──────────────────────┘
```

### 2.3 API Routes 实现

#### 文件结构

```
app/
├── api/
│   ├── food/
│   │   ├── search/
│   │   │   └── route.js      # 搜索食材
│   │   ├── details/
│   │   │   └── route.js      # 获取详情
│   │   └── popular/
│   │       └── route.js      # 获取热门食材
│   └── analyze-meal/
│       └── route.js          # AI分析（已有）
```

#### 核心代码结构

```javascript
// app/api/food/search/route.js
import { kv } from "@vercel/kv";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ error: "查询参数不能为空" }, { status: 400 });
  }

  // 步骤1：查询缓存
  const cacheKey = `food:${query}`;
  const cached = await kv.get(cacheKey);
  if (cached) {
    return Response.json({
      source: "cache",
      data: cached,
    });
  }

  // 步骤2：查询静态数据库
  const staticResult = searchStaticDatabase(query);
  if (staticResult.length > 0) {
    await kv.set(cacheKey, staticResult, { ex: 604800 }); // 缓存7天
    return Response.json({
      source: "static",
      data: staticResult,
    });
  }

  // 步骤3：调用第三方API
  try {
    const nutritionixResult = await fetchNutritionix(query);
    const standardized = standardizeNutritionixData(nutritionixResult);

    // 步骤4：缓存结果
    await kv.set(cacheKey, standardized, { ex: 604800 });

    return Response.json({
      source: "api",
      data: standardized,
    });
  } catch (error) {
    return Response.json(
      {
        error: "查询失败",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// 调用Nutritionix API
async function fetchNutritionix(query) {
  const response = await fetch(
    "https://trackapi.nutritionix.com/v2/natural/nutrients",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": process.env.NUTRITIONIX_APP_ID,
        "x-app-key": process.env.NUTRITIONIX_API_KEY,
      },
      body: JSON.stringify({ query }),
    }
  );

  return response.json();
}

// 标准化数据格式
function standardizeNutritionixData(apiData) {
  return apiData.foods.map((food) => ({
    id: generateId(food.food_name),
    name: food.food_name,
    emoji: inferEmoji(food.food_name),
    calories: food.nf_calories,
    protein: food.nf_protein,
    carbs: food.nf_total_carbohydrate,
    fat: food.nf_total_fat,
    price: estimatePrice(food), // 基于食材类型估算价格
    primaryUnit: food.serving_unit || "g",
    defaultQuantity: food.serving_qty || 100,
    servingSize: food.serving_weight_grams || 100,
    units: inferUnits(food),
    source: "nutritionix",
  }));
}
```

---

## 💾 第三部分：数据缓存策略

### 3.1 缓存层级

#### L1: 浏览器内存缓存（React State）

- **位置**：前端组件 state
- **时效**：会话期间
- **容量**：无限制
- **用途**：已搜索过的食材立即返回

#### L2: Vercel KV (Redis)

- **位置**：Edge Network
- **时效**：7 天
- **容量**：512MB（Hobby 计划）
- **用途**：API 调用结果缓存

#### L3: 静态数据库

- **位置**：前端代码
- **时效**：永久
- **容量**：110 种食材
- **用途**：常见食材兜底

### 3.2 缓存键设计

```javascript
// 搜索缓存
key: `food:search:${query}`
value: [{ id, name, calories, ... }]
ttl: 7天

// 详情缓存
key: `food:detail:${foodId}`
value: { id, name, calories, ... }
ttl: 30天

// 热门食材缓存
key: `food:popular`
value: [{ id, name, ... }]
ttl: 1天
```

### 3.3 缓存更新策略

```javascript
// LRU淘汰策略
if (cacheSize > maxSize) {
  删除最久未使用的数据
}

// 主动更新
定期（每周）后台任务更新热门食材
```

---

## 🔄 第四部分：前端搜索流程重构

### 4.1 用户交互流程

```
用户输入 → Debounce 300ms → Loading状态 → API请求 → 结果渲染
```

### 4.2 前端代码结构

```javascript
// components/CalorieCalculator.js

const [searchResults, setSearchResults] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
const [searchError, setSearchError] = useState("");

// Debounced搜索
const debouncedSearch = useDebounce(searchQuery, 300);

useEffect(() => {
  if (!debouncedSearch) {
    setSearchResults([]);
    return;
  }

  handleSearch(debouncedSearch);
}, [debouncedSearch]);

async function handleSearch(query) {
  setSearchLoading(true);
  setSearchError("");

  try {
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("搜索失败");

    const { data, source } = await res.json();
    setSearchResults(data);

    // 显示数据来源标识
    if (source === "api") {
      toast("从在线数据库获取");
    }
  } catch (error) {
    setSearchError(error.message);
  } finally {
    setSearchLoading(false);
  }
}
```

### 4.3 UI 状态展示

```javascript
// 搜索结果区域
{
  searchLoading && (
    <div className="loading-skeleton">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 h-16 rounded-xl mb-2"
        />
      ))}
    </div>
  );
}

{
  searchError && (
    <div className="error-message bg-red-50 p-4 rounded-xl">
      <p className="text-red-600">{searchError}</p>
      <button onClick={retrySearch}>重试</button>
    </div>
  );
}

{
  searchResults.map((food) => (
    <FoodCard key={food.id} food={food} source={food.source} />
  ));
}
```

---

## 📊 第五部分：数据结构标准化

### 5.1 统一数据模型

```typescript
interface FoodItem {
  id: string | number; // 唯一标识
  name: string; // 中文名称
  nameEn?: string; // 英文名称（可选）
  emoji: string; // emoji图标
  calories: number; // 热量（kcal/100g）
  protein: number; // 蛋白质（g/100g）
  carbs: number; // 碳水（g/100g）
  fat: number; // 脂肪（g/100g）
  price: number; // 估算价格（¥/100g）
  primaryUnit: string; // 主单位
  defaultQuantity: number; // 默认数量
  servingSize: number; // 标准份量（g）
  units: Array<{
    // 可用单位
    name: string;
    rate: number;
  }>;
  source: "static" | "cache" | "api"; // 数据来源
  category?: string; // 分类（可选）
  verified?: boolean; // 是否验证（可选）
}
```

### 5.2 数据转换层

```javascript
// lib/foodTransform.js

export function standardizeNutritionixData(apiData) {
  return apiData.foods.map((food) => ({
    id: `nx_${hashCode(food.food_name)}`,
    name: translateToChineseOrKeep(food.food_name),
    nameEn: food.food_name,
    emoji: inferEmojiFromName(food.food_name),
    calories: Math.round((food.nf_calories / food.serving_weight_grams) * 100),
    protein: parseFloat(
      ((food.nf_protein / food.serving_weight_grams) * 100).toFixed(1)
    ),
    carbs: parseFloat(
      ((food.nf_total_carbohydrate / food.serving_weight_grams) * 100).toFixed(
        1
      )
    ),
    fat: parseFloat(
      ((food.nf_total_fat / food.serving_weight_grams) * 100).toFixed(1)
    ),
    price: estimatePriceByCategory(food.food_name),
    primaryUnit: normalizeUnit(food.serving_unit),
    defaultQuantity: food.serving_qty || 1,
    servingSize: food.serving_weight_grams || 100,
    units: generateUnitsFromServing(food),
    source: "api",
    category: inferCategory(food.food_name),
  }));
}

// Emoji推断逻辑
function inferEmojiFromName(name) {
  const emojiMap = {
    apple: "🍎",
    banana: "🍌",
    chicken: "🍗",
    beef: "🥩",
    rice: "🍚",
    bread: "🍞",
    egg: "🥚",
    milk: "🥛", // ...
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (name.toLowerCase().includes(key)) return emoji;
  }

  return "🍽️"; // 默认
}

// 价格估算逻辑
function estimatePriceByCategory(name) {
  const priceMap = {
    肉类: 3.0,
    海鲜: 6.0,
    蔬菜: 0.6,
    水果: 1.0,
    主食: 0.5,
    其他: 1.5,
  };

  const category = inferCategory(name);
  return priceMap[category] || 1.0;
}
```

---

## 💰 第六部分：成本与性能分析

### 6.1 成本估算

**场景：日活 1000 用户**

| 指标               | 估算         | 说明             |
| ------------------ | ------------ | ---------------- |
| 平均每用户搜索次数 | 5 次/天      | 查询不同食材     |
| 总搜索次数         | 5,000 次/天  | 1000 用户 × 5 次 |
| 缓存命中率         | 70%          | 热门食材重复查询 |
| 实际 API 调用      | 1,500 次/天  | 5000 × (1-0.7)   |
| 月度 API 调用      | 45,000 次/月 | 1500 × 30 天     |

**Nutritionix 定价：**

- Free tier: 500 次/天 ≈ 15,000 次/月 ❌ 不够
- Basic: $69/月（50,000 次）✅ **推荐**
- Pro: $199/月（250,000 次）过剩

**Vercel KV (Redis)：**

- Hobby: Free (256MB) ✅ 足够
- Pro: $20/月 (512MB) 备用

**总成本：**

- 开发阶段：$0（用 Free tier 测试）
- 小规模运营：$69/月
- 中等规模：$69 + $20 = $89/月

### 6.2 性能指标

| 操作         | 目标响应时间 | 策略            |
| ------------ | ------------ | --------------- |
| 本地数据查询 | <50ms        | 前端内存        |
| 缓存命中     | <100ms       | Vercel KV       |
| API 调用     | <800ms       | Nutritionix     |
| 总用户感知   | <1s          | 结合 Loading UI |

---

## 🛠️ 第七部分：实施路线图

### Phase 1: 基础架构（1-2 周）

**任务清单：**

- [ ] 注册 Nutritionix 账号，获取 API Key
- [ ] 配置 Vercel KV (Redis)
- [ ] 创建 API Routes 基础框架
- [ ] 实现数据标准化转换层
- [ ] 编写单元测试

**可交付成果：**

- `/api/food/search` 端点可用
- 返回标准化数据结构
- 基础缓存机制工作

---

### Phase 2: 前端集成（1 周）

**任务清单：**

- [ ] 重构搜索组件，支持异步查询
- [ ] 添加 Loading/Error 状态 UI
- [ ] 实现 debounce 防抖
- [ ] 添加数据来源标识
- [ ] 优化搜索结果展示

**可交付成果：**

- 搜索框可查询任意食材
- 平滑的异步体验
- 清晰的状态反馈

---

### Phase 3: 增强功能（1 周）

**任务清单：**

- [ ] 实现中英文混合查询
- [ ] 添加搜索历史记录
- [ ] 热门食材推荐
- [ ] 离线模式支持（PWA）
- [ ] 性能监控和日志

**可交付成果：**

- 智能化搜索体验
- 数据分析看板
- 生产就绪

---

### Phase 4: 优化迭代（持续）

**任务清单：**

- [ ] 机器学习价格预测
- [ ] 用户反馈数据修正
- [ ] 多语言支持
- [ ] A/B 测试不同 API
- [ ] 成本优化

---

## 🔐 第八部分：安全与合规

### 8.1 API Key 管理

```javascript
// .env.local (不提交到Git)
NUTRITIONIX_APP_ID=your_app_id
NUTRITIONIX_API_KEY=your_api_key
VERCEL_KV_REST_API_URL=...
VERCEL_KV_REST_API_TOKEN=...

// next.config.js
module.exports = {
  env: {
    // 仅在服务端可用
  }
}
```

### 8.2 速率限制

```javascript
// 防止滥用
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10次/分钟
});

export async function GET(request) {
  const ip = request.headers.get("x-forwarded-for");
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json({ error: "请求过于频繁" }, { status: 429 });
  }

  // ... 正常处理
}
```

---

## 📈 第九部分：监控与优化

### 9.1 性能监控

```javascript
// lib/analytics.js

export function trackAPICall(source, duration, cached) {
  // 发送到分析服务
  analytics.track("Food API Call", {
    source, // 'static' | 'cache' | 'api'
    duration, // 响应时间(ms)
    cached, // boolean
    timestamp: new Date(),
  });
}

// 在API Route中使用
const startTime = Date.now();
const result = await fetchData();
trackAPICall("api", Date.now() - startTime, false);
```

### 9.2 错误监控

```javascript
// 使用Sentry等服务
import * as Sentry from "@sentry/nextjs";

try {
  // API调用
} catch (error) {
  Sentry.captureException(error, {
    tags: { api: "nutritionix" },
    extra: { query },
  });
}
```

---

## 🎯 第十部分：备选方案与风险控制

### 10.1 API 故障降级

```javascript
async function fetchWithFallback(query) {
  try {
    // 优先：Nutritionix
    return await fetchNutritionix(query);
  } catch (error) {
    try {
      // 备选：USDA
      return await fetchUSDA(query);
    } catch (error2) {
      // 兜底：返回静态数据
      return searchStaticDatabase(query);
    }
  }
}
```

### 10.2 成本控制

**触发器：**

- 当月 API 调用超过 45,000 次
- 触发警报邮件
- 自动降级到免费 tier（USDA）

**优化策略：**

- 提高缓存命中率目标至 85%
- 智能合并相似查询
- 预加载热门食材

---

## 📝 第十一部分：技术债务与待办事项

### 11.1 即时 TODO

- [ ] 研究 Nutritionix 中文食材支持程度
- [ ] 评估 Vercel Serverless Functions 免费额度
- [ ] 设计中英文食材名称映射表
- [ ] 准备测试数据集

### 11.2 长期规划

- [ ] 考虑自建食材数据库（降低成本）
- [ ] 众包用户贡献数据验证
- [ ] 与中国营养数据库合作
- [ ] 开发移动端 App

---

## 🚀 推荐实施顺序

### 迭代 1：原型验证（1 周）

1. 注册 Nutritionix Free 账号
2. 创建简单 API Route
3. 前端搜索框集成
4. 验证可行性

### 迭代 2：生产就绪（2 周）

1. 配置 Vercel KV 缓存
2. 完善错误处理
3. 添加 Loading 状态
4. 性能优化

### 迭代 3：规模化（1 周）

1. 升级到付费 API
2. 监控系统上线
3. 成本控制策略
4. 用户体验优化

---

## 📊 成功指标

| 指标                | 目标值 |
| ------------------- | ------ |
| API 响应时间（P95） | <1s    |
| 缓存命中率          | >70%   |
| 搜索成功率          | >95%   |
| 月度成本            | <$100  |
| 用户满意度          | >4.5/5 |

---

## 🎨 总结

这个方案将轻食热量计算器从"固定菜单"升级为"全功能营养查询工具"，核心优势：

✅ **无限食材**：从 110 种 → 无限  
✅ **实时数据**：权威营养数据库  
✅ **智能缓存**：L1+L2+L3 三层  
✅ **成本可控**：$69/月起步  
✅ **性能优秀**：缓存 hit <100ms  
✅ **可扩展**：支持未来功能

下一步建议：

1. 审阅本方案
2. 确认 API 服务商（Nutritionix 推荐）
3. 切换到 Code 模式开始实施
