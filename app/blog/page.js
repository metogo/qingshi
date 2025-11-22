import Link from 'next/link'
import { getSortedPostsData } from '../../lib/posts'
import { Calendar, Clock } from 'lucide-react'

export const metadata = {
  title: '健康资讯 - 轻食热量计算器',
  description: '提供科学的减脂知识、健康饮食建议和轻食食谱推荐。',
}

export default function BlogIndex() {
  const allPostsData = getSortedPostsData()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md">
          健康资讯
        </h1>
        <p className="text-white/90 text-lg">
          探索科学减脂的奥秘，获取专业的饮食建议
        </p>
      </div>

      <div className="grid gap-6">
        {allPostsData.map(({ id, date, title, description, readTime }) => (
          <Link href={`/blog/${id}`} key={id} className="block group">
            <article className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                {title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <time dateTime={date}>{date}</time>
                </div>
                {readTime && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{readTime}</span>
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}
        
        {allPostsData.length === 0 && (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl">
            <p className="text-gray-500">暂无文章，敬请期待...</p>
          </div>
        )}
      </div>
    </div>
  )
}