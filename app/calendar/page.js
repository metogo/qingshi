'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getRecordsByMonth, getMonthlyStats } from '@/lib/calendarStorage'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState('');
  const [monthlyData, setMonthlyData] = useState(null);
  
  useEffect(() => {
    // 初始化为当前月份
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(monthStr);
  }, []);
  
  useEffect(() => {
    if (currentMonth) {
      loadMonthData(currentMonth);
    }
  }, [currentMonth]);
  
  function loadMonthData(month) {
    const records = getRecordsByMonth(month);
    const stats = getMonthlyStats(month, 2000); // 默认目标2000，后续可从userProfile读取
    setMonthlyData(stats);
  }
  
  function prevMonth() {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    setCurrentMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  }
  
  function nextMonth() {
    const [year, month] = currentMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    setCurrentMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  }
  
  function formatMonth(monthStr) {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    return `${year}年 ${parseInt(month)}月`;
  }
  
  // 生成日历天数
  function generateCalendarDays(monthStr) {
    if (!monthStr) return [];
    
    const [year, month] = monthStr.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 填充前置空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ isEmpty: true });
    }
    
    // 填充实际日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const today = new Date().toISOString().split('T')[0];
      
      days.push({
        day,
        date: dateStr,
        isToday: dateStr === today,
        isEmpty: false
      });
    }
    
    return days;
  }
  
  const calendarDays = generateCalendarDays(currentMonth);
  
  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* 返回按钮 */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>返回首页</span>
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">📅 热量日历</h1>
          <p className="text-text-secondary">长期追踪您的饮食记录，科学管理营养摄入</p>
        </div>

        {/* 主内容区域 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 日历网格区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              {/* 月份控制器 */}
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold text-text-primary">{formatMonth(currentMonth)}</h2>
                <button 
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              {/* 星期标题 */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* 日历网格 */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (day.isEmpty) {
                    return <div key={`empty-${index}`} className="aspect-square"></div>;
                  }
                  
                  const dayStats = monthlyData?.dailyData?.find(d => d.date === day.date);
                  const hasRecords = dayStats && dayStats.calories > 0;
                  
                  return (
                    <div
                      key={day.date}
                      className={`
                        aspect-square p-3 rounded-xl border-2 transition-all cursor-pointer
                        ${hasRecords 
                          ? 'bg-primary/5 border-primary/30 hover:border-primary hover:shadow-md' 
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}
                        ${day.isToday ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      <div className="text-sm font-semibold text-text-primary mb-1">{day.day}</div>
                      {hasRecords && (
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-primary">
                            {Math.round(dayStats.calories)} kcal
                          </div>
                          <div className="text-xs text-gray-500">
                            {dayStats.mealCount}餐
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* 月度统计面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 space-y-6">
              <h3 className="text-xl font-bold text-text-primary">📊 本月数据</h3>
              
              {monthlyData?.stats ? (
                <>
                  {/* 核心指标 */}
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-xl">
                      <div className="text-xs text-text-secondary mb-1">平均每日热量</div>
                      <div className="text-2xl font-bold text-primary">{monthlyData.stats.avgDailyCalories} kcal</div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-text-secondary mb-1">记录天数</div>
                      <div className="text-xl font-bold text-text-primary">
                        {monthlyData.stats.recordedDays} / {monthlyData.stats.totalDays} 天
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-text-secondary mb-2">热量控制</div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          ✅ 达标 {monthlyData.stats.targetDays}天
                        </span>
                        {monthlyData.stats.overDays > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                            ⚠️ 超标 {monthlyData.stats.overDays}天
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 营养素占比 */}
                  <div>
                    <div className="text-xs text-text-secondary mb-3">营养素平均占比</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-nutrient-protein"></div>
                        <span className="text-sm">蛋白质 {monthlyData.stats.avgProteinPercent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-nutrient-carbs"></div>
                        <span className="text-sm">碳水 {monthlyData.stats.avgCarbsPercent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-nutrient-fat"></div>
                        <span className="text-sm">脂肪 {monthlyData.stats.avgFatPercent}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 极值日 */}
                  {monthlyData.stats.maxCalorieDay && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <div className="text-xs text-text-secondary mb-2">关键日</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>🔥 最高</span>
                          <span className="font-bold">{monthlyData.stats.maxCalorieDay.calories} kcal</span>
                        </div>
                        {monthlyData.stats.minCalorieDay && (
                          <div className="flex justify-between">
                            <span>🌱 最低</span>
                            <span className="font-bold">{monthlyData.stats.minCalorieDay.calories} kcal</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-3">📝</p>
                  <p>本月还没有记录</p>
                  <p className="text-xs mt-2">开始记录您的餐食吧！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}