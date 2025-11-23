'use client'

import CalorieCalculator from '../components/CalorieCalculator'
import ConversationalAnalysis from '../components/ConversationalAnalysis'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles, TrendingUp, DollarSign } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-bg-light min-h-screen">
      {/* 对话式分析区域 - 替换Hero */}
      <ConversationalAnalysis
        onAnalysisComplete={(result) => {
          // 滚动到计算器区域
          setTimeout(() => {
            document.getElementById('calculator')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }, 100);
          
          // 触发事件通知Calculator组件
          window.dispatchEvent(new CustomEvent('meal-analyzed', {
            detail: result
          }));
        }}
      />

      {/* Calculator Section */}
      <section id="calculator" className="py-12">
        <div className="container mx-auto px-6">
          <CalorieCalculator />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3">为什么选择我们</h2>
            <p className="text-text-secondary">专业、智能、高效的营养计算工具</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 card-hover group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-primary">精准数据</h3>
              <p className="text-text-secondary leading-relaxed">
                基于权威营养数据库，提供常见轻食食材的精准热量、蛋白质、碳水和脂肪数据
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 card-hover group">
              <div className="w-14 h-14 bg-ai-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <Sparkles className="text-ai-blue" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-primary">AI 智能建议</h3>
              <p className="text-text-secondary leading-relaxed">
                根据您的搭配实时计算总热量，并提供科学的饮食建议，避免热量过高或营养不均
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 card-hover group">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <DollarSign className="text-yellow-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-primary">成本估算</h3>
              <p className="text-text-secondary leading-relaxed">
                参考市场价格，为您估算每一餐的食材成本，让健康饮食既省心又省钱
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-16 bg-bg-light">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-2">健康资讯</h2>
              <p className="text-text-secondary">科学的营养知识，助您健康生活</p>
            </div>
            <Link 
              href="/blog" 
              className="text-primary hover:text-primary-dark flex items-center gap-1 font-semibold transition-colors"
            >
              查看更多 <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Link 
              href="/blog/calorie-deficit" 
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover"
            >
              <div className="p-8">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-3">
                  <CheckCircle2 size={16} />
                  <span>减脂指南</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                  什么是热量缺口？如何科学减脂？
                </h3>
                <p className="text-text-secondary leading-relaxed line-clamp-2">
                  减脂的核心在于制造热量缺口。本文将详细解释热量缺口的原理，以及如何计算适合自己的热量摄入目标
                </p>
              </div>
            </Link>
            
            <Link 
              href="/blog/low-calorie-foods" 
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover"
            >
              <div className="p-8">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-3">
                  <CheckCircle2 size={16} />
                  <span>食材推荐</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                  10种常见的低卡路里、高蛋白食物推荐
                </h3>
                <p className="text-text-secondary leading-relaxed line-clamp-2">
                  想要吃得饱又不长胖？这10种食物是减脂期的最佳选择，高蛋白低热量，助你轻松瘦身
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}