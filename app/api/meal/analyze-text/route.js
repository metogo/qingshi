import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const openai = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const runtime = 'edge';

// 本地食材数据库（简化版，用于快速匹配）
const localFoodsDB = [
  { id: 1, name: '糙米饭', emoji: '🍚', calories: 111, protein: 2.6, carbs: 24, fat: 0.8, price: 0.4, servingSize: 150, primaryUnit: 'g' },
  { id: 2, name: '白米饭', emoji: '🍙', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3, price: 0.3, servingSize: 150, primaryUnit: 'g' },
  { id: 3, name: '全麦面包', emoji: '🍞', calories: 246, protein: 9, carbs: 48, fat: 3.4, price: 1.5, servingSize: 35, primaryUnit: '片' },
  { id: 28, name: '鸡蛋', emoji: '🥚', calories: 144, protein: 13.3, carbs: 2.8, fat: 8.8, price: 1.2, servingSize: 50, primaryUnit: '个' },
  { id: 109, name: '牛奶', emoji: '🥛', calories: 54, protein: 3.2, carbs: 5, fat: 3.2, price: 1.0, servingSize: 250, primaryUnit: 'ml' },
  { id: 21, name: '鸡胸肉', emoji: '🍗', calories: 133, protein: 24.6, carbs: 2.5, fat: 5, price: 1.8, servingSize: 100, primaryUnit: 'g' },
  { id: 43, name: '番茄', emoji: '🍅', calories: 15, protein: 0.9, carbs: 3.3, fat: 0.2, price: 0.6, servingSize: 150, primaryUnit: '个' },
  { id: 41, name: '西兰花', emoji: '🥦', calories: 36, protein: 4.1, carbs: 4.9, fat: 0.6, price: 0.8, servingSize: 100, primaryUnit: 'g' },
  { id: 61, name: '苹果', emoji: '🍎', calories: 54, protein: 0.4, carbs: 13.8, fat: 0.2, price: 0.8, servingSize: 200, primaryUnit: '个' },
  { id: 62, name: '香蕉', emoji: '🍌', calories: 93, protein: 1.4, carbs: 23, fat: 0.2, price: 0.6, servingSize: 120, primaryUnit: '根' },
];

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query) {
      return Response.json({ error: '请描述您的餐食' }, { status: 400 });
    }

    console.log('[对话分析] 用户输入:', query);

    // ===== 阶段1：AI提取食物实体 =====
    const extractPrompt = `你是食物记录解析助手。从以下句子中提取所有食物、数量和单位。

用户输入："${query}"

要求：
1. 识别所有食物名称（中文）
2. 提取数量（如果没说明默认为1）
3. 识别单位（个、片、根、碗、杯、克、g、ml等）
4. "一些"、"少许"等转换为100

以JSON数组返回，只返回JSON，不要其他文字：
[{"foodName":"鸡蛋","quantity":2,"unit":"个"}]`;

    const extractResult = await generateText({
      model: openai('google/gemini-2.5-pro'),
      prompt: extractPrompt,
    });

    console.log('[阶段1] AI返回:', extractResult.text);

    // 解析JSON
    let extractedFoods = [];
    try {
      const jsonMatch = extractResult.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedFoods = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON解析失败:', e);
      return Response.json({ error: '无法识别食材，请换个描述方式' }, { status: 400 });
    }

    console.log('[阶段1] 提取的食物:', extractedFoods);

    // ===== 阶段2：智能营养数据丰富（本地 + AI混合） =====
    const enrichedFoods = await Promise.all(extractedFoods.map(async (item) => {
      // 步骤1：优先查询本地数据库
      const localFood = localFoodsDB.find(f =>
        f.name.includes(item.foodName) ||
        item.foodName.includes(f.name) ||
        item.foodName.replace(/煮|蒸|炒|炸|烤/, '').includes(f.name)
      );

      if (localFood) {
        // 找到本地数据 - 使用精确营养值 ✅
        const grams = calculateGrams(item.quantity, item.unit, localFood);
        console.log(`[本地匹配] ${item.foodName} → ${localFood.name} ✅`);
        
        return {
          ...localFood,
          amount: item.quantity,
          currentUnit: item.unit,
          gramsAmount: grams,
          units: [
            { name: 'g', rate: 1 },
            { name: localFood.primaryUnit, rate: localFood.servingSize }
          ],
          key: Date.now() + Math.random(),
          source: 'local'
        };
      } else {
        // 步骤2：未找到 - AI智能估算营养数据 🤖
        console.log(`[AI估算] ${item.foodName} - 本地库无数据，AI智能推断`);
        
        try {
          const aiNutrition = await estimateNutritionWithAI(item, openai);
          return aiNutrition;
        } catch (error) {
          console.error(`[AI估算失败] ${item.foodName}:`, error);
          // 降级：返回通用估算
          return createFallbackFood(item);
        }
      }
    }));

    console.log('[阶段2] 丰富后的数据:', enrichedFoods);

    // ===== 阶段3：汇总计算 =====
    const totals = enrichedFoods.reduce((sum, food) => ({
      calories: sum.calories + (food.calories * food.gramsAmount / 100),
      protein: sum.protein + (food.protein * food.gramsAmount / 100),
      carbs: sum.carbs + (food.carbs * food.gramsAmount / 100),
      fat: sum.fat + (food.fat * food.gramsAmount / 100),
      price: sum.price + (food.price * food.gramsAmount / 100)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 });

    console.log('[阶段3] 营养汇总:', totals);

    // ===== 阶段4：AI营养师分析 =====
    const foodList = enrichedFoods.map(f => `${f.name} ${f.amount}${f.currentUnit}`).join('、');

    const analysisPrompt = `你是专业营养师。分析以下餐食：

用户描述："${query}"

识别出的食物：${foodList}

营养汇总：
- 总热量：${Math.round(totals.calories)} kcal
- 蛋白质：${totals.protein.toFixed(1)} g
- 碳水化合物：${totals.carbs.toFixed(1)} g
- 脂肪：${totals.fat.toFixed(1)} g

请提供详细的营养分析报告，使用Markdown格式，包括：

### 🥗 总体评价
[一句话总结]

### ✅ 优点分析
* [优点1]
* [优点2]

### 💡 改进建议
* [建议1]
* [建议2]

### 👥 适用人群
[适合的人群]

语气要专业、友好、鼓励。`;

    const analysisResult = await generateText({
      model: openai('google/gemini-2.5-pro'),
      prompt: analysisPrompt,
    });

    console.log('[阶段4] 分析报告:', analysisResult.text);

    // ===== 返回完整结果 =====
    return Response.json({
      success: true,
      foods: enrichedFoods,
      totals: totals,
      analysis: analysisResult.text,
      originalQuery: query
    });

  } catch (error) {
    console.error('[对话分析] 错误:', error);
    return Response.json({
      success: false,
      error: '分析失败',
      message: error.message
    }, { status: 500 });
  }
}

// ===== AI智能估算营养数据（核心创新功能）=====
async function estimateNutritionWithAI(foodItem, openaiClient) {
  const prompt = `你是营养学专家。请估算以下食物的营养成分（每100克/100ml）：

食物名称：${foodItem.foodName}
用户说的量：${foodItem.quantity}${foodItem.unit}

请以JSON格式返回，只返回JSON不要其他文字：
{
  "calories": 每100克的热量数字(如52),
  "protein": 蛋白质克数(如0.3),
  "carbs": 碳水克数(如13.8),
  "fat": 脂肪克数(如0.2),
  "emoji": "最合适的emoji（如🍎）",
  "estimatedGrams": ${foodItem.quantity}${foodItem.unit}对应的估算总克数,
  "servingSize": 一份的克数（如苹果一个约200g）
}`;

  try {
    const result = await generateText({
      model: openaiClient('google/gemini-2.5-pro'),
      prompt: prompt,
    });

    console.log('[AI估算原始返回]:', result.text);

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const nutrition = JSON.parse(jsonMatch[0]);
      
      return {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: foodItem.foodName,
        emoji: nutrition.emoji || '🍽️',
        calories: parseFloat(nutrition.calories) || 100,
        protein: parseFloat(nutrition.protein) || 5,
        carbs: parseFloat(nutrition.carbs) || 15,
        fat: parseFloat(nutrition.fat) || 3,
        price: 1.0,
        amount: foodItem.quantity,
        currentUnit: foodItem.unit,
        gramsAmount: nutrition.estimatedGrams || (foodItem.quantity * 100),
        primaryUnit: foodItem.unit,
        servingSize: nutrition.servingSize || 100,
        units: [
          { name: 'g', rate: 1 },
          { name: foodItem.unit, rate: nutrition.servingSize || 100 }
        ],
        key: Date.now() + Math.random(),
        source: 'ai-estimated'
      };
    }
  } catch (error) {
    console.error('[AI估算异常]:', error);
    throw error;
  }
}

// 降级方案：创建通用估算食材
function createFallbackFood(item) {
  return {
    id: `fallback_${Date.now()}`,
    name: item.foodName,
    emoji: '🍽️',
    calories: 100,
    protein: 5,
    carbs: 15,
    fat: 3,
    price: 1.0,
    amount: item.quantity,
    currentUnit: item.unit,
    gramsAmount: item.quantity * 100,
    primaryUnit: item.unit,
    servingSize: 100,
    units: [{ name: 'g', rate: 1 }],
    key: Date.now() + Math.random(),
    source: 'fallback'
  };
}

// 辅助函数：计算克数
function calculateGrams(quantity, unit, foodData) {
  const unitRates = {
    '个': foodData.servingSize || 50,
    '片': foodData.servingSize || 35,
    '根': foodData.servingSize || 100,
    '碗': 150,
    '杯': 250,
    '勺': 15,
    'g': 1,
    '克': 1,
    'ml': 1,
    '毫升': 1
  };

  return quantity * (unitRates[unit] || 100);
}