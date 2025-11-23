# USDA FoodData Central API 集成方案

## 🎯 为什么选择 USDA API

### 核心优势

- ✅ **完全免费**：无需付费，无调用次数限制
- ✅ **官方权威**：美国农业部官方数据
- ✅ **数据质量高**：超过 35 万种食品
- ✅ **无需注册**：直接使用 API Key（公开）

### 劣势

- ⚠️ 仅英文，无中文支持
- ⚠️ 需要多次请求（搜索+详情）
- ⚠️ 响应速度较慢（500-1500ms）
- ⚠️ 接口相对复杂

---

## 📡 USDA API 实际调用代码

### 1. API 配置

```javascript
// USDA API不需要注册，直接使用
const USDA_API_KEY = "DEMO_KEY"; // 或申请正式Key
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// 申请正式Key（推荐）：
// 访问 https://fdc.nal.usda.gov/api-key-signup.html
// 免费获取个人API Key（提高速率限制）
```

### 2. 搜索食材接口

```javascript
// ===== 步骤1：搜索食材 =====

async function searchUSDAFoods(query) {
  const API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`USDA API错误: ${response.status}`);
    }

    const data = await response.json();
    console.log("[USDA] 搜索结果:", data);

    return data;
  } catch (error) {
    console.error("[USDA] 搜索失败:", error);
    throw error;
  }
}

// 实际返回示例
const searchResponse = {
  totalHits: 1752,
  currentPage: 1,
  totalPages: 44,
  foods: [
    {
      fdcId: 171688,
      description: "Apples, raw, with skin",
      dataType: "SR Legacy",
      foodNutrients: [
        {
          nutrientId: 1008,
          nutrientName: "Energy",
          nutrientNumber: "208",
          unitName: "kcal",
          value: 52,
        },
        {
          nutrientId: 1003,
          nutrientName: "Protein",
          unitName: "g",
          value: 0.26,
        },
        {
          nutrientId: 1005,
          nutrientName: "Carbohydrate, by difference",
          unitName: "g",
          value: 13.81,
        },
        {
          nutrientId: 1004,
          nutrientName: "Total lipid (fat)",
          unitName: "g",
          value: 0.17,
        },
      ],
    },
  ],
};
```

### 3. 获取食材详情接口

```javascript
// ===== 步骤2：获取详细营养信息 =====

async function getUSDAFoodDetails(fdcId) {
  const API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USDA API错误: ${response.status}`);
    }

    const data = await response.json();
    console.log("[USDA] 食材详情:", data);

    return data;
  } catch (error) {
    console.error("[USDA] 获取详情失败:", error);
    throw error;
  }
}

// 详情返回示例
const detailsResponse = {
  fdcId: 171688,
  description: "Apples, raw, with skin",
  dataType: "SR Legacy",
  foodNutrients: [
    {
      nutrient: {
        id: 1008,
        name: "Energy",
        unitName: "kcal",
      },
      amount: 52,
    },
    {
      nutrient: {
        id: 1003,
        name: "Protein",
        unitName: "g",
      },
      amount: 0.26,
    },
    // ... 更多营养素
  ],
};
```

---

## 🏗️ Next.js API Route 完整实现

### app/api/food/search-usda/route.js

```javascript
import { NextResponse } from "next/server";

// USDA API配置
const USDA_API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";
const USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

export async function POST(request) {
  try {
    // 1. 获取查询参数
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "查询不能为空" }, { status: 400 });
    }

    console.log(`[USDA API] 搜索食材: ${query}`);

    // 2. 调用USDA搜索API
    const searchUrl = `${USDA_SEARCH_URL}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(
      query
    )}&pageSize=10`;

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      throw new Error(`USDA API错误: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log("[USDA API] 搜索返回:", searchData);

    // 3. 数据标准化转换
    const standardizedFoods = searchData.foods
      .slice(0, 5) // 只取前5个结果
      .map((food, index) => {
        // 提取营养素数据
        const nutrients = extractNutrients(food.foodNutrients);

        return {
          id: `usda_${food.fdcId}`,
          name: translateFoodName(food.description),
          nameEn: food.description,
          emoji: inferEmojiFromDescription(food.description),

          // 营养数据（USDA数据已是per 100g）
          calories: nutrients.calories || 0,
          protein: nutrients.protein || 0,
          carbs: nutrients.carbs || 0,
          fat: nutrients.fat || 0,

          // 其他信息
          price: estimatePrice(food.description),
          primaryUnit: "g",
          defaultQuantity: 100,
          servingSize: 100,
          units: [{ name: "g", rate: 1 }],
          source: "usda",
          fdcId: food.fdcId, // 保存原始ID
        };
      });

    // 4. 返回标准化数据
    return NextResponse.json({
      success: true,
      data: standardizedFoods,
      source: "usda",
      totalHits: searchData.totalHits,
    });
  } catch (error) {
    console.error("[USDA API] 错误:", error);

    return NextResponse.json(
      {
        success: false,
        error: "食材查询失败",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ===== 辅助函数 =====

// 从foodNutrients数组中提取关键营养素
function extractNutrients(foodNutrients) {
  const nutrients = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  foodNutrients.forEach((nutrient) => {
    const name = nutrient.nutrientName.toLowerCase();
    const value = nutrient.value || 0;

    // 热量
    if (name.includes("energy") && nutrient.unitName === "kcal") {
      nutrients.calories = Math.round(value);
    }
    // 蛋白质
    else if (name.includes("protein")) {
      nutrients.protein = parseFloat(value.toFixed(1));
    }
    // 碳水化合物
    else if (name.includes("carbohydrate")) {
      nutrients.carbs = parseFloat(value.toFixed(1));
    }
    // 脂肪
    else if (name.includes("fat") && name.includes("total")) {
      nutrients.fat = parseFloat(value.toFixed(1));
    }
  });

  return nutrients;
}

// 英文描述翻译为中文（简单映射）
function translateFoodName(englishDescription) {
  // 简化处理：提取关键词并翻译
  const desc = englishDescription.toLowerCase();

  const translations = {
    apples: "苹果",
    apple: "苹果",
    bananas: "香蕉",
    banana: "香蕉",
    chicken: "鸡肉",
    beef: "牛肉",
    pork: "猪肉",
    fish: "鱼",
    egg: "鸡蛋",
    milk: "牛奶",
    rice: "米饭",
    bread: "面包",
    tomato: "番茄",
    carrot: "胡萝卜",
    broccoli: "西兰花",
  };

  for (const [en, zh] of Object.entries(translations)) {
    if (desc.includes(en)) {
      return zh;
    }
  }

  // 未匹配到翻译，返回原始描述（简化版）
  return englishDescription
    .replace(/,.*/, "") // 移除逗号后内容
    .substring(0, 20); // 限制长度
}

// 根据描述推断emoji
function inferEmojiFromDescription(description) {
  const desc = description.toLowerCase();

  const emojiMap = {
    apple: "🍎",
    banana: "🍌",
    orange: "🍊",
    grape: "🍇",
    strawberry: "🍓",
    watermelon: "🍉",
    cherry: "🍒",
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
  };

  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (desc.includes(keyword)) return emoji;
  }

  return "🍽️";
}

// 价格估算（基于食材类型）
function estimatePrice(description) {
  const desc = description.toLowerCase();

  if (desc.includes("beef") || desc.includes("salmon")) return 4.5;
  if (desc.includes("chicken") || desc.includes("pork")) return 2.0;
  if (desc.includes("fish")) return 3.5;
  if (desc.includes("vegetable") || desc.includes("lettuce")) return 0.6;
  if (desc.includes("fruit")) return 1.0;

  return 1.0; // 默认价格
}
```

---

## 🔍 完整调用流程示例

### 场景：用户搜索"apple"

```javascript
// ===== 完整的搜索+详情获取流程 =====

async function searchAndGetDetails(foodName) {
  const API_KEY = "DEMO_KEY"; // 或使用你申请的Key

  // 步骤1：搜索食材
  const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${foodName}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  console.log("搜索到食材数量:", searchData.totalHits);
  console.log("第一个结果:", searchData.foods[0]);

  // 步骤2：获取第一个结果的详细信息（可选）
  if (searchData.foods.length > 0) {
    const fdcId = searchData.foods[0].fdcId;
    const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    console.log("详细营养数据:", detailData);

    return {
      search: searchData,
      detail: detailData,
    };
  }

  return { search: searchData };
}

// 使用示例
const result = await searchAndGetDetails("apple");
```

### 实际返回数据

```json
{
  "search": {
    "totalHits": 1752,
    "foods": [
      {
        "fdcId": 171688,
        "description": "Apples, raw, with skin",
        "dataType": "SR Legacy",
        "publicationDate": "2019-04-01",
        "brandOwner": "",
        "foodNutrients": [
          {
            "nutrientId": 1008,
            "nutrientName": "Energy",
            "nutrientNumber": "208",
            "unitName": "kcal",
            "derivationCode": "A",
            "derivationDescription": "Analytical",
            "value": 52
          },
          {
            "nutrientId": 1003,
            "nutrientName": "Protein",
            "unitName": "g",
            "value": 0.26
          },
          {
            "nutrientId": 1005,
            "nutrientName": "Carbohydrate, by difference",
            "unitName": "g",
            "value": 13.81
          },
          {
            "nutrientId": 1004,
            "nutrientName": "Total lipid (fat)",
            "unitName": "g",
            "value": 0.17
          }
        ]
      }
    ]
  }
}
```

---

## 💾 完整 Next.js API Route 实现

### app/api/food/search-usda/route.js

```javascript
import { NextResponse } from "next/server";

const USDA_API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";
const USDA_SEARCH_API = "https://api.nal.usda.gov/fdc/v1/foods/search";

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "查询不能为空" }, { status: 400 });
    }

    console.log(`[USDA API] 搜索: ${query}`);

    // 调用USDA搜索API
    const url = `${USDA_SEARCH_API}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(
      query
    )}&pageSize=10&dataType=Foundation,SR Legacy`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USDA API错误: ${response.status}`);
    }

    const data = await response.json();

    // 数据标准化
    const standardized = data.foods
      .slice(0, 5)
      .map((food) => standardizeUSDAFood(food));

    return NextResponse.json({
      success: true,
      data: standardized,
      source: "usda",
      totalHits: data.totalHits,
    });
  } catch (error) {
    console.error("[USDA API] 错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 数据标准化函数
function standardizeUSDAFood(food) {
  // 提取营养素
  const nutrients = {};

  food.foodNutrients.forEach((n) => {
    const name = n.nutrientName.toLowerCase();

    if (name.includes("energy") && n.unitName === "kcal") {
      nutrients.calories = Math.round(n.value);
    } else if (name === "protein") {
      nutrients.protein = parseFloat(n.value.toFixed(1));
    } else if (name.includes("carbohydrate")) {
      nutrients.carbs = parseFloat(n.value.toFixed(1));
    } else if (name.includes("total lipid")) {
      nutrients.fat = parseFloat(n.value.toFixed(1));
    }
  });

  return {
    id: `usda_${food.fdcId}`,
    name: translateToChineseSimple(food.description),
    nameEn: food.description,
    emoji: inferEmoji(food.description),
    calories: nutrients.calories || 0,
    protein: nutrients.protein || 0,
    carbs: nutrients.carbs || 0,
    fat: nutrients.fat || 0,
    price: 1.0,
    primaryUnit: "g",
    defaultQuantity: 100,
    servingSize: 100,
    units: [{ name: "g", rate: 1 }],
    source: "usda",
    fdcId: food.fdcId,
  };
}

// 简单翻译函数
function translateToChineseSimple(englishDesc) {
  const translations = {
    "apples, raw": "苹果",
    "bananas, raw": "香蕉",
    "chicken, broilers or fryers, breast": "鸡胸肉",
    "beef, ground": "牛肉",
    "egg, whole": "鸡蛋",
    "milk, whole": "全脂牛奶",
    "rice, white": "白米饭",
    "bread, white": "白面包",
  };

  const desc = englishDesc.toLowerCase();

  for (const [en, zh] of Object.entries(translations)) {
    if (desc.includes(en)) {
      return zh;
    }
  }

  // 简化处理：只返回主要部分
  return englishDesc.split(",")[0].trim();
}

// Emoji推断
function inferEmoji(description) {
  const desc = description.toLowerCase();
  const map = {
    apple: "🍎",
    banana: "🍌",
    orange: "🍊",
    chicken: "🍗",
    beef: "🥩",
    pork: "🥓",
    egg: "🥚",
    milk: "🥛",
    rice: "🍚",
    bread: "🍞",
    tomato: "🍅",
    carrot: "🥕",
  };

  for (const [key, emoji] of Object.entries(map)) {
    if (desc.includes(key)) return emoji;
  }

  return "🍽️";
}
```

---

## 🖥️ 前端调用示例

### components/CalorieCalculator.js

```javascript
// 添加USDA在线搜索功能

const [usdaResults, setUsdaResults] = useState([]);
const [usdaLoading, setUsdaLoading] = useState(false);

async function searchUSDAOnline(query) {
  setUsdaLoading(true);

  try {
    const response = await fetch("/api/food/search-usda", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.success) {
      setUsdaResults(result.data);
      console.log("从USDA获取到食材:", result.data);
    } else {
      console.error("USDA API错误:", result.error);
      alert("搜索失败：" + result.error);
    }
  } catch (error) {
    console.error("请求失败:", error);
    alert("网络错误，请检查连接");
  } finally {
    setUsdaLoading(false);
  }
}

// UI按钮
<button
  onClick={() => searchUSDAOnline(searchQuery)}
  disabled={usdaLoading || !searchQuery}
  className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
>
  {usdaLoading ? (
    <>
      <Loader2 className="animate-spin inline mr-2" size={16} />
      正在从USDA数据库搜索...
    </>
  ) : (
    <>🌐 在线搜索（USDA权威数据库）</>
  )}
</button>;

// 显示结果
{
  usdaResults.length > 0 && (
    <div className="mt-6 p-4 bg-green-50 rounded-2xl border-2 border-green-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-green-700">
          USDA官方数据库结果
        </span>
        <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
          权威
        </span>
      </div>

      <div className="space-y-2">
        {usdaResults.map((food) => (
          <div
            key={food.id}
            className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all"
            onClick={() => addFood(food)}
          >
            <span className="text-2xl">{food.emoji}</span>
            <div className="flex-1">
              <div className="font-semibold text-text-primary">{food.name}</div>
              <div className="text-xs text-gray-500">{food.nameEn}</div>
              <div className="text-xs text-green-600 mt-1">
                {food.calories} kcal · P: {food.protein}g · C: {food.carbs}g ·
                F: {food.fat}g
              </div>
            </div>
            <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
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

## 🧪 测试指南

### 测试 1：直接测试 USDA API

```bash
# 使用curl测试USDA API（无需认证）
curl "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=apple"

# 应该返回JSON数据
```

### 测试 2：测试 Next.js API Route

```bash
# 启动开发服务器
npm run dev

# 测试API端点
curl -X POST http://localhost:3000/api/food/search-usda \
  -H "Content-Type: application/json" \
  -d '{"query":"apple"}'

# 应该返回标准化的食材数据
```

### 测试 3：浏览器测试

```javascript
// 在浏览器控制台运行
fetch("/api/food/search-usda", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "chicken breast" }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("搜索结果:", data);
    console.log("第一个食材:", data.data[0]);
  });
```

---

## 📊 USDA vs Nutritionix 对比

| 特性         | USDA API | Nutritionix API |
| ------------ | -------- | --------------- |
| **成本**     | 免费 ✅  | $69/月          |
| **数据量**   | 35 万+   | 90 万+          |
| **中文支持** | 无 ⚠️    | 部分支持        |
| **响应速度** | 慢(1-2s) | 快(<500ms)      |
| **自然语言** | 否       | 是 ✅           |
| **易用性**   | 复杂     | 简单 ✅         |
| **权威性**   | 官方 ✅  | 商业            |
| **注册要求** | 可选     | 必须            |

### 推荐策略

**混合方案**（最佳）：

1. 本地静态数据库（常见 110 种）
2. USDA API（免费扩展）
3. 用户贡献数据（众包）

---

## 🚀 快速开始（10 分钟）

### 第 1 步：创建 API 文件

```bash
mkdir -p app/api/food/search-usda
touch app/api/food/search-usda/route.js
```

### 第 2 步：复制粘贴代码

将上面的完整 API Route 代码粘贴到`route.js`

### 第 3 步：测试

```bash
# 启动服务器
npm run dev

# 在浏览器打开
http://localhost:3000

# 控制台测试
fetch('/api/food/search-usda', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({query: 'apple'})
}).then(r => r.json()).then(console.log)
```

### 第 4 步：验证

- ✅ 看到返回数据
- ✅ 数据格式正确
- ✅ 营养值合理
- ✅ emoji 显示正确

### 第 5 步：前端集成

在[`components/CalorieCalculator.js`](components/CalorieCalculator.js:1)中添加调用代码

---

## 🎯 优化建议

### 1. 翻译增强

```javascript
// 使用百度翻译API或谷歌翻译API
async function translateEnglishToChinese(text) {
  const res = await fetch("/api/translate", {
    method: "POST",
    body: JSON.stringify({ text, from: "en", to: "zh" }),
  });
  return res.json();
}
```

### 2. 缓存策略

```javascript
// 使用Map缓存搜索结果
const cache = new Map();

if (cache.has(query)) {
  return cache.get(query);
}

const results = await searchUSDA(query);
cache.set(query, results);

// 限制缓存大小
if (cache.size > 100) {
  const firstKey = cache.keys().next().value;
  cache.delete(firstKey);
}
```

### 3. 性能优化

```javascript
// 并发请求优化
const promises = fdcIds.map((id) => getDetails(id));
const details = await Promise.all(promises);

// 请求超时控制
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

fetch(url, { signal: controller.signal });
```

---

## 📝 环境配置

### .env.local

```bash
# USDA API配置（可选，使用DEMO_KEY或申请正式Key）
USDA_API_KEY=DEMO_KEY

# 或申请正式Key：
# 访问 https://fdc.nal.usda.gov/api-key-signup.html
# 填写信息获取免费的正式API Key
# USDA_API_KEY=你申请的KEY
```

### vercel.json（生产环境）

```json
{
  "env": {
    "USDA_API_KEY": "@usda-api-key"
  }
}
```

在 Vercel Dashboard 配置：

```
Settings → Environment Variables
Name: USDA_API_KEY
Value: 你的API_KEY
```

---

## 🎉 优势总结

### 为什么选择 USDA

1. **零成本** - 完全免费，无需信用卡
2. **权威可靠** - 美国农业部官方数据
3. **无限调用** - 没有次数限制
4. **数据丰富** - 35 万+种食品
5. **开源友好** - 适合开源项目

### 完整方案优势

✅ 从 110 种 → 35 万+种食材  
✅ 零额外成本  
✅ 权威营养数据  
✅ 可立即开始使用（DEMO_KEY）  
✅ 简单易集成

---

## 下一步：立即实施

现在可以：

1. **复制粘贴代码**：直接使用本文档中的代码
2. **立即测试**：使用 DEMO_KEY 无需注册
3. **快速验证**：10 分钟完成集成
4. **生产部署**：申请正式 Key 后部署

已准备好所有代码，可以立即开始！
