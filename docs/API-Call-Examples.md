# 食物营养数据 API 调用实战示例

## 📡 Nutritionix API 实际调用代码

### 1. 完整的 API 调用示例

```javascript
// ===== Nutritionix API 自然语言查询 =====

async function queryNutritionix(foodQuery) {
  const API_ENDPOINT = "https://trackapi.nutritionix.com/v2/natural/nutrients";
  const APP_ID = "YOUR_APP_ID"; // 从Nutritionix获取
  const API_KEY = "YOUR_API_KEY"; // 从Nutritionix获取

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": APP_ID,
        "x-app-key": API_KEY,
      },
      body: JSON.stringify({
        query: foodQuery, // 例如："1个苹果" 或 "100克鸡胸肉"
        timezone: "Asia/Shanghai",
        locale: "zh_CN",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Nutritionix返回数据:", data);
    return data;
  } catch (error) {
    console.error("API调用失败:", error);
    throw error;
  }
}

// 使用示例
const result = await queryNutritionix("一个苹果");
```

### 2. 实际返回数据示例

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
      "nf_potassium": 194.74,
      "nf_p": 20.02,
      "full_nutrients": [
        { "attr_id": 203, "value": 0.47 },
        { "attr_id": 204, "value": 0.31 },
        { "attr_id": 205, "value": 25.13 }
      ],
      "tags": {
        "item": "apple",
        "measure": "medium",
        "quantity": "1.0",
        "food_group": 9,
        "tag_id": 1234
      },
      "photo": {
        "thumb": "https://d2xdmhkmkbyw75.cloudfront.net/123_thumb.jpg",
        "highres": "https://d2xdmhkmkbyw75.cloudfront.net/123_highres.jpg"
      }
    }
  ]
}
```

### 3. 搜索 API 调用示例

```javascript
// ===== Nutritionix 搜索API（即时搜索） =====

async function searchNutritionixInstant(searchTerm) {
  const SEARCH_ENDPOINT = "https://trackapi.nutritionix.com/v2/search/instant";

  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.append("query", searchTerm);

  const response = await fetch(url, {
    headers: {
      "x-app-id": "YOUR_APP_ID",
      "x-app-key": "YOUR_API_KEY",
    },
  });

  const data = await response.json();
  return data;
}

// 返回数据示例
const searchResult = {
  common: [
    {
      food_name: "apple",
      serving_unit: 'medium (3" dia)',
      tag_name: "apple",
      serving_qty: 1,
      common_type: null,
      tag_id: "152",
      photo: {
        thumb: "https://d2xdmhkmkbyw75.cloudfront.net/152_thumb.jpg",
      },
      locale: "en_US",
    },
  ],
  branded: [],
};
```

---

## 🔧 Next.js API Route 完整实现

### app/api/food/search/route.js

```javascript
import { NextResponse } from "next/server";

// Nutritionix配置
const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;
const NUTRITIONIX_API = "https://trackapi.nutritionix.com/v2/natural/nutrients";

export async function GET(request) {
  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "查询参数不能为空" }, { status: 400 });
  }

  console.log(`[API] 搜索食材: ${query}`);

  try {
    // 步骤1：调用Nutritionix API
    const response = await fetch(NUTRITIONIX_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": NUTRITIONIX_APP_ID,
        "x-app-key": NUTRITIONIX_API_KEY,
      },
      body: JSON.stringify({
        query: query,
        timezone: "Asia/Shanghai",
        locale: "zh_CN",
      }),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const nutritionixData = await response.json();
    console.log("[API] Nutritionix返回:", nutritionixData);

    // 步骤2：转换为我们的标准格式
    const standardizedData = nutritionixData.foods.map((food) => ({
      id: `api_${Date.now()}_${Math.random()}`,
      name: translateFoodName(food.food_name), // 中文翻译
      nameEn: food.food_name,
      emoji: inferEmoji(food.food_name),
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
      price: 1.0, // 默认价格，后续可优化
      primaryUnit: normalizeUnit(food.serving_unit),
      defaultQuantity: food.serving_qty,
      servingSize: food.serving_weight_grams,
      units: [
        { name: "g", rate: 1 },
        {
          name: normalizeUnit(food.serving_unit),
          rate: food.serving_weight_grams,
        },
      ],
      source: "nutritionix",
      photo: food.photo?.thumb,
    }));

    // 步骤3：返回标准化数据
    return NextResponse.json({
      source: "api",
      data: standardizedData,
      count: standardizedData.length,
    });
  } catch (error) {
    console.error("[API] 查询失败:", error);

    return NextResponse.json(
      {
        error: "食材查询失败",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// 辅助函数
function normalizeUnit(unit) {
  const unitMap = {
    medium: "个",
    large: "个",
    small: "个",
    cup: "杯",
    tablespoon: "勺",
    gram: "g",
    oz: "g",
  };
  return unitMap[unit] || "g";
}

function inferEmoji(foodName) {
  const name = foodName.toLowerCase();
  const emojiMap = {
    apple: "🍎",
    banana: "🍌",
    orange: "🍊",
    chicken: "🍗",
    beef: "🥩",
    fish: "🐟",
    egg: "🥚",
    milk: "🥛",
    cheese: "🧀",
    rice: "🍚",
    bread: "🍞",
    pasta: "🍝",
    tomato: "🍅",
    carrot: "🥕",
    broccoli: "🥦",
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (name.includes(key)) return emoji;
  }
  return "🍽️";
}

function translateFoodName(englishName) {
  // 简单翻译映射（实际可接入翻译API）
  const translations = {
    apple: "苹果",
    banana: "香蕉",
    "chicken breast": "鸡胸肉",
    "white rice": "白米饭",
    egg: "鸡蛋",
  };
  return translations[englishName.toLowerCase()] || englishName;
}
```

#### 核心代码结构（带缓存）

```javascript
// app/api/food/search/route.js（完整版）
=======
</diff>
</apply_diff>
```
