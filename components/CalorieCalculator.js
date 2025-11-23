'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Plus, X, Sparkles, Loader2, Search, Minus, ChevronLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Fuse from 'fuse.js'
import { pinyin } from 'pinyin-pro'
import { getUserProfile } from '../lib/health'
import { saveMealRecord, createMealRecord } from '../lib/calendarStorage'
import { showToast } from './Toast'

const foodDatabase = {
    主食: [
        { id: 1, name: '糙米饭', emoji: '🍚', calories: 111, protein: 2.6, carbs: 24, fat: 0.8, price: 0.4, primaryUnit: 'g', defaultQuantity: 150, servingSize: 150, units: [{name: 'g', rate: 1}, {name: '碗', rate: 150}] },
        { id: 2, name: '白米饭', emoji: '🍙', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3, price: 0.3, primaryUnit: 'g', defaultQuantity: 150, servingSize: 150, units: [{name: 'g', rate: 1}, {name: '碗', rate: 150}] },
        { id: 3, name: '全麦面包', emoji: '🍞', calories: 246, protein: 9, carbs: 48, fat: 3.4, price: 1.5, primaryUnit: '片', defaultQuantity: 1, servingSize: 35, units: [{name: '片', rate: 35}, {name: 'g', rate: 1}] },
        { id: 4, name: '燕麦', emoji: '🥣', calories: 367, protein: 12.5, carbs: 61, fat: 7.2, price: 1.2, primaryUnit: 'g', defaultQuantity: 50, servingSize: 50, units: [{name: 'g', rate: 1}] },
        { id: 5, name: '紫薯', emoji: '🍠', calories: 82, protein: 1.6, carbs: 18.3, fat: 0.2, price: 0.6, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] },
        { id: 6, name: '红薯', emoji: '🍠', calories: 90, protein: 1.6, carbs: 20.1, fat: 0.2, price: 0.5, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] },
        { id: 7, name: '玉米', emoji: '🌽', calories: 112, protein: 4, carbs: 23, fat: 1.2, price: 0.8, primaryUnit: '根', defaultQuantity: 1, servingSize: 200, units: [{name: '根', rate: 200}, {name: 'g', rate: 1}] },
        { id: 8, name: '藜麦', emoji: '🌾', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, price: 2.5, primaryUnit: 'g', defaultQuantity: 50, servingSize: 50, units: [{name: 'g', rate: 1}] },
        { id: 9, name: '意大利面', emoji: '🍝', calories: 131, protein: 5, carbs: 25, fat: 1.1, price: 1.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 10, name: '荞麦面', emoji: '🍜', calories: 343, protein: 13.3, carbs: 71.5, fat: 3.4, price: 1.6, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 11, name: '土豆', emoji: '🥔', calories: 77, protein: 2, carbs: 17.5, fat: 0.1, price: 0.4, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] },
        { id: 12, name: '全麦吐司', emoji: '🥖', calories: 265, protein: 11, carbs: 50, fat: 3.5, price: 1.8, primaryUnit: '片', defaultQuantity: 1, servingSize: 35, units: [{name: '片', rate: 35}, {name: 'g', rate: 1}] },
    ],
    蛋白质: [
        { id: 21, name: '鸡胸肉', emoji: '🍗', calories: 133, protein: 24.6, carbs: 2.5, fat: 5, price: 1.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 22, name: '鸡腿肉', emoji: '🍖', calories: 181, protein: 18.4, carbs: 0, fat: 12, price: 1.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 23, name: '牛肉', emoji: '🥩', calories: 250, protein: 26, carbs: 0, fat: 15, price: 4.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 24, name: '瘦猪肉', emoji: '🥓', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2, price: 2.0, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 25, name: '三文鱼', emoji: '🐟', calories: 139, protein: 20, carbs: 0, fat: 6.3, price: 6.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 26, name: '金枪鱼', emoji: '🐠', calories: 132, protein: 23.3, carbs: 0, fat: 4.9, price: 5.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 27, name: '鳕鱼', emoji: '🐡', calories: 82, protein: 17.8, carbs: 0, fat: 0.7, price: 4.2, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 28, name: '鸡蛋', emoji: '🥚', calories: 144, protein: 13.3, carbs: 2.8, fat: 8.8, price: 1.2, primaryUnit: '个', defaultQuantity: 1, servingSize: 50, units: [{name: '个', rate: 50}, {name: 'g', rate: 1}] },
        { id: 29, name: '豆腐', emoji: '🧈', calories: 81, protein: 8.1, carbs: 4.2, fat: 3.7, price: 0.6, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 30, name: '虾仁', emoji: '🦐', calories: 87, protein: 18.6, carbs: 2.8, fat: 0.6, price: 5.0, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 31, name: '扇贝', emoji: '🦪', calories: 69, protein: 12.3, carbs: 3.2, fat: 0.8, price: 6.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 32, name: '鸭胸肉', emoji: '🦆', calories: 201, protein: 18.3, carbs: 0, fat: 14, price: 2.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 33, name: '火鸡胸', emoji: '🦃', calories: 104, protein: 21.9, carbs: 0, fat: 1.7, price: 3.2, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 34, name: '豆腐干', emoji: '🧊', calories: 140, protein: 17, carbs: 4.9, fat: 5.8, price: 0.8, primaryUnit: '块', defaultQuantity: 1, servingSize: 25, units: [{name: '块', rate: 25}, {name: 'g', rate: 1}] },
    ],
    蔬菜: [
        { id: 41, name: '西兰花', emoji: '🥦', calories: 36, protein: 4.1, carbs: 4.9, fat: 0.6, price: 0.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 42, name: '生菜', emoji: '🥬', calories: 13, protein: 1.3, carbs: 2.1, fat: 0.3, price: 0.5, primaryUnit: 'g', defaultQuantity: 50, servingSize: 50, units: [{name: 'g', rate: 1}] },
        { id: 43, name: '番茄', emoji: '🍅', calories: 15, protein: 0.9, carbs: 3.3, fat: 0.2, price: 0.6, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] },
        { id: 44, name: '黄瓜', emoji: '🥒', calories: 15, protein: 0.8, carbs: 3.6, fat: 0.1, price: 0.4, primaryUnit: '根', defaultQuantity: 1, servingSize: 200, units: [{name: '根', rate: 200}, {name: 'g', rate: 1}] },
        { id: 45, name: '胡萝卜', emoji: '🥕', calories: 25, protein: 1, carbs: 6, fat: 0.2, price: 0.4, primaryUnit: '根', defaultQuantity: 1, servingSize: 100, units: [{name: '根', rate: 100}, {name: 'g', rate: 1}] },
        { id: 46, name: '菠菜', emoji: '🌿', calories: 28, protein: 2.6, carbs: 4.5, fat: 0.3, price: 0.6, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 47, name: '芦笋', emoji: '🌱', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, price: 1.2, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 48, name: '青椒', emoji: '🫑', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, price: 0.5, primaryUnit: '个', defaultQuantity: 1, servingSize: 120, units: [{name: '个', rate: 120}, {name: 'g', rate: 1}] },
        { id: 49, name: '红椒', emoji: '🌶️', calories: 26, protein: 1, carbs: 6, fat: 0.3, price: 0.7, primaryUnit: '个', defaultQuantity: 1, servingSize: 120, units: [{name: '个', rate: 120}, {name: 'g', rate: 1}] },
        { id: 50, name: '茄子', emoji: '🍆', calories: 21, protein: 1.1, carbs: 4.7, fat: 0.2, price: 0.5, primaryUnit: '个', defaultQuantity: 1, servingSize: 200, units: [{name: '个', rate: 200}, {name: 'g', rate: 1}] },
        { id: 51, name: '洋葱', emoji: '🧅', calories: 39, protein: 1.2, carbs: 9, fat: 0.1, price: 0.4, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] },
        { id: 52, name: '蘑菇', emoji: '🍄', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, price: 1.0, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 53, name: '芹菜', emoji: '🥒', calories: 12, protein: 0.7, carbs: 2.4, fat: 0.1, price: 0.4, primaryUnit: 'g', defaultQuantity: 50, servingSize: 50, units: [{name: 'g', rate: 1}] },
        { id: 54, name: '白菜', emoji: '🥬', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2, price: 0.3, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 55, name: '花菜', emoji: '🥦', calories: 24, protein: 1.9, carbs: 4.9, fat: 0.3, price: 0.7, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
        { id: 56, name: '秋葵', emoji: '🌱', calories: 33, protein: 2, carbs: 7.5, fat: 0.2, price: 1.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] },
    ],
    蛋白质: [ { id: 21, name: '鸡胸肉', emoji: '🍗', calories: 133, protein: 24.6, carbs: 2.5, fat: 5, price: 1.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 22, name: '鸡腿肉', emoji: '🍖', calories: 181, protein: 18.4, carbs: 0, fat: 12, price: 1.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 23, name: '牛肉', emoji: '🥩', calories: 250, protein: 26, carbs: 0, fat: 15, price: 4.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 24, name: '瘦猪肉', emoji: '🥓', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2, price: 2.0, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 25, name: '三文鱼', emoji: '🐟', calories: 139, protein: 20, carbs: 0, fat: 6.3, price: 6.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 26, name: '金枪鱼', emoji: '🐠', calories: 132, protein: 23.3, carbs: 0, fat: 4.9, price: 5.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 27, name: '鳕鱼', emoji: '🐡', calories: 82, protein: 17.8, carbs: 0, fat: 0.7, price: 4.2, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 28, name: '鸡蛋', emoji: '🥚', calories: 144, protein: 13.3, carbs: 2.8, fat: 8.8, price: 1.2, primaryUnit: '个', defaultQuantity: 1, servingSize: 50, units: [{name: '个', rate: 50}, {name: 'g', rate: 1}] }, { id: 29, name: '豆腐', emoji: '🧈', calories: 81, protein: 8.1, carbs: 4.2, fat: 3.7, price: 0.6, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 30, name: '虾仁', emoji: '🦐', calories: 87, protein: 18.6, carbs: 2.8, fat: 0.6, price: 5.0, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 31, name: '扇贝', emoji: '🦪', calories: 69, protein: 12.3, carbs: 3.2, fat: 0.8, price: 6.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 32, name: '鸭胸肉', emoji: '🦆', calories: 201, protein: 18.3, carbs: 0, fat: 14, price: 2.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 33, name: '火鸡胸', emoji: '🦃', calories: 104, protein: 21.9, carbs: 0, fat: 1.7, price: 3.2, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 34, name: '豆腐干', emoji: '🧊', calories: 140, protein: 17, carbs: 4.9, fat: 5.8, price: 0.8, primaryUnit: '块', defaultQuantity: 1, servingSize: 25, units: [{name: '块', rate: 25}, {name: 'g', rate: 1}] } ],
    蔬菜: [ { id: 41, name: '西兰花', emoji: '🥦', calories: 36, protein: 4.1, carbs: 4.9, fat: 0.6, price: 0.8, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 42, name: '生菜', emoji: '🥬', calories: 13, protein: 1.3, carbs: 2.1, fat: 0.3, price: 0.5, primaryUnit: 'g', defaultQuantity: 50, servingSize: 50, units: [{name: 'g', rate: 1}] }, { id: 43, name: '番茄', emoji: '🍅', calories: 15, protein: 0.9, carbs: 3.3, fat: 0.2, price: 0.6, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] }, { id: 44, name: '黄瓜', emoji: '🥒', calories: 15, protein: 0.8, carbs: 3.6, fat: 0.1, price: 0.4, primaryUnit: '根', defaultQuantity: 1, servingSize: 200, units: [{name: '根', rate: 200}, {name: 'g', rate: 1}] }, { id: 45, name: '胡萝卜', emoji: '🥕', calories: 25, protein: 1, carbs: 6, fat: 0.2, price: 0.4, primaryUnit: '根', defaultQuantity: 1, servingSize: 100, units: [{name: '根', rate: 100}, {name: 'g', rate: 1}] }, { id: 46, name: '菠菜', emoji: '🌿', calories: 28, protein: 2.6, carbs: 4.5, fat: 0.3, price: 0.6, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 47, name: '芦笋', emoji: '🌱', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, price: 1.2, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 48, name: '青椒', emoji: '🫑', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, price: 0.5, primaryUnit: '个', defaultQuantity: 1, servingSize: 120, units: [{name: '个', rate: 120}, {name: 'g', rate: 1}] }, { id: 49, name: '红椒', emoji: '🌶️', calories: 26, protein: 1, carbs: 6, fat: 0.3, price: 0.7, primaryUnit: '个', defaultQuantity: 1, servingSize: 120, units: [{name: '个', rate: 120}, {name: 'g', rate: 1}] }, { id: 50, name: '茄子', emoji: '🍆', calories: 21, protein: 1.1, carbs: 4.7, fat: 0.2, price: 0.5, primaryUnit: '个', defaultQuantity: 1, servingSize: 200, units: [{name: '个', rate: 200}, {name: 'g', rate: 1}] }, { id: 51, name: '洋葱', emoji: '🧅', calories: 39, protein: 1.2, carbs: 9, fat: 0.1, price: 0.4, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] }, { id: 52, name: '蘑菇', emoji: '🍄', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, price: 1.0, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 53, name: '芹菜', emoji: '🥒', calories: 12, protein: 0.7, carbs: 2.4, fat: 0.1, price: 0.4, primaryUnit: 'g', defaultQuantity: 50, servingSize: 50, units: [{name: 'g', rate: 1}] }, { id: 54, name: '白菜', emoji: '🥬', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2, price: 0.3, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 55, name: '花菜', emoji: '🥦', calories: 24, protein: 1.9, carbs: 4.9, fat: 0.3, price: 0.7, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 56, name: '秋葵', emoji: '🌱', calories: 33, protein: 2, carbs: 7.5, fat: 0.2, price: 1.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] } ],
    水果: [ { id: 61, name: '苹果', emoji: '🍎', calories: 54, protein: 0.4, carbs: 13.8, fat: 0.2, price: 0.8, primaryUnit: '个', defaultQuantity: 1, servingSize: 200, units: [{name: '个', rate: 200}, {name: 'g', rate: 1}] }, { id: 62, name: '香蕉', emoji: '🍌', calories: 93, protein: 1.4, carbs: 23, fat: 0.2, price: 0.6, primaryUnit: '根', defaultQuantity: 1, servingSize: 120, units: [{name: '根', rate: 120}, {name: 'g', rate: 1}] }, { id: 63, name: '蓝莓', emoji: '🫐', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, price: 4.0, primaryUnit: 'g', defaultQuantity: 50, servingSize: 50, units: [{name: 'g', rate: 1}] }, { id: 64, name: '草莓', emoji: '🍓', calories: 30, protein: 1, carbs: 7.7, fat: 0.2, price: 2.0, primaryUnit: '颗', defaultQuantity: 5, servingSize: 100, units: [{name: '颗', rate: 20}, {name: 'g', rate: 1}] }, { id: 65, name: '奇异果', emoji: '🥝', calories: 56, protein: 1.1, carbs: 14.7, fat: 0.5, price: 1.5, primaryUnit: '个', defaultQuantity: 1, servingSize: 80, units: [{name: '个', rate: 80}, {name: 'g', rate: 1}] }, { id: 66, name: '橙子', emoji: '🍊', calories: 43, protein: 0.9, carbs: 11.8, fat: 0.1, price: 0.8, primaryUnit: '个', defaultQuantity: 1, servingSize: 180, units: [{name: '个', rate: 180}, {name: 'g', rate: 1}] }, { id: 67, name: '葡萄', emoji: '🍇', calories: 69, protein: 0.6, carbs: 18.1, fat: 0.2, price: 1.5, primaryUnit: 'g', defaultQuantity: 100, servingSize: 100, units: [{name: 'g', rate: 1}] }, { id: 68, name: '西瓜', emoji: '🍉', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, price: 0.4, primaryUnit: 'g', defaultQuantity: 200, servingSize: 200, units: [{name: 'g', rate: 1}] }, { id: 69, name: '芒果', emoji: '🥭', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, price: 1.2, primaryUnit: '个', defaultQuantity: 1, servingSize: 200, units: [{name: '个', rate: 200}, {name: 'g', rate: 1}] }, { id: 70, name: '火龙果', emoji: '🐉', calories: 51, protein: 1.1, carbs: 13.3, fat: 0.2, price: 1.0, primaryUnit: '个', defaultQuantity: 1, servingSize: 300, units: [{name: '个', rate: 300}, {name: 'g', rate: 1}] }, { id: 71, name: '樱桃', emoji: '🍒', calories: 50, protein: 1, carbs: 12.2, fat: 0.3, price: 3.5, primaryUnit: '颗', defaultQuantity: 10, servingSize: 100, units: [{name: '颗', rate: 10}, {name: 'g', rate: 1}] }, { id: 72, name: '梨', emoji: '🍐', calories: 44, protein: 0.4, carbs: 11.3, fat: 0.1, price: 0.7, primaryUnit: '个', defaultQuantity: 1, servingSize: 180, units: [{name: '个', rate: 180}, {name: 'g', rate: 1}] }, { id: 73, name: '桃子', emoji: '🍑', calories: 42, protein: 0.9, carbs: 10.9, fat: 0.3, price: 1.0, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] }, { id: 74, name: '柚子', emoji: '🍊', calories: 33, protein: 0.7, carbs: 8.6, fat: 0.1, price: 0.6, primaryUnit: '瓣', defaultQuantity: 3, servingSize: 100, units: [{name: '瓣', rate: 33}, {name: 'g', rate: 1}] } ],
    酱料: [ { id: 81, name: '橄榄油', emoji: '🫒', calories: 884, protein: 0, carbs: 0, fat: 100, price: 3.5, primaryUnit: '勺', defaultQuantity: 1, servingSize: 10, units: [{name: '勺', rate: 10}, {name: 'g', rate: 1}] }, { id: 82, name: '芝麻油', emoji: '🌰', calories: 898, protein: 0, carbs: 0, fat: 99.9, price: 2.8, primaryUnit: '勺', defaultQuantity: 1, servingSize: 10, units: [{name: '勺', rate: 10}, {name: 'g', rate: 1}] }, { id: 83, name: '酱油', emoji: '🥫', calories: 60, protein: 5.6, carbs: 8.1, fat: 0.1, price: 0.8, primaryUnit: '勺', defaultQuantity: 1, servingSize: 10, units: [{name: '勺', rate: 10}, {name: 'g', rate: 1}] }, { id: 84, name: '醋', emoji: '🧴', calories: 18, protein: 0.3, carbs: 3.9, fat: 0, price: 0.6, primaryUnit: '勺', defaultQuantity: 1, servingSize: 10, units: [{name: '勺', rate: 10}, {name: 'g', rate: 1}] }, { id: 85, name: '番茄酱', emoji: '🍅', calories: 101, protein: 1.8, carbs: 25, fat: 0.2, price: 1.2, primaryUnit: '勺', defaultQuantity: 1, servingSize: 15, units: [{name: '勺', rate: 15}, {name: 'g', rate: 1}] }, { id: 86, name: '沙拉酱', emoji: '🥗', calories: 629, protein: 1.3, carbs: 9.4, fat: 67, price: 2.5, primaryUnit: '勺', defaultQuantity: 1, servingSize: 15, units: [{name: '勺', rate: 15}, {name: 'g', rate: 1}] }, { id: 87, name: '蛋黄酱', emoji: '🥚', calories: 680, protein: 1.1, carbs: 2.7, fat: 75, price: 2.8, primaryUnit: '勺', defaultQuantity: 1, servingSize: 15, units: [{name: '勺', rate: 15}, {name: 'g', rate: 1}] }, { id: 88, name: '芝麻酱', emoji: '🥜', calories: 618, protein: 20.3, carbs: 22.7, fat: 52.7, price: 3.0, primaryUnit: '勺', defaultQuantity: 1, servingSize: 15, units: [{name: '勺', rate: 15}, {name: 'g', rate: 1}] }, { id: 89, name: '蜂蜜', emoji: '🍯', calories: 304, protein: 0.3, carbs: 82.4, fat: 0, price: 4.5, primaryUnit: '勺', defaultQuantity: 1, servingSize: 20, units: [{name: '勺', rate: 20}, {name: 'g', rate: 1}] }, { id: 90, name: '黑胡椒', emoji: '🌶️', calories: 255, protein: 10.4, carbs: 64.8, fat: 3.3, price: 5.0, primaryUnit: 'g', defaultQuantity: 2, servingSize: 2, units: [{name: 'g', rate: 1}] }, { id: 91, name: '盐', emoji: '🧂', calories: 0, protein: 0, carbs: 0, fat: 0, price: 0.2, primaryUnit: 'g', defaultQuantity: 5, servingSize: 5, units: [{name: 'g', rate: 1}] }, { id: 92, name: '柠檬汁', emoji: '🍋', calories: 22, protein: 0.4, carbs: 6.9, fat: 0.2, price: 1.5, primaryUnit: '勺', defaultQuantity: 2, servingSize: 20, units: [{name: '勺', rate: 10}, {name: 'g', rate: 1}] } ],
    其他: [ { id: 101, name: '牛油果', emoji: '🥑', calories: 171, protein: 2, carbs: 8.6, fat: 15.3, price: 3.5, primaryUnit: '个', defaultQuantity: 1, servingSize: 150, units: [{name: '个', rate: 150}, {name: 'g', rate: 1}] }, { id: 102, name: '杏仁', emoji: '🌰', calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, price: 5.8, primaryUnit: 'g', defaultQuantity: 15, servingSize: 15, units: [{name: 'g', rate: 1}] }, { id: 103, name: '核桃', emoji: '🥜', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, price: 6.5, primaryUnit: 'g', defaultQuantity: 30, servingSize: 30, units: [{name: 'g', rate: 1}] }, { id: 104, name: '腰果', emoji: '🥜', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.9, price: 5.5, primaryUnit: 'g', defaultQuantity: 15, servingSize: 15, units: [{name: 'g', rate: 1}] }, { id: 105, name: '花生', emoji: '🥜', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, price: 3.0, primaryUnit: 'g', defaultQuantity: 15, servingSize: 15, units: [{name: 'g', rate: 1}] }, { id: 106, name: '酸奶', emoji: '🥛', calories: 72, protein: 3.5, carbs: 5, fat: 3.3, price: 1.2, primaryUnit: '杯', defaultQuantity: 1, servingSize: 200, units: [{name: '杯', rate: 200}, {name: 'ml', rate: 1}] }, { id: 107, name: '希腊酸奶', emoji: '🥛', calories: 97, protein: 10.2, carbs: 3.6, fat: 4.5, price: 2.5, primaryUnit: '杯', defaultQuantity: 1, servingSize: 200, units: [{name: '杯', rate: 200}, {name: 'ml', rate: 1}] }, { id: 108, name: '奶酪', emoji: '🧀', calories: 353, protein: 22.9, carbs: 3.1, fat: 28.2, price: 4.8, primaryUnit: '片', defaultQuantity: 1, servingSize: 20, units: [{name: '片', rate: 20}, {name: 'g', rate: 1}] }, { id: 109, name: '牛奶', emoji: '🥛', calories: 54, protein: 3.2, carbs: 5, fat: 3.2, price: 1.0, primaryUnit: 'ml', defaultQuantity: 250, servingSize: 250, units: [{name: 'ml', rate: 1}, {name: '杯', rate: 250}] }, { id: 110, name: '豆浆', emoji: '🥛', calories: 54, protein: 3, carbs: 1.1, fat: 1.8, price: 0.8, primaryUnit: 'ml', defaultQuantity: 250, servingSize: 250, units: [{name: 'ml', rate: 1}, {name: '杯', rate: 250}] } ]
};

export default function CalorieCalculator() {
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [activeCategory, setActiveCategory] = useState('主食');
    const [searchQuery, setSearchQuery] = useState('');
    const [dailyGoal, setDailyGoal] = useState(2000);
    const [userProfile, setUserProfile] = useState(null);
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [drawerState, setDrawerState] = useState('closed'); // 'closed', 'minimized', 'expanded'
    const [lastAnalyzedHash, setLastAnalyzedHash] = useState('');
    
    // 监听食材变更，自动销毁最小化标签
    useEffect(() => {
        const currentHash = getFoodsHash();
        if (drawerState === 'minimized' && currentHash !== lastAnalyzedHash) {
            setDrawerState('closed');
            setAiResponse('');
        }
    }, [selectedFoods]);
    
    useEffect(() => {
        const profile = getUserProfile();
        if (profile?.tdee) {
            setUserProfile(profile);
            setDailyGoal(profile.tdee);
        }
    }, []);
    
    // 监听对话分析完成
    useEffect(() => {
        const handler = (e) => {
            setSelectedFoods(e.detail.foods || []);
            setAiResponse(e.detail.analysis || '');
            setDrawerState('expanded');
        };
        window.addEventListener('meal-analyzed', handler);
        return () => window.removeEventListener('meal-analyzed', handler);
    }, []);
    
    // 禁止背景滚动
    useEffect(() => {
        document.body.style.overflow = drawerState === 'expanded' ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [drawerState]);

    const addFood = (food) => setSelectedFoods([...selectedFoods, { ...food, amount: food.defaultQuantity, currentUnit: food.primaryUnit, key: Date.now() }]);
    const removeFood = (key) => setSelectedFoods(selectedFoods.filter(f => f.key !== key));
    const updateAmount = (key, amount) => setSelectedFoods(selectedFoods.map(f => f.key === key ? { ...f, amount: parseFloat(amount) || 0 } : f));
    const adjustAmount = (key, delta) => {
        setSelectedFoods(selectedFoods.map(f => {
            if (f.key === key) {
                const step = f.currentUnit === 'g' || f.currentUnit === 'ml' ? 10 : 1;
                return { ...f, amount: Math.max(0, f.amount + (delta * step / 10)) };
            }
            return f;
        }));
    };
    const switchUnit = (key, newUnit) => {
        setSelectedFoods(selectedFoods.map(f => {
            if (f.key === key) {
                const oldUnit = f.units.find(u => u.name === f.currentUnit);
                const newUnitObj = f.units.find(u => u.name === newUnit);
                if (oldUnit && newUnitObj) {
                    const grams = f.amount * oldUnit.rate;
                    return { ...f, amount: parseFloat((grams / newUnitObj.rate).toFixed(1)), currentUnit: newUnit };
                }
            }
            return f;
        }));
    };

    const calculateTotals = () => {
        return selectedFoods.reduce((t, food) => {
            const unit = food.units.find(u => u.name === food.currentUnit);
            const grams = food.amount * (unit?.rate || 1);
            const ratio = grams / 100;
            return {
                calories: t.calories + food.calories * ratio,
                protein: t.protein + food.protein * ratio,
                carbs: t.carbs + food.carbs * ratio,
                fat: t.fat + food.fat * ratio,
                price: t.price + food.price * ratio
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 });
    };

    const totals = calculateTotals();

    // 生成食材指纹，用于检测变更
    const getFoodsHash = () => selectedFoods.map(f => `${f.id}-${f.amount}-${f.currentUnit}`).join('|');

    const allFoods = useMemo(() => {
        const foods = [];
        Object.entries(foodDatabase).forEach(([category, items]) => {
            items.forEach(item => {
                foods.push({ 
                    ...item, 
                    category, 
                    pinyinFull: pinyin(item.name, { toneType: 'none' }).replace(/\s/g, ''),
                    pinyinInitials: pinyin(item.name, { pattern: 'first', toneType: 'none' }).replace(/\s/g, '')
                });
            });
        });
        return foods;
    }, []);

    const fuse = useMemo(() => new Fuse(allFoods, {
        keys: [{ name: 'name', weight: 2 }, { name: 'pinyinFull', weight: 1.5 }, { name: 'pinyinInitials', weight: 1 }],
        threshold: 0.3,
    }), [allFoods]);

    const displayFoods = useMemo(() => {
        if (!searchQuery.trim()) return foodDatabase[activeCategory];
        return fuse.search(searchQuery).map(r => r.item);
    }, [searchQuery, activeCategory, fuse]);

    const handleAnalyze = async () => {
        if (selectedFoods.length === 0) return;
        
        const currentHash = getFoodsHash();
        const needsNewAnalysis = currentHash !== lastAnalyzedHash;
        
        if (!needsNewAnalysis && aiResponse) {
            setDrawerState('expanded');
            return;
        }
        
        setAiLoading(true);
        setAiResponse('');

        const foodSummary = selectedFoods.map(f => `${f.name} ${f.amount}${f.currentUnit}`).join(', ');
        let prompt = `请帮我分析这顿饭：${foodSummary}。总热量${Math.round(totals.calories)}kcal，蛋白质${totals.protein.toFixed(1)}g，碳水${totals.carbs.toFixed(1)}g，脂肪${totals.fat.toFixed(1)}g`;
        
        if (userProfile) {
            const tdeeP = ((totals.calories/userProfile.tdee)*100).toFixed(0);
            const proteinP = ((totals.protein/userProfile.proteinGoal)*100).toFixed(0);
            prompt += `\n\n我的信息：${userProfile.sex==='male'?'男':'女'}${userProfile.age}岁，${userProfile.height}cm，${userProfile.weight}kg，BMI${userProfile.bmi}，每日目标${userProfile.tdee}kcal（本餐${tdeeP}%），蛋白质${userProfile.proteinGoal}g（本餐${proteinP}%），目标${userProfile.goal==='lose'?'减脂':userProfile.goal==='gain'?'增肌':'维持'}。请给出个性化分析建议。`;
        }
        
        try {
            const res = await fetch('/api/analyze-meal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
            });
            if (!res.ok) throw new Error('分析失败');
            setAiResponse(await res.text());
            setLastAnalyzedHash(currentHash);
            setDrawerState('expanded');
        } catch (error) {
            setAiResponse('抱歉，AI分析失败，请稍后再试。');
            setDrawerState('expanded');
        } finally {
            setAiLoading(false);
        }
    };
    
    // 保存到热量日历
    const handleSaveToCalendar = () => {
        try {
            const record = createMealRecord(selectedFoods, totals, aiResponse, 'manual');
            saveMealRecord(record);
            showToast('✅ 已成功添加到今日热量日历！');
            setTimeout(() => setDrawerState('closed'), 500);
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败：' + error.message);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="food-selection p-6 md:p-8 lg:border-r border-gray-100">
                    <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2"><span className="text-2xl">🍽️</span>选择食材</h2>
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索食材（支持拼音，如 jxr = 鸡胸肉）" className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                        {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"><X size={20} /></button>}
                    </div>
                    {!searchQuery && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {Object.keys(foodDatabase).map(cat => (
                                <button key={cat} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-bg-light text-text-secondary hover:bg-gray-200'}`} onClick={() => setActiveCategory(cat)}>
                                    <span className="text-base">{foodDatabase[cat][0]?.emoji||'🍽️'}</span>{cat}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="h-[480px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {searchQuery && displayFoods.length > 0 && <div className="text-xs text-text-secondary mb-2 px-2">找到 {displayFoods.length} 个结果</div>}
                        {displayFoods.length === 0 ? (
                            <div className="text-center text-text-secondary py-16"><p className="text-5xl mb-4">🔍</p><p className="font-medium">未找到匹配的食材</p></div>
                        ) : (
                            displayFoods.map(food => (
                                <div key={food.id} className="flex items-center gap-4 p-4 bg-bg-light rounded-2xl hover:bg-gray-100 hover:shadow-md transition-all duration-200 group cursor-pointer border border-transparent hover:border-primary/10" onClick={() => addFood(food)}>
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-200">{food.emoji}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-text-primary">{food.name}</span>
                                            {searchQuery && food.category && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{food.category}</span>}
                                        </div>
                                        <span className="text-xs text-text-secondary">{Math.round(food.calories*food.servingSize/100)} kcal · ¥{(food.price*food.servingSize/100).toFixed(1)}/{food.primaryUnit}</span>
                                    </div>
                                    <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); addFood(food); }}><Plus size={20} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="result-section bg-gradient-to-br from-bg-light/30 to-white flex flex-col h-full relative">
                    <div className="p-6 md:p-8 pb-4">
                        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2"><span className="text-2xl">✨</span>我的轻食搭配</h2>
                    </div>
                    
                    {selectedFoods.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-16 px-6 border-2 border-dashed border-gray-200 rounded-2xl mx-6 md:mx-8 mb-6">
                            <span className="text-6xl mb-4">🍽️</span>
                            <p className="font-medium text-lg">请从左侧选择食材开始搭配</p>
                            <p className="text-sm mt-2">点击食材卡片即可添加</p>
                        </div>
                    ) : (
                        <>
                            {/* 极致单行食材列表 */}
                            <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-40 custom-scrollbar">
                                <div className="space-y-1.5">
                                    {selectedFoods.map(food => (
                                        <div key={food.key} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-100 hover:shadow-md transition-all h-11">
                                            <span className="text-base">{food.emoji}</span>
                                            <span className="font-medium text-text-primary text-sm flex-shrink-0">{food.name}</span>
                                            <div className="flex items-center gap-1 bg-bg-light rounded px-1.5 py-0.5">
                                                <button onClick={() => adjustAmount(food.key,-1)} className="w-5 h-5 rounded bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Minus size={10} /></button>
                                                <input type="number" value={food.amount} onChange={(e) => updateAmount(food.key, e.target.value)} min="0" className="w-10 px-0.5 text-center text-xs font-semibold border-0 bg-transparent focus:outline-none" />
                                                {food.units?.length > 1 ? (
                                                    <select value={food.currentUnit} onChange={(e) => switchUnit(food.key, e.target.value)} className="text-xs text-text-secondary bg-transparent border-0 focus:outline-none cursor-pointer hover:text-primary transition-colors pr-0.5">
                                                        {food.units.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                                                    </select>
                                                ) : <span className="text-xs text-text-secondary">{food.currentUnit}</span>}
                                                <button onClick={() => adjustAmount(food.key,1)} className="w-5 h-5 rounded bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Plus size={10} /></button>
                                            </div>
                                            <span className="text-xs font-semibold text-primary ml-auto">{Math.round(food.calories*food.amount*(food.units.find(u=>u.name===food.currentUnit)?.rate||1)/100)} kcal</span>
                                            <button className="w-5 h-5 rounded bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all flex-shrink-0" onClick={() => removeFood(food.key)}><X size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 固定底部 - 整合营养素 */}
                            <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-5 md:p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-text-secondary mb-1">本餐总计</div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-bold text-primary">{Math.round(totals.calories)}</span>
                                            <span className="text-sm text-text-secondary">kcal</span>
                                            <span className="text-xl font-bold text-yellow-600">¥{totals.price.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-xs">
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-nutrient-protein"></div><span className="font-semibold text-text-primary">{totals.protein.toFixed(1)}g 蛋白质</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-nutrient-carbs"></div><span className="font-semibold text-text-primary">{totals.carbs.toFixed(1)}g 碳水</span></div>
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-nutrient-fat"></div><span className="font-semibold text-text-primary">{totals.fat.toFixed(1)}g 脂肪</span></div>
                                    </div>
                                </div>
                                <button onClick={handleAnalyze} disabled={aiLoading} className="w-full bg-gradient-to-r from-ai-blue via-ai-purple to-pink-500 text-white py-3 px-6 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 shimmer-effect"></div>
                                    {aiLoading ? <><Loader2 className="animate-spin" size={20} /><span>AI分析中...</span></> : <><Sparkles size={20} /><span>✨ AI 营养师分析</span></>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 最小化标签 - 右侧边缘 */}
            {drawerState === 'minimized' && (
                <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40 animate-in slide-in-from-right duration-300">
                    <button
                        onClick={() => setDrawerState('expanded')}
                        className="bg-gradient-to-b from-ai-blue via-ai-purple to-pink-500 text-white px-2 py-6 rounded-l-2xl shadow-xl hover:shadow-2xl hover:px-3 transition-all duration-200 flex flex-col items-center gap-2 group"
                    >
                        <Sparkles size={20} className="animate-pulse" />
                        <div className="writing-mode-vertical text-xs font-bold tracking-wider">AI分析</div>
                        <div className="text-lg group-hover:scale-110 transition-transform">«</div>
                    </button>
                </div>
            )}

            {/* 全屏模态弹窗 - 两栏布局 */}
            {drawerState === 'expanded' && aiResponse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDrawerState('closed')}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-6xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-ai-blue via-ai-purple to-pink-500 p-6 text-white flex justify-between">
                            <h2 className="text-2xl font-bold">📊 餐食分析报告</h2>
                            <button onClick={() => setDrawerState('closed')}><X size={24} /></button>
                        </div>
                        <div className="grid md:grid-cols-2" style={{maxHeight:'calc(85vh - 180px)'}}>
                            <div className="border-r p-6 overflow-y-auto bg-gray-50" style={{maxHeight:'calc(85vh - 180px)'}}>
                                <h3 className="font-bold mb-4">🍽️ 本次分析的餐食</h3>
                                {selectedFoods.map(f => (
                                    <div key={f.key} className="bg-white p-3 rounded-xl border mb-2">
                                        <div className="flex gap-2 mb-1">
                                            <span>{f.emoji}</span>
                                            <span>{f.name}</span>
                                            <span className="ml-auto text-xs">{f.amount}{f.currentUnit}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 p-4 bg-primary/5 rounded-xl border-2 border-primary/20">
                                    <div className="font-bold mb-3">营养总计</div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>热量: <span className="font-bold text-primary">{Math.round(totals.calories)}</span> kcal</div>
                                        <div>价格: <span className="font-bold text-yellow-600">¥{totals.price.toFixed(1)}</span></div>
                                        <div>蛋白质: <span className="font-bold">{totals.protein.toFixed(1)}g</span></div>
                                        <div>碳水: <span className="font-bold">{totals.carbs.toFixed(1)}g</span></div>
                                        <div>脂肪: <span className="font-bold">{totals.fat.toFixed(1)}g</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto" style={{maxHeight:'calc(85vh - 180px)'}}>
                                <h3 className="font-bold text-purple-600 mb-4 flex items-center gap-2"><Sparkles size={20} />AI营养师分析</h3>
                                <div className="prose prose-sm max-w-none">
                                <ReactMarkdown components={{
                                    h3: ({node, ...props}) => <h3 className="text-xl font-bold text-text-primary mt-6 mb-3" {...props} />,
                                    h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-primary mt-4 mb-2" {...props} />,
                                    p: ({node, ...props}) => <p className="text-text-secondary leading-relaxed mb-3" {...props} />,
                                    ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                                    li: ({node, ...props}) => <li className="flex items-start gap-2 text-text-secondary"><span className="text-primary mt-1">•</span><span {...props} /></li>,
                                    strong: ({node, ...props}) => <strong className="text-primary font-semibold" {...props} />,
                                    }}>{aiResponse}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                        <div className="border-t p-6 bg-gray-50 flex gap-3">
                            <button onClick={handleSaveToCalendar} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">📅 添加到热量日历</button>
                            <button onClick={() => setDrawerState('closed')} className="flex-1 bg-white border-2 py-3 rounded-xl">关闭</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}