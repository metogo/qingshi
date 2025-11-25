'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import AILoadingAnimation from './AILoadingAnimation'

export default function ConversationalAnalysis({ onAnalysisComplete }) {
  const [mealDescription, setMealDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const examples = [
    "早餐：两个煮鸡蛋、一杯牛奶、一片全麦面包",
    "午餐：一碗米饭、100克鸡胸肉、一些西兰花",
    "晚餐：全麦吐司两片、番茄炒蛋、一个苹果"
  ];

  async function handleAnalyze() {
  if (!mealDescription.trim()) return;
  setAnalyzing(true);

  try {
    const response = await fetch('/api/meal/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mealDescription })
    });

    if (!response.ok) {
      throw new Error('分析失败');
    }

    const result = await response.json();
    console.log('key',process.env.OPENROUTER_API_KEY)
    if (result.success) {
      onAnalysisComplete?.(result);
      setMealDescription('');
    } else {
      alert('分析失败：' + (result.error || '未知错误'));
    }
  } catch (error) {
    console.error('对话分析错误:', error);
    console.log('env',process.env)
    console.log('key',process.env.OPENROUTER_API_KEY)
    alert('分析失败，请检查网络连接或稍后重试');
  } finally {
    setAnalyzing(false);
  }
}

// 如果正在分析，显示加载动画
if (analyzing) {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-white to-ai-blue/10 py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <AILoadingAnimation message="AI正在智能识别您的餐食..." />
      </div>
    </section>
  );
}

return (
  <section className="bg-gradient-to-br from-primary/10 via-white to-ai-blue/10 py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-ai-purple/10 text-ai-purple rounded-full text-sm font-semibold">
              ✨ AI智能识别
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">
            对话式记录，一句话搞定
          </h1>
          <p className="text-lg text-text-secondary">
            描述您的餐食，AI自动识别食材、计算营养、生成分析报告
          </p>
        </div>

        {/* 输入区域 */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border-2 border-gray-100">
          <textarea
            value={mealDescription}
            onChange={(e) => setMealDescription(e.target.value)}
            placeholder="请描述您的餐食，例如：&#10;&#10;早餐吃了两个煮鸡蛋、一杯250ml的牛奶和一片全麦面包&#10;&#10;午餐吃了一碗米饭、100克鸡胸肉和一些西兰花"
            disabled={analyzing}
            className="w-full h-36 p-4 border-2 border-gray-100 rounded-2xl text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none focus:outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          
          {/* 底部操作栏 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>💡</span>
              <span>描述越详细，AI识别越精准</span>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!mealDescription.trim() || analyzing}
              className="px-8 py-3 bg-gradient-to-r from-ai-blue via-ai-purple to-pink-500 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 shimmer-effect"></div>
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>AI智能分析中...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>🚀 开始智能分析</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 示例快捷按钮 */}
        <div className="mt-6">
          <div className="text-xs text-gray-500 mb-3 text-center">💡 或者试试这些示例</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setMealDescription(ex)}
                disabled={analyzing}
                className="text-xs px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-primary hover:text-primary hover:shadow-md transition-all disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}