import { getPostData, getAllPostIds } from '../../../lib/posts'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const postData = await getPostData(params.slug)
  return {
    title: `${postData.title} - 轻食热量计算器`,
    description: postData.description,
  }
}

export async function generateStaticParams() {
  const paths = getAllPostIds()
  return paths
}

export default async function Post({ params }) {
  const postData = await getPostData(params.slug)

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/blog" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-1" /> 返回文章列表
      </Link>
      
      <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <header className="mb-8 border-b border-gray-100 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {postData.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <time dateTime={postData.date}>{postData.date}</time>
              </div>
              {postData.readTime && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{postData.readTime}</span>
                </div>
              )}
            </div>
          </header>

          <div 
            className="prose prose-lg prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
          />
        </div>
      </article>
    </div>
  )
}