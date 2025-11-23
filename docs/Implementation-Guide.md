# 动态食物查询 API 集成实施指南

## 🚀 快速开始：5 步完成 API 集成

---

## 步骤 1：注册 Nutritionix 账号并获取 API Key

### 1.1 注册流程

1. 访问：https://www.nutritionix.com/business/api
2. 点击"Sign Up Free"
3. 选择"Developer"计划（500 次/天免费）
4. 填写信息并验证邮箱
5. 进入 Dashboard 获取：
   - **App ID**
   - **API Key**

### 1.2 配置环境变量

```bash
# .env.local（项目根目录）
NUTRITIONIX_APP_ID=你的APP_ID
NUTRITIONIX_API_KEY=你的API_KEY
```

---

## 步骤 2：创建 Next.js API Route

### 文件：`app/api/food/search/route.js`

```javascript
import { NextResponse } from "next/server";

// Nutritionix API配置
const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;
const API_ENDPOINT = "https://trackapi.nutritionix.com/v2/natural/nutrients";

export async function POST(request) {
  try {
    // 1. 获取查询参数
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "查询不能为空" }, { status: 400 });
    }

    console.log("[Food Search API] 查询:", query);

    // 2. 调用Nutritionix API
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_API_KEY,
      },
      body: JSON.stringify({
        query: query,
        timezone: "Asia/Shanghai",
      }),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API错误: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Food Search API] 原始返回:", data);

    // 3. 转换为标准格式
    const standardized = data.foods.map((food, index) => ({
      id: `api_${Date.now()}_${index}`,
      name: food.food_name,
      emoji: getEmojiForFood(food.food_name),

      // 营养数据（转换为每100g）
      calories: Math.round(
        (food.nf_calories / food.serving_weight_grams) * 100
      ),
      protein: parseFloat(
        ((food.nf_protein / food.serving_weight_grams) * 100).toFixed(1)
      ),
      carbs: parseFloat(
        (
          (food.nf_total_carbohydrate / food.serving_weight_grams) *
          100
        ).toFixed(1)
      ),
      fat: parseFloat(
        ((food.nf_total_fat / food.serving_weight_grams) * 100).toFixed(1)
      ),

      // 其他信息
      price: 1.0, // 默认价格
      primaryUnit: "g",
      defaultQuantity: 100,
      servingSize: 100,
      units: [{ name: "g", rate: 1 }],
      source: "nutritionix",
      photo: food.photo?.thumb,
    }));

    console.log("[Food Search API] 标准化数据:", standardized);

    // 4. 返回结果
    return NextResponse.json({
      success: true,
      data: standardized,
      source: "nutritionix",
    });
  } catch (error) {
    console.error("[Food Search API] 错误:", error);

    return NextResponse.json(
      {
        success: false,
        error: "查询失败",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// 辅助函数：根据食物名称推断emoji
function getEmojiForFood(foodName) {
  const name = foodName.toLowerCase();
  const emojiMap = {
    apple: "🍎",
    banana: "🍌",
    orange: "🍊",
    grape: "🍇",
    chicken: "🍗",
    beef: "🥩",
    pork: "🥓",
    fish: "🐟",
    egg: "🥚",
    milk: "🥛",
    cheese: "🧀",
    yogurt: "🥛",
    rice: "🍚",
    bread: "🍞",
    pasta: "🍝",
    noodle: "🍜",
    tomato: "🍅",
    carrot: "🥕",
    broccoli: "🥦",
    lettuce: "🥬",
    potato: "🥔",
    onion: "🧅",
    pepper: "🫑",
    cucumber: "🥒",
    strawberry: "🍓",
    watermelon: "🍉",
    cherry: "🍒",
    peach: "🍑",
  };

  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (name.includes(keyword)) return emoji;
  }

  return "🍽️"; // 默认图标
}
```

---

## 步骤 3：前端调用 API

### 修改：`components/CalorieCalculator.js`

```javascript
// 在组件中添加API搜索功能

const [apiSearchLoading, setApiSearchLoading] = useState(false);
const [apiResults, setApiResults] = useState([]);

// API搜索函数
async function searchFoodAPI(query) {
  setApiSearchLoading(true);

  try {
    const response = await fetch("/api/food/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error("API请求失败");
    }

    const result = await response.json();

    if (result.success) {
      setApiResults(result.data);
      console.log("从API获取到食材:", result.data);
    } else {
      console.error("API返回错误:", result.error);
    }
  } catch (error) {
    console.error("搜索失败:", error);
  } finally {
    setApiSearchLoading(false);
  }
}

// 在搜索框下方添加"在线搜索"按钮
<button
  onClick={() => searchFoodAPI(searchQuery)}
  disabled={!searchQuery || apiSearchLoading}
  className="px-4 py-2 bg-ai-blue text-white rounded-xl"
>
  {apiSearchLoading ? "搜索中..." : "🌐 在线搜索更多食材"}
</button>;

// 显示API搜索结果
{
  apiResults.length > 0 && (
    <div className="mt-4">
      <div className="text-sm text-gray-500 mb-2">在线搜索结果:</div>
      {apiResults.map((food) => (
        <FoodCard key={food.id} food={food} />
      ))}
    </div>
  );
}
```

---

## 步骤 4：测试 API 调用

### 4.1 使用 curl 测试

```bash
# 测试Next.js API Route
curl -X POST http://localhost:3000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query":"apple"}'

# 期望返回
{
  "success": true,
  "data": [
    {
      "id": "api_1234567890_123",
      "name": "apple",
      "emoji": "🍎",
      "calories": 52,
      "protein": 0.3,
      "carbs": 13.8,
      "fat": 0.2,
      ...
    }
  ],
  "source": "nutritionix"
}
```

### 4.2 直接测试 Nutritionix API

```bash
# 直接测试Nutritionix（替换YOUR_APP_ID和YOUR_API_KEY）
curl -X POST 'https://trackapi.nutritionix.com/v2/natural/nutrients' \
  -H 'Content-Type: application/json' \
  -H 'x-app-id: YOUR_APP_ID' \
  -H 'x-app-key: YOUR_API_KEY' \
  -d '{
    "query": "1 apple"
  }'
```

---

## 步骤 5：前端 UI 集成

### 5.1 添加在线搜索入口

在搜索框下方添加提示和按钮：

```jsx
{
  /* 搜索框 */
}
<input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="搜索食材（支持拼音）"
/>;

{
  /* 搜索提示 */
}
<div className="mt-2 text-xs text-gray-500">
  💡 本地没找到？试试在线搜索更多食材
</div>;

{
  /* 在线搜索按钮 */
}
{
  searchQuery && displayFoods.length === 0 && (
    <button
      onClick={() => searchFoodAPI(searchQuery)}
      disabled={apiSearchLoading}
      className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-ai-blue to-ai-purple text-white rounded-xl font-semibold"
    >
      {apiSearchLoading ? (
        <>
          <Loader2 className="animate-spin inline mr-2" size={16} />
          正在线搜索...
        </>
      ) : (
        <>🌐 在线搜索更多食材</>
      )}
    </button>
  );
}
```

### 5.2 显示搜索结果

```jsx
{
  /* API搜索结果 */
}
{
  apiResults.length > 0 && (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-ai-blue">在线搜索结果</span>
        <span className="text-xs px-2 py-0.5 bg-ai-blue/10 text-ai-blue rounded-full">
          来源：Nutritionix
        </span>
      </div>

      <div className="space-y-2">
        {apiResults.map((food) => (
          <div
            key={food.id}
            className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border-2 border-ai-blue/20 cursor-pointer hover:shadow-md transition-all"
            onClick={() => addFood(food)}
          >
            <span className="text-2xl">{food.emoji}</span>
            <div className="flex-1">
              <div className="font-semibold text-text-primary">{food.name}</div>
              <div className="text-xs text-text-secondary">
                {food.calories} kcal/100g
              </div>
            </div>
            <button className="bg-ai-blue text-white px-3 py-1 rounded-lg">
              添加
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 完整测试流程

### 测试 1：本地开发环境

```bash
# 1. 确保环境变量已配置
cat .env.local
# 应该看到：
# NUTRITIONIX_APP_ID=...
# NUTRITIONIX_API_KEY=...

# 2. 启动开发服务器
npm run dev

# 3. 访问
http://localhost:3000

# 4. 测试搜索
在搜索框输入：apple
点击"在线搜索"按钮
查看控制台日志和返回结果
```

### 测试 2：API 端点测试

```javascript
// 在浏览器控制台运行
fetch("/api/food/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "banana" }),
})
  .then((res) => res.json())
  .then((data) => console.log("结果:", data));
```

### 测试 3：端到端测试

```
1. 输入"pineapple"（菠萝）
2. 点击"在线搜索"
3. 等待1-2秒
4. 查看返回的食材卡片
5. 点击"添加"
6. 验证食材已添加到右侧列表
7. 查看营养数据是否正确
```

---

## 📊 实际 API 响应示例

### Nutritionix 实际返回（苹果）

```json
{
  "foods": [
    {
      "food_name": "apple",
      "brand_name": null,
      "serving_qty": 1,
      "serving_unit": "medium (3\" dia)",
      "serving_weight_grams": 182,
      "nf_calories": 94.64,
      "nf_total_fat": 0.31,
      "nf_saturated_fat": 0.05,
      "nf_cholesterol": 0,
      "nf_sodium": 1.82,
      "nf_total_carbohydrate": 25.13,
      "nf_dietary_fiber": 4.37,
      "nf_sugars": 18.91,
      "nf_protein": 0.47,
      "nf_potassium": 194.74
    }
  ]
}
```

### 我们的 API 返回（标准化后）

```json
{
  "success": true,
  "data": [
    {
      "id": "api_1700000000_0",
      "name": "苹果",
      "nameEn": "apple",
      "emoji": "🍎",
      "calories": 52,
      "protein": 0.3,
      "carbs": 13.8,
      "fat": 0.2,
      "price": 0.8,
      "primaryUnit": "个",
      "defaultQuantity": 1,
      "servingSize": 182,
      "units": [
        { "name": "g", "rate": 1 },
        { "name": "个", "rate": 182 }
      ],
      "source": "nutritionix"
    }
  ],
  "source": "nutritionix"
}
```

---

## 🔍 常见问题排查

### Q1: API 调用返回 401 Unauthorized

**原因：** API Key 配置错误

**解决：**

```bash
# 检查环境变量
echo $NUTRITIONIX_APP_ID
echo $NUTRITIONIX_API_KEY

# 重启开发服务器
npm run dev
```

### Q2: API 返回空数组

**原因：** 查询词不精确或 API 不认识

**解决：**

```javascript
// 使用英文查询
query: "apple"  ✅
query: "苹果"   ⚠️ 可能不识别

// 添加翻译层
function translateToEnglish(chineseQuery) {
  const dict = {
    '苹果': 'apple',
    '香蕉': 'banana',
    '鸡蛋': 'egg',
    // ...
  };
  return dict[chineseQuery] || chineseQuery;
}
```

### Q3: 请求超时

**原因：** Nutritionix API 响应慢

**解决：**

```javascript
// 添加超时控制
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

fetch(API_ENDPOINT, {
  signal: controller.signal,
  // ...
});
```

---

## 🎯 完整实施检查清单

### 准备阶段

- [ ] 注册 Nutritionix 账号
- [ ] 获取 APP_ID 和 API_KEY
- [ ] 配置.env.local 文件
- [ ] 验证环境变量加载

### 开发阶段

- [ ] 创建`/api/food/search/route.js`
- [ ] 实现 API 调用逻辑
- [ ] 添加数据转换函数
- [ ] 前端添加搜索按钮
- [ ] 实现结果展示 UI

### 测试阶段

- [ ] curl 测试 API 端点
- [ ] 浏览器测试前端集成
- [ ] 测试各种食材查询
- [ ] 验证数据准确性
- [ ] 性能测试

### 部署阶段

- [ ] 在 Vercel 添加环境变量
- [ ] 部署到生产环境
- [ ] 验证生产环境 API 调用
- [ ] 监控 API 使用量
- [ ] 设置成本警报

---

## 💡 最佳实践

### 1. 安全

```javascript
// ✅ 正确：在API Route中使用环境变量
const API_KEY = process.env.NUTRITIONIX_API_KEY;

// ❌ 错误：在前端直接调用
// 会暴露API Key！
```

### 2. 性能

```javascript
// ✅ 添加debounce防止频繁请求
const debouncedQuery = useDebounce(searchQuery, 300);

// ✅ 缓存结果
const cache = new Map();
if (cache.has(query)) return cache.get(query);
```

### 3. 用户体验

```javascript
// ✅ 提供明确的loading状态
{
  loading && <LoadingSkeleton />;
}

// ✅ 友好的错误提示
{
  error && <ErrorMessage retry={retrySearch} />;
}

// ✅ 空状态提示
{
  results.length === 0 && <EmptyState />;
}
```

---

## 🚀 快速演示代码

### 最简实现（5 分钟可运行）

```javascript
// app/api/food/demo/route.js
export async function POST(request) {
  const { query } = await request.json();

  // 调用Nutritionix
  const res = await fetch(
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

  const data = await res.json();
  return Response.json(data);
}

// 前端测试
fetch("/api/food/demo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "1 apple" }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

## 📈 下一步建议

### 现在可以：

1. **部署当前 V4.2 版本**

   ```bash
   git add .
   git commit -m "V4.2 + API集成架构方案"
   git push
   ```

2. **在新分支开发 API 功能**

   ```bash
   git checkout -b feature/api-integration
   # 按照本指南实施
   ```

3. **获取 Nutritionix API Key 后立即测试**
   - 注册账号（10 分钟）
   - 配置环境变量
   - 创建 demo API Route
   - 测试调用
   - 验证可行性

---

已创建完整文档：

- [`docs/API-Integration-Architecture.md`](docs/API-Integration-Architecture.md:1) - 架构方案
- [`docs/API-Call-Examples.md`](docs/API-Call-Examples.md:1) - API 调用示例
- [`docs/Implementation-Guide.md`](docs/Implementation-Guide.md:1) - 实施指南

准备好后可以开始实施！
