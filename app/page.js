import CalorieCalculator from '../components/CalorieCalculator'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md">
          科学减脂，从计算每一餐开始
        </h1>
        <p className="text-xl text-white/90 max-w-2xl mx-auto">
          专业的轻食热量计算器，助您轻松规划健康饮食，精准控制热量摄入，实现理想身材。
        </p>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="max-w-5xl mx-auto">
        <CalorieCalculator />
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto py-8">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">精准数据</h3>
          <p className="text-gray-600">
            基于权威营养数据库，提供常见轻食食材的精准热量、蛋白质、碳水和脂肪数据。
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">智能建议</h3>
          <p className="text-gray-600">
            根据您的搭配实时计算总热量，并提供科学的饮食建议，避免热量过高或营养不均。
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">成本估算</h3>
          <p className="text-gray-600">
            参考市场价格，为您估算每一餐的食材成本，让健康饮食既省心又省钱。
          </p>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="max-w-5xl mx-auto py-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-white">健康资讯</h2>
          <Link href="/blog" className="text-white/90 hover:text-white flex items-center gap-1 text-sm">
            查看更多 <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/blog/calorie-deficit" className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                什么是热量缺口？如何科学减脂？
              </h3>
              <p className="text-gray-600 line-clamp-2">
                减脂的核心在于制造热量缺口。本文将详细解释热量缺口的原理，以及如何计算适合自己的热量摄入目标。
              </p>
            </div>
          </Link>
          <Link href="/blog/low-calorie-foods" className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                10种常见的低卡路里、高蛋白食物推荐
              </h3>
              <p className="text-gray-600 line-clamp-2">
                想要吃得饱又不长胖？这10种食物是减脂期的最佳选择，高蛋白低热量，助你轻松瘦身。
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}