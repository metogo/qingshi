'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Brain, Activity, CheckCircle } from 'lucide-react'

const loadingMessages = [
  "AI正在分析您的饮食搭配...",
  "正在计算宏量营养素比例...",
  "正在交叉对比健康饮食模型...",
  "即将生成个性化建议...",
  "一份科学的报告正在诞生...",
];

const analysisSteps = [
  { id: 1, text: "读取餐食列表", duration: 500 },
  { id: 2, text: "计算总热量及成本", duration: 1000 },
  { id: 3, text: "分析营养素配比", duration: 1500 },
  { id: 4, text: "生成改进建议", duration: 2000 },
  { id: 5, text: "评估适用人群", duration: 2500 },
];

export default function AILoadingAnimation({ message }) {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [completedSteps, setCompletedSteps] = useState(0);
  
  // 动态文案轮播
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setCurrentMessage(loadingMessages[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // 模拟进度清单
  useEffect(() => {
    const timers = analysisSteps.map((step, index) => {
      return setTimeout(() => {
        setCompletedSteps(index + 1);
      }, step.duration);
    });
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* 专属AI加载动画 */}
      <div className="relative mb-8">
        {/* 外圈旋转光环 */}
        <div className="absolute inset-0 animate-spin">
          <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-ai-blue border-r-ai-purple border-b-pink-500"></div>
        </div>
        
        {/* 中心AI图标 */}
        <div className="w-24 h-24 bg-gradient-to-br from-ai-blue via-ai-purple to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
          <div className="relative">
            <Brain className="text-white animate-pulse" size={40} />
            <Sparkles className="absolute -top-2 -right-2 text-yellow-300 animate-bounce" size={16} />
          </div>
        </div>
        
        {/* 内圈呼吸光晕 */}
        <div className="absolute inset-0 bg-gradient-to-br from-ai-blue/20 to-pink-500/20 rounded-full animate-ping"></div>
      </div>
      
      {/* 动态引导文案 */}
      <div className="text-center mb-8">
        <p className="text-lg font-semibold text-text-primary animate-pulse">
          {message || currentMessage}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Activity className="text-primary animate-pulse" size={16} />
          <span className="text-sm text-text-secondary">AI正在努力工作中</span>
        </div>
      </div>
      
      {/* 模拟进度清单 */}
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-ai-purple" />
          分析进度
        </h3>
        <div className="space-y-3">
          {analysisSteps.map((step, index) => {
            const isCompleted = index < completedSteps;
            const isActive = index === completedSteps;
            
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isCompleted ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-primary text-white' 
                    : isActive 
                      ? 'bg-primary/20 border-2 border-primary' 
                      : 'bg-gray-100'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={14} className="text-white" />
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  )}
                </div>
                <span className={`text-sm ${
                  isCompleted ? 'text-text-primary font-medium' : 'text-text-secondary'
                }`}>
                  {step.text}
                </span>
                {isActive && (
                  <span className="ml-auto text-xs text-ai-purple animate-pulse">进行中...</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 健康小贴士（可选） */}
      <div className="mt-6 max-w-md">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-xl">💡</span>
            <div>
              <div className="text-xs font-semibold text-yellow-800 mb-1">健康小贴士</div>
              <p className="text-xs text-yellow-700">
                一个中等大小的鸡蛋大约含有6克优质蛋白质，是早餐的理想选择。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}