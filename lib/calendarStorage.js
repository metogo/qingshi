// 热量日历数据存储工具库（基于LocalStorage）

const STORAGE_KEY = 'calorie_calendar_records';

/**
 * 保存餐食记录
 */
export function saveMealRecord(record) {
  if (typeof window === 'undefined') return;
  
  const records = getAllRecords();
  records.push({
    ...record,
    recordId: record.recordId || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: record.createdAt || Date.now(),
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  console.log('[Calendar] 记录已保存:', record);
  
  return record;
}

/**
 * 获取所有记录
 */
export function getAllRecords() {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 获取指定日期的所有记录
 */
export function getRecordsByDate(date) {
  const allRecords = getAllRecords();
  return allRecords.filter(r => r.recordDate === date);
}

/**
 * 获取指定月份的所有记录
 */
export function getRecordsByMonth(month) {
  const allRecords = getAllRecords();
  return allRecords.filter(r => r.recordDate.startsWith(month));
}

/**
 * 删除指定记录
 */
export function deleteRecord(recordId) {
  if (typeof window === 'undefined') return;
  
  const records = getAllRecords();
  const filtered = records.filter(r => r.recordId !== recordId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * 获取每日统计
 */
export function getDailyStats(date) {
  const records = getRecordsByDate(date);
  
  if (records.length === 0) {
    return null;
  }
  
  const totals = records.reduce((sum, r) => ({
    calories: sum.calories + r.totals.calories,
    protein: sum.protein + r.totals.protein,
    carbs: sum.carbs + r.totals.carbs,
    fat: sum.fat + r.totals.fat,
    price: sum.price + (r.totals.price || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 });
  
  return {
    date,
    totalCalories: Math.round(totals.calories),
    totalProtein: parseFloat(totals.protein.toFixed(1)),
    totalCarbs: parseFloat(totals.carbs.toFixed(1)),
    totalFat: parseFloat(totals.fat.toFixed(1)),
    totalPrice: parseFloat(totals.price.toFixed(1)),
    mealCount: records.length,
    records,
  };
}

/**
 * 获取月度统计
 */
export function getMonthlyStats(month, userGoal = 2000) {
  const records = getRecordsByMonth(month);
  
  if (records.length === 0) {
    return null;
  }
  
  // 按日期分组
  const dailyGroups = records.reduce((groups, record) => {
    const date = record.recordDate;
    if (!groups[date]) groups[date] = [];
    groups[date].push(record);
    return groups;
  }, {});
  
  // 计算每日总计
  const dailyStats = Object.entries(dailyGroups).map(([date, recs]) => {
    const dayTotals = recs.reduce((sum, r) => ({
      calories: sum.calories + r.totals.calories,
      protein: sum.protein + r.totals.protein,
      carbs: sum.carbs + r.totals.carbs,
      fat: sum.fat + r.totals.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return {
      date,
      calories: dayTotals.calories,
      protein: dayTotals.protein,
      carbs: dayTotals.carbs,
      fat: dayTotals.fat,
      mealCount: recs.length,
    };
  });
  
  // 统计指标
  const recordedDays = dailyStats.length;
  const totalCalories = dailyStats.reduce((sum, d) => sum + d.calories, 0);
  const avgDailyCalories = Math.round(totalCalories / recordedDays);
  
  let targetDays = 0;
  let overDays = 0;
  let underDays = 0;
  let maxDay = dailyStats[0];
  let minDay = dailyStats[0];
  
  dailyStats.forEach(day => {
    // 达标判断（±10%）
    if (day.calories >= userGoal * 0.9 && day.calories <= userGoal * 1.1) {
      targetDays++;
    } else if (day.calories > userGoal * 1.1) {
      overDays++;
    } else {
      underDays++;
    }
    
    // 更新极值
    if (day.calories > maxDay.calories) maxDay = day;
    if (day.calories < minDay.calories) minDay = day;
  });
  
  // 营养素占比
  const totalProtein = dailyStats.reduce((sum, d) => sum + d.protein, 0);
  const totalCarbs = dailyStats.reduce((sum, d) => sum + d.carbs, 0);
  const totalFat = dailyStats.reduce((sum, d) => sum + d.fat, 0);
  const totalNutrients = totalProtein + totalCarbs + totalFat;
  
  return {
    month,
    stats: {
      avgDailyCalories,
      recordedDays,
      totalDays: new Date(month.split('-')[0], month.split('-')[1], 0).getDate(),
      targetDays,
      overDays,
      underDays,
      avgProteinPercent: Math.round((totalProtein / totalNutrients) * 100),
      avgCarbsPercent: Math.round((totalCarbs / totalNutrients) * 100),
      avgFatPercent: Math.round((totalFat / totalNutrients) * 100),
      maxCalorieDay: { date: maxDay.date, calories: Math.round(maxDay.calories) },
      minCalorieDay: { date: minDay.date, calories: Math.round(minDay.calories) },
    },
    dailyData: dailyStats,
  };
}

/**
 * 创建餐食记录对象
 */
export function createMealRecord(selectedFoods, totals, aiAnalysis, source = 'manual') {
  const now = new Date();
  
  return {
    recordId: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: 'default',
    recordDate: now.toISOString().split('T')[0],
    recordTime: now.toLocaleTimeString('zh-CN', { hour12: false }),
    createdAt: Date.now(),
    totals: {
      calories: parseFloat(totals.calories.toFixed(2)),
      protein: parseFloat(totals.protein.toFixed(1)),
      carbs: parseFloat(totals.carbs.toFixed(1)),
      fat: parseFloat(totals.fat.toFixed(1)),
      price: parseFloat(totals.price.toFixed(2)),
    },
    foodItems: selectedFoods.map(food => ({
      id: food.id,
      name: food.name,
      emoji: food.emoji,
      quantity: food.amount,
      unit: food.currentUnit,
      grams: food.amount * (food.units?.find(u => u.name === food.currentUnit)?.rate || 1),
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    })),
    aiAnalysis: aiAnalysis || '',
    source,
  };
}

/**
 * 清空所有记录（用于测试）
 */
export function clearAllRecords() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  console.log('[Calendar] 所有记录已清空');
}