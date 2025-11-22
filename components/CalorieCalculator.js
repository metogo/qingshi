'use client'

import React, { useState, useMemo } from 'react'
import { Plus, X, Info, Sparkles, Loader2, Search } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Fuse from 'fuse.js'
import { pinyin } from 'pinyin-pro'

// 轻食食材数据库（每100g的热量和价格，价格参考北京市场）
const foodDatabase = {
    主食: [
        { id: 1, name: '糙米饭', calories: 111, unit: '100g', protein: 2.6, carbs: 24, fat: 0.8, price: 0.4 },
        { id: 2, name: '白米饭', calories: 116, unit: '100g', protein: 2.6, carbs: 25.6, fat: 0.3, price: 0.3 },
        { id: 3, name: '全麦面包', calories: 246, unit: '100g', protein: 9, carbs: 48, fat: 3.4, price: 1.5 },
        { id: 4, name: '燕麦', calories: 367, unit: '100g', protein: 12.5, carbs: 61, fat: 7.2, price: 1.2 },
        { id: 5, name: '紫薯', calories: 82, unit: '100g', protein: 1.6, carbs: 18.3, fat: 0.2, price: 0.6 },
        { id: 6, name: '红薯', calories: 90, unit: '100g', protein: 1.6, carbs: 20.1, fat: 0.2, price: 0.5 },
        { id: 7, name: '玉米', calories: 112, unit: '100g', protein: 4, carbs: 23, fat: 1.2, price: 0.8 },
        { id: 8, name: '藜麦', calories: 120, unit: '100g', protein: 4.4, carbs: 21.3, fat: 1.9, price: 2.5 },
        { id: 9, name: '意大利面', calories: 131, unit: '100g', protein: 5, carbs: 25, fat: 1.1, price: 1.8 },
        { id: 10, name: '荞麦面', calories: 343, unit: '100g', protein: 13.3, carbs: 71.5, fat: 3.4, price: 1.6 },
        { id: 11, name: '土豆', calories: 77, unit: '100g', protein: 2, carbs: 17.5, fat: 0.1, price: 0.4 },
        { id: 12, name: '全麦吐司', calories: 265, unit: '100g', protein: 11, carbs: 50, fat: 3.5, price: 1.8 },
    ],
    蛋白质: [
        { id: 21, name: '鸡胸肉', calories: 133, unit: '100g', protein: 24.6, carbs: 2.5, fat: 5, price: 1.8 },
        { id: 22, name: '鸡腿肉', calories: 181, unit: '100g', protein: 18.4, carbs: 0, fat: 12, price: 1.5 },
        { id: 23, name: '牛肉', calories: 250, unit: '100g', protein: 26, carbs: 0, fat: 15, price: 4.5 },
        { id: 24, name: '瘦猪肉', calories: 143, unit: '100g', protein: 20.3, carbs: 1.5, fat: 6.2, price: 2.0 },
        { id: 25, name: '三文鱼', calories: 139, unit: '100g', protein: 20, carbs: 0, fat: 6.3, price: 6.8 },
        { id: 26, name: '金枪鱼', calories: 132, unit: '100g', protein: 23.3, carbs: 0, fat: 4.9, price: 5.5 },
        { id: 27, name: '鳕鱼', calories: 82, unit: '100g', protein: 17.8, carbs: 0, fat: 0.7, price: 4.2 },
        { id: 28, name: '鸡蛋', calories: 144, unit: '100g', protein: 13.3, carbs: 2.8, fat: 8.8, price: 1.2 },
        { id: 29, name: '豆腐', calories: 81, unit: '100g', protein: 8.1, carbs: 4.2, fat: 3.7, price: 0.6 },
        { id: 30, name: '虾仁', calories: 87, unit: '100g', protein: 18.6, carbs: 2.8, fat: 0.6, price: 5.0 },
        { id: 31, name: '扇贝', calories: 69, unit: '100g', protein: 12.3, carbs: 3.2, fat: 0.8, price: 6.5 },
        { id: 32, name: '鸭胸肉', calories: 201, unit: '100g', protein: 18.3, carbs: 0, fat: 14, price: 2.8 },
        { id: 33, name: '火鸡胸', calories: 104, unit: '100g', protein: 21.9, carbs: 0, fat: 1.7, price: 3.2 },
        { id: 34, name: '豆腐干', calories: 140, unit: '100g', protein: 17, carbs: 4.9, fat: 5.8, price: 0.8 },
    ],
    蔬菜: [
        { id: 41, name: '西兰花', calories: 36, unit: '100g', protein: 4.1, carbs: 4.9, fat: 0.6, price: 0.8 },
        { id: 42, name: '生菜', calories: 13, unit: '100g', protein: 1.3, carbs: 2.1, fat: 0.3, price: 0.5 },
        { id: 43, name: '番茄', calories: 15, unit: '100g', protein: 0.9, carbs: 3.3, fat: 0.2, price: 0.6 },
        { id: 44, name: '黄瓜', calories: 15, unit: '100g', protein: 0.8, carbs: 3.6, fat: 0.1, price: 0.4 },
        { id: 45, name: '胡萝卜', calories: 25, unit: '100g', protein: 1, carbs: 6, fat: 0.2, price: 0.4 },
        { id: 46, name: '菠菜', calories: 28, unit: '100g', protein: 2.6, carbs: 4.5, fat: 0.3, price: 0.6 },
        { id: 47, name: '芦笋', calories: 20, unit: '100g', protein: 2.2, carbs: 3.9, fat: 0.1, price: 1.2 },
        { id: 48, name: '青椒', calories: 20, unit: '100g', protein: 0.9, carbs: 4.6, fat: 0.2, price: 0.5 },
        { id: 49, name: '红椒', calories: 26, unit: '100g', protein: 1, carbs: 6, fat: 0.3, price: 0.7 },
        { id: 50, name: '茄子', calories: 21, unit: '100g', protein: 1.1, carbs: 4.7, fat: 0.2, price: 0.5 },
        { id: 51, name: '洋葱', calories: 39, unit: '100g', protein: 1.2, carbs: 9, fat: 0.1, price: 0.4 },
        { id: 52, name: '蘑菇', calories: 22, unit: '100g', protein: 3.1, carbs: 3.3, fat: 0.3, price: 1.0 },
        { id: 53, name: '芹菜', calories: 12, unit: '100g', protein: 0.7, carbs: 2.4, fat: 0.1, price: 0.4 },
        { id: 54, name: '白菜', calories: 13, unit: '100g', protein: 1.5, carbs: 2.2, fat: 0.2, price: 0.3 },
        { id: 55, name: '花菜', calories: 24, unit: '100g', protein: 1.9, carbs: 4.9, fat: 0.3, price: 0.7 },
        { id: 56, name: '秋葵', calories: 33, unit: '100g', protein: 2, carbs: 7.5, fat: 0.2, price: 1.5 },
    ],
    水果: [
        { id: 61, name: '苹果', calories: 54, unit: '100g', protein: 0.4, carbs: 13.8, fat: 0.2, price: 0.8 },
        { id: 62, name: '香蕉', calories: 93, unit: '100g', protein: 1.4, carbs: 23, fat: 0.2, price: 0.6 },
        { id: 63, name: '蓝莓', calories: 57, unit: '100g', protein: 0.7, carbs: 14.5, fat: 0.3, price: 4.0 },
        { id: 64, name: '草莓', calories: 30, unit: '100g', protein: 1, carbs: 7.7, fat: 0.2, price: 2.0 },
        { id: 65, name: '奇异果', calories: 56, unit: '100g', protein: 1.1, carbs: 14.7, fat: 0.5, price: 1.5 },
        { id: 66, name: '橙子', calories: 43, unit: '100g', protein: 0.9, carbs: 11.8, fat: 0.1, price: 0.8 },
        { id: 67, name: '葡萄', calories: 69, unit: '100g', protein: 0.6, carbs: 18.1, fat: 0.2, price: 1.5 },
        { id: 68, name: '西瓜', calories: 30, unit: '100g', protein: 0.6, carbs: 7.6, fat: 0.2, price: 0.4 },
        { id: 69, name: '芒果', calories: 60, unit: '100g', protein: 0.8, carbs: 15, fat: 0.4, price: 1.2 },
        { id: 70, name: '火龙果', calories: 51, unit: '100g', protein: 1.1, carbs: 13.3, fat: 0.2, price: 1.0 },
        { id: 71, name: '樱桃', calories: 50, unit: '100g', protein: 1, carbs: 12.2, fat: 0.3, price: 3.5 },
        { id: 72, name: '梨', calories: 44, unit: '100g', protein: 0.4, carbs: 11.3, fat: 0.1, price: 0.7 },
        { id: 73, name: '桃子', calories: 42, unit: '100g', protein: 0.9, carbs: 10.9, fat: 0.3, price: 1.0 },
        { id: 74, name: '柚子', calories: 33, unit: '100g', protein: 0.7, carbs: 8.6, fat: 0.1, price: 0.6 },
    ],
    酱料: [
        { id: 81, name: '橄榄油', calories: 884, unit: '100g', protein: 0, carbs: 0, fat: 100, price: 3.5 },
        { id: 82, name: '芝麻油', calories: 898, unit: '100g', protein: 0, carbs: 0, fat: 99.9, price: 2.8 },
        { id: 83, name: '酱油', calories: 60, unit: '100g', protein: 5.6, carbs: 8.1, fat: 0.1, price: 0.8 },
        { id: 84, name: '醋', calories: 18, unit: '100g', protein: 0.3, carbs: 3.9, fat: 0, price: 0.6 },
        { id: 85, name: '番茄酱', calories: 101, unit: '100g', protein: 1.8, carbs: 25, fat: 0.2, price: 1.2 },
        { id: 86, name: '沙拉酱', calories: 629, unit: '100g', protein: 1.3, carbs: 9.4, fat: 67, price: 2.5 },
        { id: 87, name: '蛋黄酱', calories: 680, unit: '100g', protein: 1.1, carbs: 2.7, fat: 75, price: 2.8 },
        { id: 88, name: '芝麻酱', calories: 618, unit: '100g', protein: 20.3, carbs: 22.7, fat: 52.7, price: 3.0 },
        { id: 89, name: '蜂蜜', calories: 304, unit: '100g', protein: 0.3, carbs: 82.4, fat: 0, price: 4.5 },
        { id: 90, name: '黑胡椒', calories: 255, unit: '100g', protein: 10.4, carbs: 64.8, fat: 3.3, price: 5.0 },
        { id: 91, name: '盐', calories: 0, unit: '100g', protein: 0, carbs: 0, fat: 0, price: 0.2 },
        { id: 92, name: '柠檬汁', calories: 22, unit: '100g', protein: 0.4, carbs: 6.9, fat: 0.2, price: 1.5 },
    ],
    其他: [
        { id: 101, name: '牛油果', calories: 171, unit: '100g', protein: 2, carbs: 8.6, fat: 15.3, price: 3.5 },
        { id: 102, name: '杏仁', calories: 579, unit: '100g', protein: 21.2, carbs: 21.6, fat: 49.9, price: 5.8 },
        { id: 103, name: '核桃', calories: 654, unit: '100g', protein: 15.2, carbs: 13.7, fat: 65.2, price: 6.5 },
        { id: 104, name: '腰果', calories: 553, unit: '100g', protein: 18.2, carbs: 30.2, fat: 43.9, price: 5.5 },
        { id: 105, name: '花生', calories: 567, unit: '100g', protein: 25.8, carbs: 16.1, fat: 49.2, price: 3.0 },
        { id: 106, name: '酸奶', calories: 72, unit: '100g', protein: 3.5, carbs: 5, fat: 3.3, price: 1.2 },
        { id: 107, name: '希腊酸奶', calories: 97, unit: '100g', protein: 10.2, carbs: 3.6, fat: 4.5, price: 2.5 },
        { id: 108, name: '奶酪', calories: 353, unit: '100g', protein: 22.9, carbs: 3.1, fat: 28.2, price: 4.8 },
        { id: 109, name: '牛奶', calories: 54, unit: '100g', protein: 3.2, carbs: 5, fat: 3.2, price: 1.0 },
        { id: 110, name: '豆浆', calories: 54, unit: '100g', protein: 3, carbs: 1.1, fat: 1.8, price: 0.8 },
    ]
};

export default function CalorieCalculator() {
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [activeCategory, setActiveCategory] = useState('主食');
    const [searchQuery, setSearchQuery] = useState('');

    // 添加食材到已选列表
    const addFood = (food) => {
        setSelectedFoods([...selectedFoods, { ...food, amount: 100, key: Date.now() }]);
    };

    // 移除食材
    const removeFood = (key) => {
        setSelectedFoods(selectedFoods.filter(f => f.key !== key));
    };

    // 更新食材份量
    const updateAmount = (key, amount) => {
        setSelectedFoods(selectedFoods.map(f =>
            f.key === key ? { ...f, amount: parseInt(amount) || 0 } : f
        ));
    };

    // 计算总营养和价格
    const calculateTotals = () => {
        return selectedFoods.reduce((totals, food) => {
            const ratio = food.amount / 100;
            return {
                calories: totals.calories + (food.calories * ratio),
                protein: totals.protein + (food.protein * ratio),
                carbs: totals.carbs + (food.carbs * ratio),
                fat: totals.fat + (food.fat * ratio),
                price: totals.price + (food.price * ratio)
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 });
    };

    const totals = calculateTotals();

    // 搜索功能：准备所有食材数据
    const allFoods = useMemo(() => {
        const foods = [];
        Object.entries(foodDatabase).forEach(([category, items]) => {
            items.forEach(item => {
                // 为每个食材添加拼音信息用于搜索
                const pinyinFull = pinyin(item.name, { toneType: 'none' }).replace(/\s/g, '');
                const pinyinInitials = pinyin(item.name, { pattern: 'first', toneType: 'none' }).replace(/\s/g, '');
                
                foods.push({
                    ...item,
                    category,
                    pinyinFull,
                    pinyinInitials
                });
            });
        });
        return foods;
    }, []);

    // 配置 Fuse.js 搜索
    const fuse = useMemo(() => {
        return new Fuse(allFoods, {
            keys: [
                { name: 'name', weight: 2 },
                { name: 'pinyinFull', weight: 1.5 },
                { name: 'pinyinInitials', weight: 1 }
            ],
            threshold: 0.3, // 容错率
            includeScore: true,
        });
    }, [allFoods]);

    // 根据搜索查询过滤食材
    const displayFoods = useMemo(() => {
        if (!searchQuery.trim()) {
            return foodDatabase[activeCategory];
        }
        
        const results = fuse.search(searchQuery);
        // 如果有搜索词,显示所有匹配结果,不限制分类
        return results.map(result => result.item);
    }, [searchQuery, activeCategory, fuse]);

    // AI Nutrition Analyst
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    const handleAnalyze = async () => {
        if (selectedFoods.length === 0) return;

        setAiLoading(true);
        setAiResponse('');

        const foodSummary = selectedFoods.map(f => `${f.name} ${f.amount}g`).join(', ');
        const nutritionSummary = `总热量: ${Math.round(totals.calories)}kcal, 蛋白质: ${totals.protein.toFixed(1)}g, 碳水: ${totals.carbs.toFixed(1)}g, 脂肪: ${totals.fat.toFixed(1)}g`;
        
        const prompt = `请帮我分析这顿饭：${foodSummary}。${nutritionSummary}`;
        
        try {
            const response = await fetch('/api/analyze-meal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }]
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error('Failed to analyze');
            }

            // 使用 response.text() 读取完整响应
            const fullText = await response.text();
            console.log('Full response:', fullText);
            setAiResponse(fullText);
            
        } catch (error) {
            console.error('AI Analysis Error:', error);
            setAiResponse('抱歉，AI 分析失败，请稍后再试。错误：' + error.message);
        } finally {
            setAiLoading(false);
        }
    };


    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左侧：食材选择区 */}
                <div className="food-selection">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">选择食材</h2>
                    
                    {/* 搜索框 */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜索食材（支持拼音搜索，如 jxr = 鸡胸肉）"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    
                    {/* 分类标签 */}
                    {!searchQuery && (
                        <div className="flex flex-wrap gap-2 mb-4">
                        {Object.keys(foodDatabase).map(category => (
                            <button
                                key={category}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    activeCategory === category 
                                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                        </div>
                    )}

                    {/* 食材列表 */}
                    <div className="h-[480px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {searchQuery && displayFoods.length > 0 && (
                            <div className="text-xs text-gray-500 mb-2 px-2">
                                找到 {displayFoods.length} 个结果
                            </div>
                        )}
                        {displayFoods.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                <p className="text-3xl mb-2">🔍</p>
                                <p>未找到匹配的食材</p>
                            </div>
                        ) : (
                            displayFoods.map(food => (
                            <div key={food.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">{food.name}</span>
                                        {searchQuery && food.category && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                {food.category}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {food.calories} kcal · ¥{food.price.toFixed(1)}/{food.unit}
                                    </span>
                                </div>
                                <button
                                    className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-105 transition-all"
                                    onClick={() => addFood(food)}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 右侧：已选食材和结果 */}
                <div className="result-section flex flex-col h-full">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">我的轻食搭配</h2>
                    
                    {selectedFoods.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12 border-2 border-dashed border-gray-200 rounded-xl">
                            <span className="text-4xl mb-4">🍽️</span>
                            <p>请从左侧选择食材开始搭配</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto pr-2 mb-6 max-h-[300px] custom-scrollbar">
                                {selectedFoods.map(food => (
                                    <div key={food.key} className="bg-indigo-50/50 p-3 rounded-xl mb-3 border border-indigo-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-gray-800">{food.name}</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={food.amount}
                                                    onChange={(e) => updateAmount(food.key, e.target.value)}
                                                    min="0"
                                                    step="10"
                                                    className="w-16 px-2 py-1 text-center text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                                />
                                                <span className="text-xs text-gray-500">g</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-3 text-xs">
                                                <span className="font-semibold text-primary">
                                                    {Math.round(food.calories * food.amount / 100)} kcal
                                                </span>
                                                <span className="font-semibold text-red-500">
                                                    ¥{(food.price * food.amount / 100).toFixed(1)}
                                                </span>
                                            </div>
                                            <button
                                                className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                onClick={() => removeFood(food.key)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 营养总计 */}
                            <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-2xl text-white shadow-lg mt-auto">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Info size={18} /> 营养总计
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/20">
                                    <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                                        <span className="text-xs opacity-90 block mb-1">总热量</span>
                                        <span className="text-2xl font-bold">{Math.round(totals.calories)}</span>
                                        <span className="text-xs ml-1">kcal</span>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                                        <span className="text-xs opacity-90 block mb-1">总价格</span>
                                        <span className="text-2xl font-bold text-yellow-300">¥{totals.price.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                        <span className="text-xs opacity-90 block mb-1">蛋白质</span>
                                        <span className="font-semibold">{totals.protein.toFixed(1)}g</span>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                        <span className="text-xs opacity-90 block mb-1">碳水</span>
                                        <span className="font-semibold">{totals.carbs.toFixed(1)}g</span>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                        <span className="text-xs opacity-90 block mb-1">脂肪</span>
                                        <span className="font-semibold">{totals.fat.toFixed(1)}g</span>
                                    </div>
                                </div>
                                
                                {/* 健康建议 */}
                                <div className="bg-white/20 rounded-lg p-3 text-center text-sm backdrop-blur-sm">
                                    {totals.calories < 300 && <p>💡 热量偏低，建议增加主食或蛋白质</p>}
                                    {totals.calories >= 300 && totals.calories <= 600 && <p>✅ 热量适中，适合作为一餐</p>}
                                    {totals.calories > 600 && totals.calories <= 800 && <p>⚠️ 热量较高，注意控制</p>}
                                    {totals.calories > 800 && <p>🔴 热量过高，建议减少份量</p>}
                                </div>
                            </div>

                            {/* AI 分析按钮 */}
                            <button
                                onClick={handleAnalyze}
                                disabled={aiLoading}
                                className="w-full mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {aiLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        AI 营养师正在分析中...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        AI 营养师点评
                                    </>
                                )}
                            </button>

                            {/* AI 分析结果展示 */}
                            {aiResponse && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-lg border-b border-gray-200 pb-2">
                                        <Sparkles size={24} />
                                        <h3>AI 分析报告</h3>
                                    </div>
                                    <div className="prose prose-sm prose-indigo max-w-none">
                                        <ReactMarkdown>{aiResponse}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}